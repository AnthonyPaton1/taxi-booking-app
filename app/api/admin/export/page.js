import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import archiver from 'archiver';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { format = 'json' } = await request.json();

    // Fetch all data - comprehensive export for GDPR compliance
    const [
      users,
      admins,
      coordinators,
      managers,
      drivers,
      businesses,
      advancedBookings,
      instantBookings,
      bids,
      areas,
      feedbackReports
    ] = await Promise.all([
      // Users (sanitized - no passwords)
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          emailVerified: true
        }
      }),
      
      // Admins
      prisma.admin.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
              createdAt: true
            }
          }
        }
      }),
      
      // Coordinators
      prisma.coordinator.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
              createdAt: true
            }
          },
          area: true,
          businesses: {
            include: {
              managers: true
            }
          }
        }
      }),
      
      // Managers
      prisma.manager.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
              createdAt: true
            }
          },
          business: true,
          coordinator: {
            include: {
              area: true
            }
          }
        }
      }),
      
      // Drivers
      prisma.driver.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
              createdAt: true
            }
          },
          accessibilityProfile: true,
          vehicle: true
        }
      }),
      
      // Businesses
      prisma.business.findMany({
        include: {
          coordinator: {
            include: {
              area: true,
              user: {
                select: {
                  email: true,
                  name: true
                }
              }
            }
          },
          managers: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      
      // Advanced Bookings
      prisma.advancedBooking.findMany({
        include: {
          business: {
            select: {
              name: true,
              id: true
            }
          },
          creator: {
            select: {
              email: true,
              name: true
            }
          },
          bids: {
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
          },
          winningBid: {
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

      // Instant Bookings
      prisma.instantBooking.findMany({
        include: {
          business: {
            select: {
              name: true,
              id: true
            }
          },
          creator: {
            select: {
              email: true,
              name: true
            }
          },
          acceptedDriver: {
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
      
      // Bids
      prisma.bid.findMany({
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
      
      // Areas
      prisma.area.findMany({
        include: {
          coordinators: {
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
      
      // Feedback/Incident Reports
      prisma.feedbackReport.findMany({
        include: {
          reporter: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          advancedBooking: {
            select: {
              pickupLocation: true,
              dropoffLocation: true,
              pickupTime: true
            }
          },
          instantBooking: {
            select: {
              pickupLocation: true,
              dropoffLocation: true,
              pickupTime: true
            }
          }
        }
      })
    ]);

    // Calculate statistics
    const stats = {
      exportDate: new Date().toISOString(),
      exportedBy: session.user.email,
      totalUsers: users.length,
      totalAdmins: admins.length,
      totalCoordinators: coordinators.length,
      totalManagers: managers.length,
      totalDrivers: drivers.length,
      totalBusinesses: businesses.length,
      totalAdvancedBookings: advancedBookings.length,
      totalInstantBookings: instantBookings.length,
      totalBids: bids.length,
      totalAreas: areas.length,
      totalIncidentReports: feedbackReports.length,
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
      },
      driverApprovalStatus: {
        pending: drivers.filter(d => d.approvalStatus === 'PENDING').length,
        approved: drivers.filter(d => d.approvalStatus === 'APPROVED').length,
        rejected: drivers.filter(d => d.approvalStatus === 'REJECTED').length
      }
    };

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: session.user.email,
        format,
        dataRetentionPolicy: '7 years for financial records',
        gdprCompliance: 'Full business data export as per GDPR Article 15 & 20'
      },
      statistics: stats,
      data: {
        users,
        admins,
        coordinators,
        managers,
        drivers,
        businesses,
        advancedBookings,
        instantBookings,
        bids,
        areas,
        incidentReports: feedbackReports
      }
    };

    if (format === 'json') {
      // Return as JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const buffer = Buffer.from(jsonString, 'utf-8');

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="neat_data_export_${new Date().toISOString().split('T')[0]}.json"`,
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
      archive.append(JSON.stringify(exportData.metadata, null, 2), { name: 'metadata.json' });
      archive.append(JSON.stringify(exportData.statistics, null, 2), { name: 'statistics.json' });

      // Add each data type as separate file
      archive.append(JSON.stringify(users, null, 2), { name: 'users.json' });
      archive.append(JSON.stringify(admins, null, 2), { name: 'admins.json' });
      archive.append(JSON.stringify(coordinators, null, 2), { name: 'coordinators.json' });
      archive.append(JSON.stringify(managers, null, 2), { name: 'managers.json' });
      archive.append(JSON.stringify(drivers, null, 2), { name: 'drivers.json' });
      archive.append(JSON.stringify(businesses, null, 2), { name: 'businesses.json' });
      archive.append(JSON.stringify(advancedBookings, null, 2), { name: 'advanced_bookings.json' });
      archive.append(JSON.stringify(instantBookings, null, 2), { name: 'instant_bookings.json' });
      archive.append(JSON.stringify(bids, null, 2), { name: 'bids.json' });
      archive.append(JSON.stringify(areas, null, 2), { name: 'areas.json' });
      archive.append(JSON.stringify(feedbackReports, null, 2), { name: 'incident_reports.json' });

      await archive.finalize();
      const zipBuffer = await zipPromise;

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="neat_data_export_${new Date().toISOString().split('T')[0]}.zip"`,
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