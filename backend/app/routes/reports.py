import csv
import io
from flask import Blueprint, Response
from app.models import db, MinePurchase, FactorySale, Lorry, TripRecord, FuelRecord

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/export/mine', methods=['GET'])
def export_mine():
    purchases = MinePurchase.query.order_by(MinePurchase.date.desc()).all()
    
    # Create an in-memory string buffer
    si = io.StringIO()
    cw = csv.writer(si)
    
    # Write Headers
    cw.writerow(['ID', 'Date', 'Mine Name', 'Material', 'Tonnes', 'Cost/Ton', 'GST %', 'Loading', 'Transport', 'Total Buying', 'Status'])
    
    for p in purchases:
        cw.writerow([
            p.id, p.date.strftime("%Y-%m-%d"), p.mine_name, p.material_name, 
            p.tonnes, p.cost_per_ton, p.gst_percentage, p.loading_charges, 
            p.transport_hire, p.total_buying, p.payment_status
        ])
    
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=mine_purchases.csv"}
    )

@reports_bp.route('/export/factory', methods=['GET'])
def export_factory():
    sales = FactorySale.query.order_by(FactorySale.date.desc()).all()
    
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['ID', 'Date', 'Factory', 'Material', 'Tonnes', 'Rate', 'GST %', 'Total Sales', 'Received', 'Pending', 'Status'])
    
    for s in sales:
        cw.writerow([
            s.id, s.date.strftime("%Y-%m-%d"), s.factory_name, s.material_name,
            s.tonnes, s.selling_price_per_ton, s.gst_percentage, s.total_sales_amount,
            s.payment_received, s.payment_pending, s.payment_status
        ])
    
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=factory_sales.csv"}
    )

from app.services.pdf_service import generate_invoice_pdf

@reports_bp.route('/invoice/pdf/<int:sale_id>', methods=['GET'])
def get_invoice_pdf(sale_id):
    sale = FactorySale.query.get_or_404(sale_id)
    pdf_bytes = generate_invoice_pdf(sale)
    
    return Response(
        pdf_bytes,
        mimetype="application/pdf",
        headers={"Content-Disposition": f"attachment;filename=invoice_INV-{sale.id:05d}.pdf"}
    )
