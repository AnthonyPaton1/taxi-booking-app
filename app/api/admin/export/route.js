import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import archiver from 'archiver';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin user with business relationship
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        business: true, // Get the business this admin belongs to
      }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!adminUser.businessId) {
      return NextResponse.json({ 
        error: 'No business associated with this admin account' 
      }, { status: 400 });
    }

    const businessId = adminUser.businessId;
    const { format = 'json' } = await request.json();

    // Fetch ONLY data for this business
    const [
      business,
      houses,
      managers,
      residents,
      advancedBookings,
      instantBookings,
      bids,
      incidents
    ] = await Promise.all([
      // Business info
      prisma.business.findUnique({
        where: { id: businessId },
        include: {
          adminUser: {
            select: {
              email: true,
              name: true,
              phone: true,
              createdAt: true
            }
          }
        }
      }),
      
      // Houses belonging to this business
      prisma.house.findMany({
        where: { 
          businessId: businessId,
          deletedAt: null
        },
        include: {
          area: {
            select: {
              name: true
            }
          },
          manager: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          },
          residents: {
            select: {
              id: true,
              name: true,
              createdAt: true
            }
          }
        }
      }),
      
      // Managers in this business
      prisma.user.findMany({
        where: {
          businessId: businessId,
          role: 'MANAGER',
          deletedAt: null
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          emailVerified: true
        }
      }),
      
      // Residents in houses owned by this business
      prisma.resident.findMany({
        where: {
          house: {
            businessId: businessId
          }
        },
        include: {
          house: {
            select: {
              label: true,
              line1: true,
              city: true,
              postcode: true
            }
          }
        }
      }),
      
      // Advanced Bookings for this business
      prisma.advancedBooking.findMany({
        where: {
          businessId: businessId
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true
            }
          },
          bids: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      phone: true
                    }
                  }
                }
              }
            }
          },
          acceptedBid: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      }),

      // Instant Bookings for this business
      prisma.instantBooking.findMany({
        where: {
          businessId: businessId
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      
      // Bids for this business's bookings
      prisma.bid.findMany({
        where: {
          advancedBooking: {
            businessId: businessId
          }
        },
        include: {
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          advancedBooking: {
            select: {
              pickupLocation: true,
              dropoffLocation: true,
              pickupTime: true,
              status: true
            }
          }
        }
      }),
      
      // Incidents for this business
      prisma.incident.findMany({
        where: {
          businessId: businessId
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          house: {
            select: {
              label: true,
              line1: true,
              city: true,
              postcode: true
            }
          }
        }
      })
    ]);

    // Calculate statistics for THIS BUSINESS ONLY
    const stats = {
      exportDate: new Date().toISOString(),
      exportedBy: session.user.email,
      businessName: business?.name,
      businessId: businessId,
      totalHouses: houses.length,
      totalManagers: managers.length,
      totalResidents: residents.length,
      totalAdvancedBookings: advancedBookings.length,
      totalInstantBookings: instantBookings.length,
      totalBids: bids.length,
      totalIncidents: incidents.length,
      advancedBookingsByStatus: {
        pending: advancedBookings.filter(r => r.status === 'PENDING').length,
        accepted: advancedBookings.filter(r => r.status === 'ACCEPTED').length,
        in_progress: advancedBookings.filter(r => r.status === 'IN_PROGRESS').length,
        completed: advancedBookings.filter(r => r.status === 'COMPLETED').length,
        cancelled: advancedBookings.filter(r => r.status === 'CANCELLED').length
      },
      instantBookingsByStatus: {
        pending: instantBookings.filter(r => r.status === 'PENDING').length,
        accepted: instantBookings.filter(r => r.status === 'ACCEPTED').length,
        in_progress: instantBookings.filter(r => r.status === 'IN_PROGRESS').length,
        completed: instantBookings.filter(r => r.status === 'COMPLETED').length,
        cancelled: instantBookings.filter(r => r.status === 'CANCELLED').length
      }
    };

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: session.user.email,
        businessName: business?.name,
        businessId: businessId,
        format,
        dataRetentionPolicy: '7 years for financial records',
        gdprCompliance: 'Business data export as per GDPR Article 15 & 20',
        scope: 'This export contains data only for your business'
      },
      statistics: stats,
      data: {
        business,
        houses,
        managers,
        residents,
        advancedBookings,
        instantBookings,
        bids,
        incidents
      }
    };

    if (format === 'json') {
      // Return as JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const buffer = Buffer.from(jsonString, 'utf-8');

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${business?.name.replace(/\s+/g, '_')}_data_export_${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Length': buffer.length.toString()
        }
      });
    } else if (format === 'zip') {
      // Create ZIP with separate JSON files for each entity type
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      const chunks = [];
      archive.on('data', (chunk) => chunks.push(chunk));

      const zipPromise = new Promise((resolve, reject) => {
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
      });

      // Add metadata
      archive.append(JSON.stringify(exportData.metadata, null, 2), { name: 'metadata.txt' });
      archive.append(JSON.stringify(exportData.statistics, null, 2), { name: 'statistics.txt' });

      // Add each data type as separate file
      archive.append(JSON.stringify(business, null, 2), { name: 'business.txt' });
      archive.append(JSON.stringify(houses, null, 2), { name: 'houses.txt' });
      archive.append(JSON.stringify(managers, null, 2), { name: 'managers.txt' });
      archive.append(JSON.stringify(residents, null, 2), { name: 'residents.txt' });
      archive.append(JSON.stringify(advancedBookings, null, 2), { name: 'advanced_bookings.txt' });
      archive.append(JSON.stringify(instantBookings, null, 2), { name: 'instant_bookings.txt' });
      archive.append(JSON.stringify(bids, null, 2), { name: 'bids.txt' });
      archive.append(JSON.stringify(incidents, null, 2), { name: 'incidents.txt' });

      await archive.finalize();
      const zipBuffer = await zipPromise;

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${business?.name.replace(/\s+/g, '_')}_data_export_${new Date().toISOString().split('T')[0]}.zip"`,
          'Content-Length': zipBuffer.length.toString()
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error.message },
      { status: 500 }
    );
  }
}