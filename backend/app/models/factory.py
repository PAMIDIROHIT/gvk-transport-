from . import db
from datetime import datetime

class FactoryLoading(db.Model):
    """
    Records when material is loaded onto transport for the factory.
    This is the first step before a final sale is confirmed.
    """
    id = db.Column(db.Integer, primary_key=True)
    vendor_name = db.Column(db.String(100), nullable=False)    # Who we are using for transport if not our own
    date = db.Column(db.DateTime, default=datetime.utcnow)
    tonnes = db.Column(db.Float, nullable=False)               # Weight loaded
    rate = db.Column(db.Float, nullable=False)                 # Transport rate
    total_amount = db.Column(db.Float, nullable=False)         # Calculated total transport cost

class FactorySale(db.Model):
    """
    Records the final sale of material to a factory.
    Professional tracking with invoice and vehicle details.
    """
    id = db.Column(db.Integer, primary_key=True)
    loading_id = db.Column(db.Integer, db.ForeignKey('factory_loading.id'), nullable=True) # Optional link
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Tracking Details (10/10 State)
    invoice_number = db.Column(db.String(50), unique=True)
    factory_name = db.Column(db.String(100), nullable=False)
    material_name = db.Column(db.String(100), nullable=False)
    vehicle_number = db.Column(db.String(20))
    driver_name = db.Column(db.String(100))
    destination = db.Column(db.String(100))
    
    # Financials
    tonnes = db.Column(db.Float, nullable=False)
    selling_price_per_ton = db.Column(db.Float, nullable=False)
    gst_percentage = db.Column(db.Float, default=18.0)
    total_sales_amount = db.Column(db.Float, nullable=False)
    
    # Payment Tracking
    advanced_payment = db.Column(db.Float, default=0.0)      # Paid at loading/gate
    payment_received = db.Column(db.Float, default=0.0)      # Transferred to bank
    payment_pending = db.Column(db.Float, default=0.0)       # Net remaining
    due_date = db.Column(db.DateTime, nullable=True)
    payment_status = db.Column(db.String(50), default='PENDING') # [PAID, PARTIAL, PENDING]
