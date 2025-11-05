import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';
import archiver from 'archiver';
import { generateResidentInvoicePDF } from '@/lib/pdf-generator';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a manager
    const manager = await prisma.manager.findUnique({
      where: { userId: session.user.id },
      include: {
        business: true
      }
    });

    if (!manager) {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    const { month, year } = await request.json();

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    // Get date range for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch completed advanced bookings for this business in the specified month
    const advancedBookings = await prisma.advancedBooking.findMany({
      where: {
        businessId: manager.businessId,
        pickupTime: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        winningBid: {
          include: {
            driver: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        pickupTime: 'asc'
      }
    });

    // Fetch completed instant bookings for this business in the specified month
    const instantBookings = await prisma.instantBooking.findMany({
      where: {
        businessId: manager.businessId,
        pickupTime: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        acceptedDriver: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        pickupTime: 'asc'
      }
    });

    // Combine and normalize bookings
    const allBookings = [
      ...advancedBookings.map(booking => ({
        id: booking.id,
        type: 'ADVANCED',
        pickupTime: booking.pickupTime,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        residentInitials: booking.residentInitials,
        amountCents: booking.winningBid?.amountCents || 0,
        driverName: booking.winningBid?.driver?.user?.name || 'N/A'
      })),
      ...instantBookings.map(booking => ({
        id: booking.id,
        type: 'INSTANT',
        pickupTime: booking.pickupTime,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        residentInitials: booking.residentInitials,
        amountCents: booking.finalAmountCents || 0,
        driverName: booking.acceptedDriver?.user?.name || 'N/A'
      }))
    ].sort((a, b) => a.pickupTime.getTime() - b.pickupTime.getTime());

    if (allBookings.length === 0) {
      return NextResponse.json({ 
        error: 'No completed bookings found for this period' 
      }, { status: 404 });
    }

    // Group bookings by resident
    const bookingsByResident = allBookings.reduce((acc, booking) => {
      const key = booking.residentInitials || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(booking);
      return acc;
    }, {});

    // Generate PDFs for each resident
    const pdfBuffers = [];

    for (const [residentInitials, residentBookings] of Object.entries(bookingsByResident)) {
      const items = residentBookings.map(booking => ({
        date: booking.pickupTime,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        amount: booking.amountCents / 100,
        rideType: booking.type === 'ADVANCED' ? 'Advanced' : 'Instant',
        driverName: booking.driverName
      }));

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const vat = subtotal * 0.2;
      const total = subtotal + vat;

      const invoiceNumber = `INV-${year}${String(month).padStart(2, '0')}-${manager.businessId.substring(0, 8)}-${residentInitials}`;
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

      const pdfData = {
        invoiceNumber,
        residentName: residentInitials,
        residentInitials,
        businessName: manager.business.name,
        businessAddress: manager.business.address || 'Address on file',
        month: monthNames[month - 1],
        year: String(year),
        items,
        subtotal,
        vat,
        total
      };

      try {
        const buffer = await generateResidentInvoicePDF(pdfData);
        
        const safeResidentName = residentInitials.replace(/[^a-z0-9]/gi, '_');
        pdfBuffers.push({
          filename: `${year}-${String(month).padStart(2, '0')}_${safeResidentName}.pdf`,
          buffer
        });
      } catch (pdfError) {
        console.error(`Error generating PDF for ${residentInitials}:`, pdfError);
        // Continue with other residents even if one fails
      }
    }

    if (pdfBuffers.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate any PDFs' 
      }, { status: 500 });
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const chunks = [];
    
    archive.on('data', (chunk) => chunks.push(chunk));
    
    const zipPromise = new Promise((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    // Add PDFs to archive
    for (const { filename, buffer } of pdfBuffers) {
      archive.append(buffer, { name: filename });
    }

    await archive.finalize();
    const zipBuffer = await zipPromise;

    // Return ZIP file
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const zipFilename = `Invoices_${monthNames[month - 1]}_${year}.zip`;

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating invoices:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoices', details: error.message },
      { status: 500 }
    );
  }
}