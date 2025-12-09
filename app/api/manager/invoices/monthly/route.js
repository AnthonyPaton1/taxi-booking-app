//api/manager/invoices/monthly/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        business: true
      }
    });

    if (!user || user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    if (!user.businessId) {
      return NextResponse.json({ error: 'No business associated with this manager' }, { status: 400 });
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
        businessId: user.businessId,
        pickupTime: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        acceptedBid: {
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
        businessId: user.businessId,
        pickupTime: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        driver: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        pickupTime: 'asc'
      }
    });

    // Process bookings and split costs across residents
    const allBookingItems = [];

    // Process advanced bookings
    for (const booking of advancedBookings) {
      const totalCost = booking.acceptedBid?.amountCents || 0;
      const initialsArray = booking.initials || [];
      const costPerPerson = initialsArray.length > 0 ? totalCost / initialsArray.length : totalCost;
      
      for (const initial of initialsArray) {
        allBookingItems.push({
          residentInitials: initial,
          pickupTime: booking.pickupTime,
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          amountCents: Math.round(costPerPerson),
          rideType: 'Advanced',
          driverName: booking.acceptedBid?.driver?.user?.name || 'N/A',
          sharedWith: initialsArray.length > 1 ? initialsArray.length : null
        });
      }
    }

    // Process instant bookings
    for (const booking of instantBookings) {
      const totalCost = booking.finalCostPence || 0;
      const initialsArray = booking.initials || [];
      const costPerPerson = initialsArray.length > 0 ? totalCost / initialsArray.length : totalCost;
      
      for (const initial of initialsArray) {
        allBookingItems.push({
          residentInitials: initial,
          pickupTime: booking.pickupTime,
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          amountCents: Math.round(costPerPerson),
          rideType: 'Instant',
          driverName: booking.driver?.user?.name || 'N/A',
          sharedWith: initialsArray.length > 1 ? initialsArray.length : null
        });
      }
    }

    // Sort all items by pickup time
    allBookingItems.sort((a, b) => a.pickupTime.getTime() - b.pickupTime.getTime());

    if (allBookingItems.length === 0) {
      return NextResponse.json({ 
        error: 'No completed bookings found for this period' 
      }, { status: 404 });
    }

    // Group by resident
    const bookingsByResident = allBookingItems.reduce((acc, item) => {
      const key = item.residentInitials || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
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
        rideType: booking.sharedWith ? `${booking.rideType} (Shared with ${booking.sharedWith})` : booking.rideType,
        driverName: booking.driverName
      }));

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const vat = subtotal * 0.2;
      const total = subtotal + vat;

      const invoiceNumber = `INV-${year}${String(month).padStart(2, '0')}-${user.businessId.substring(0, 8)}-${residentInitials}`;
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

      const pdfData = {
        invoiceNumber,
        residentName: residentInitials,
        residentInitials,
        businessName: user.business.name,
        businessAddress: user.business.address || 'Address on file',
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