// PDF Generator for Monthly Resident Invoices

export async function generateResidentInvoicePDF(data) {
  // Dynamic import for PDFKit to work in Next.js
  const PDFDocument = (await import('pdfkit')).default;
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        bufferPages: true
      });
      
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        } catch (err) {
          reject(err);
        }
      });
      doc.on('error', (err) => reject(err));

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('MONTHLY INVOICE', 50, 50);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice #: ${data.invoiceNumber}`, 50, 80)
        .text(`Period: ${data.month} ${data.year}`, 50, 95)
        .text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 50, 110);

      // Business details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:', 50, 140);
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(data.businessName, 50, 160)
        .text(data.businessAddress, 50, 175);

      // Resident details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Resident:', 350, 140);
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(data.residentName, 350, 160)
        .text(`Initials: ${data.residentInitials}`, 350, 175);

      // Table header
      const tableTop = 220;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Date', 50, tableTop)
        .text('Pickup', 100, tableTop)
        .text('Dropoff', 200, tableTop)
        .text('Type', 300, tableTop)
        .text('Driver', 360, tableTop)
        .text('Amount', 480, tableTop);

      // Draw line under header
      doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table rows
      doc.font('Helvetica').fontSize(9);
      let yPosition = tableTop + 25;

      data.items.forEach((item, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        const formattedDate = new Date(item.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit'
        });

        doc
          .text(formattedDate, 50, yPosition, { width: 40 })
          .text(truncateText(item.pickupLocation, 15), 100, yPosition, { width: 90 })
          .text(truncateText(item.dropoffLocation, 15), 200, yPosition, { width: 90 })
          .text(item.rideType, 300, yPosition, { width: 50 })
          .text(truncateText(item.driverName, 12), 360, yPosition, { width: 110 })
          .text(`£${item.amount.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });

        yPosition += 20;

        // Add separator line every 5 items for readability
        if ((index + 1) % 5 === 0 && index < data.items.length - 1) {
          doc
            .strokeColor('#eeeeee')
            .lineWidth(0.5)
            .moveTo(50, yPosition - 5)
            .lineTo(550, yPosition - 5)
            .stroke();
        }
      });

      // Totals section
      yPosition += 20;
      
      // Make sure we have room for totals, add page if needed
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(350, yPosition)
        .lineTo(550, yPosition)
        .stroke();

      yPosition += 15;
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', 350, yPosition)
        .text(`£${data.subtotal.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });

      yPosition += 20;
      doc
        .text('VAT (20%):', 350, yPosition)
        .text(`£${data.vat.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });

      yPosition += 20;
      doc
        .strokeColor('#000000')
        .lineWidth(1)
        .moveTo(350, yPosition - 5)
        .lineTo(550, yPosition - 5)
        .stroke();

      yPosition += 10;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total:', 350, yPosition)
        .text(`£${data.total.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });

      // Footer - use absolute position at bottom of page
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 80;
      
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'This invoice is for record-keeping purposes. Payment terms as per your service agreement.',
          50,
          footerY,
          { align: 'center', width: 500 }
        );

      doc
        .fontSize(7)
        .text(
          'NEAT Transport - Accessible Transport Services',
          50,
          footerY + 20,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error);
    }
  });
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 2) + '..';
}