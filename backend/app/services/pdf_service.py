from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import io
import datetime

def generate_invoice_pdf(sale_record):
    """
    Takes a FactorySale SQLAlchemy object and returns a raw PDF byte buffer.
    Branding: Jay Shree Krishna Polymers
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    header_style = ParagraphStyle(
        'HeaderStyle', parent=styles['Heading1'], fontSize=20, leading=24, 
        alignment=1, spaceAfter=10, textColor=colors.HexColor('#1E2A38')
    )
    subhead_style = ParagraphStyle(
        'SubHead', parent=styles['Normal'], fontSize=10, alignment=1, spaceAfter=20, textColor=colors.gray
    )
    
    invoice_title_style = ParagraphStyle(
        'InvoiceTitle', parent=styles['Heading2'], fontSize=16, alignment=0, spaceAfter=15
    )

    # 1. Company Header
    elements.append(Paragraph("<b>JAY SHREE KRISHNA POLYMERS</b>", header_style))
    elements.append(Paragraph("Industrial Estate, Transport Wing<br/>GSTIN: 29XXXXX0000X1Z5<br/>Support: +91 99999 00000", subhead_style))
    
    # Spacer
    elements.append(Spacer(1, 20))
    
    # 2. Invoice Meta (To / Date / Invoice #)
    elements.append(Paragraph("<b>TAX INVOICE</b>", invoice_title_style))
    
    meta_data = [
        ["Invoice No:", f"INV-{sale_record.id:05d}", "Date:", sale_record.date.strftime("%d %b %Y")],
        ["Billed To:", sale_record.factory_name, "Due Date:", sale_record.due_date.strftime("%d %b %Y") if sale_record.due_date else "Upon Receipt"],
        ["Status:", sale_record.payment_status, "", ""]
    ]
    meta_table = Table(meta_data, colWidths=[80, 200, 80, 160])
    meta_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('FONT', (2, 0), (2, -1), 'Helvetica-Bold', 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (1, 2), (1, 2), colors.HexColor('#E74C3C') if sale_record.payment_pending > 0 else colors.HexColor('#27AE60'))
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 30))

    # 3. Line Items Table
    item_data = [["Item Description", "Qty (Tons)", "Rate/Ton", "Tax %", "Amount"]]
    
    # The actual line item
    base_amount = float(sale_record.tonnes) * float(sale_record.selling_price_per_ton)
    gst_amount = (base_amount * float(sale_record.gst_percentage)) / 100.0
    
    item_data.append([
        sale_record.material_name,
        f"{float(sale_record.tonnes):.2f} T",
        f"Rs. {float(sale_record.selling_price_per_ton):,.2f}",
        f"{sale_record.gst_percentage}%",
        f"Rs. {base_amount:,.2f}"
    ])
    
    # Add subtotals
    item_data.append(["", "", "", "Base Amount:", f"Rs. {base_amount:,.2f}"])
    item_data.append(["", "", "", f"GST ({sale_record.gst_percentage}%):", f"Rs. {gst_amount:,.2f}"])
    item_data.append(["", "", "", "GRAND TOTAL:", f"Rs. {sale_record.total_sales_amount:,.2f}"])
    
    item_table = Table(item_data, colWidths=[200, 80, 90, 80, 90])
    item_table.setStyle(TableStyle([
        # Header formatting
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E2A38')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        
        # Grid lines
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ('BOX', (0, 0), (-1, -1), 0.25, colors.black),
        
        # Alignment
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Font for body
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        
        # Make Total Bold
        ('FONTNAME', (3, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (3, -1), (-1, -1), colors.HexColor('#F8F9F9')),
    ]))
    
    elements.append(item_table)
    elements.append(Spacer(1, 40))
    
    # 4. Footer & Signatures
    elements.append(Paragraph("<i>Computer generated invoice, no physical signature required.</i>", ParagraphStyle("small", parent=styles['Normal'], fontSize=8, textColor=colors.gray)))

    # Process PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
