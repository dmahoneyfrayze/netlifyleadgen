import jsPDF from 'jspdf';
import { type Addon } from '@/types';
import { formatCurrency } from './format-utils';

export const generateQuotePDF = (selectedAddons: Addon[], totalPrice: number, formData?: any) => {
  // Create new document with slightly larger format for better layout
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [800, 1100]
  });
  
  // Set dark background color
  doc.setFillColor(24, 28, 49); // Dark navy background
  doc.rect(0, 0, 800, 1100, 'F');
  
  // Starting Y position
  let yPos = 60;
  
  // Add Frayze logo and branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  
  // Add lightning bolt symbol (simplified)
  doc.setFillColor(111, 76, 255); // Purple color
  doc.triangle(40, yPos - 20, 60, yPos - 30, 50, yPos, 'F');
  
  // Add FRAYZE text
  doc.text('FRAYZE', 80, yPos);
  
  yPos += 80;
  
  // Add CUSTOM QUOTE text
  doc.setFontSize(48);
  doc.text('CUSTOM QUOTE', 40, yPos);
  
  yPos += 40;
  
  // Add date
  doc.setFontSize(24);
  doc.setTextColor(200, 200, 200);
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  doc.text(formattedDate, 40, yPos);
  
  yPos += 80;

  // Add contact information if available
  if (formData) {
    doc.setFontSize(16);
    doc.setTextColor(200, 200, 200);
    
    if (formData.businessName) {
      doc.text(`Business: ${formData.businessName}`, 40, yPos);
      yPos += 25;
    }
    
    if (formData.contactName) {
      doc.text(`Contact: ${formData.contactName}`, 40, yPos);
      yPos += 25;
    }
    
    if (formData.email) {
      doc.text(`Email: ${formData.email}`, 40, yPos);
      yPos += 25;
    }
    
    if (formData.phone) {
      doc.text(`Phone: ${formData.phone}`, 40, yPos);
      yPos += 25;
    }

    yPos += 20;
  }
  
  // Add "YOUR CHOSEN GROWTH TOOLS" section
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('YOUR CHOSEN GROWTH TOOLS', 40, yPos);
  
  yPos += 40;
  
  // List selected services with improved layout
  doc.setFontSize(24);
  selectedAddons.forEach(addon => {
    // Draw a subtle line above each item
    doc.setDrawColor(111, 76, 255);
    doc.setLineWidth(0.5);
    doc.line(40, yPos - 15, 760, yPos - 15);
    
    const price = addon.pricing.type === 'inquire' 
      ? 'Quote Required'
      : formatCurrency(addon.pricing.amount || 0);
      
    // Service name on left
    doc.text(addon.name, 40, yPos);
    
    // Price on right, aligned
    doc.text(price, 760, yPos, { align: 'right' });
    
    yPos += 40;
  });
  
  yPos += 60;
  
  // Add "PROJECTED MONTHLY INVESTMENT" section
  doc.setFontSize(32);
  doc.text('PROJECTED MONTHLY INVESTMENT', 40, yPos);
  
  yPos += 60;
  
  // Add "Total" and amount with improved styling
  doc.setFontSize(48);
  doc.text('Total', 40, yPos);
  doc.setTextColor(111, 76, 255); // Purple highlight for total amount
  doc.text(formatCurrency(totalPrice), 760, yPos, { align: 'right' });
  
  yPos += 80;
  
  // Add "Need more firepower?" text with improved styling
  doc.setFontSize(24);
  doc.setTextColor(200, 200, 200);
  doc.text("Need more firepower? Let's talk custom CRM,", 40, yPos);
  yPos += 30;
  doc.text("SMS automation, or AI tools.", 40, yPos);
  
  // Add footer
  const footerY = 1000;
  doc.setFontSize(20);
  doc.setTextColor(200, 200, 200);
  
  // Website and email
  doc.text('frayze.ca', 40, footerY);
  doc.text('hello@frayze.ca', 760, footerY, { align: 'right' });
  
  // Add disclaimer
  doc.setFontSize(16);
  doc.setTextColor(150, 150, 150);
  doc.text("This is your starting line. Final numbers may adjust based on custom needs – let's chat!", 40, footerY + 30);
  
  // Save the PDF with a more descriptive name
  const fileName = formData?.businessName 
    ? `frayze-quote-${formData.businessName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    : 'frayze-custom-quote.pdf';
    
  doc.save(fileName);
}; 