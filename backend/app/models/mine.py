from . import db
from datetime import datetime

class MinePurchase(db.Model):
    """
    Records materials bought from the mine by GVK Transport.
    """
    id = db.Column(db.Integer, primary_key=True)
    mine_name = db.Column(db.String(100), nullable=False)     # NEW: Specific Mine name
    material_name = db.Column(db.String(100), nullable=False) # E.g., Iron Ore, Coal
    date = db.Column(db.DateTime, default=datetime.utcnow)    # When it was bought
    tonnes = db.Column(db.Float, nullable=False)              # Quantity brought
    cost_per_ton = db.Column(db.Float, nullable=False)        # Base cost of one ton
    gst_percentage = db.Column(db.Float, default=18.0)        # Tax applied (usually 18%)
    
    # NEW EXPENSE TRACKING FIELDS
    loading_charges = db.Column(db.Float, default=0.0)        # Loading money
    transport_hire = db.Column(db.Float, default=0.0)         # If using outside vehicle for mine transport
    
    total_buying = db.Column(db.Float, nullable=False)        # Calculated: (cost * tonnes) + tax + loading + transport
    payment_status = db.Column(db.String(50), default='PENDING') # NEW: PAID / PENDING
