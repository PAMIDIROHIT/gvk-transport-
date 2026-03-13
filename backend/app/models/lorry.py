from . import db
from datetime import datetime

# ---------------------------------------------------------
# LORRY (TRUCK) MANAGEMENT MODULE - OWN TRANSPORT
# ---------------------------------------------------------
class Lorry(db.Model):
    """ Master record for trucks owned by GVK Transport. """
    id = db.Column(db.Integer, primary_key=True)
    lorry_number = db.Column(db.String(20), unique=True, nullable=False)
    owner_name = db.Column(db.String(100), nullable=False, default='GVK')
    lorry_type = db.Column(db.String(20), default='OWN')
    emi_cost = db.Column(db.Float, default=0.0)
    insurance_details = db.Column(db.String(255))
    permit_details = db.Column(db.String(255))
    
class TripRecord(db.Model):
    """ Core tracker for calculating Trip-Based Profit """
    id = db.Column(db.Integer, primary_key=True)
    lorry_id = db.Column(db.Integer, db.ForeignKey('lorry.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Income generated purely from this trip
    trip_income = db.Column(db.Float, default=0.0)
    
class FuelRecord(db.Model):
    """ Tracks diesel cost and mileage """
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip_record.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    km_start = db.Column(db.Float, nullable=False)          # Dash start
    km_end = db.Column(db.Float, nullable=False)            # Dash end
    diesel_liters = db.Column(db.Float, nullable=False)     # Fuel pumped
    cost_per_liter = db.Column(db.Float, nullable=False)    # Rate
    
    # Auto-calculated
    total_cost = db.Column(db.Float, default=0.0)           # liters * cost
    mileage = db.Column(db.Float, default=0.0)              # (end - start) / liters

class DriverExpense(db.Model):
    """ Driver labor costs tied to a trip/month """
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip_record.id'), nullable=True) # Optional if tied strictly to month
    driver_name = db.Column(db.String(100), nullable=False)
    
    monthly_salary = db.Column(db.Float, default=0.0)       # Base pay
    bata = db.Column(db.Float, default=0.0)                 # Trip allowance
    overtime = db.Column(db.Float, default=0.0)             # Extra hours
    
class LorryEmi(db.Model):
    """ Debt tracker per lorry """
    id = db.Column(db.Integer, primary_key=True)
    lorry_id = db.Column(db.Integer, db.ForeignKey('lorry.id'), nullable=False)
    emi_amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='UNPAID')     # 'PAID' or 'UNPAID'

class MaintenanceRecord(db.Model):
    """ Repairs and service """
    id = db.Column(db.Integer, primary_key=True)
    lorry_id = db.Column(db.Integer, db.ForeignKey('lorry.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    
    service_cost = db.Column(db.Float, default=0.0)         # Oil changes, etc.
    tyres_cost = db.Column(db.Float, default=0.0)           # New tyres
    repairs_cost = db.Column(db.Float, default=0.0)         # Unexpected breaks
    total_maintenance = db.Column(db.Float, default=0.0)    # Sum

# ---------------------------------------------------------
# PRIVATE (RENTED) TRANSPORT
# ---------------------------------------------------------
class PrivateTransport(db.Model):
    """ Handling externally hired trucks with professional accounting. """
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    vendor_name = db.Column(db.String(100), nullable=False)
    lorry_number = db.Column(db.String(20), nullable=False)
    
    # Material Details
    tonnes_loaded = db.Column(db.Float, nullable=False)
    freight_rate_per_ton = db.Column(db.Float, nullable=False)
    total_rent = db.Column(db.Float, default=0.0)           # tonnes * rate
    
    # Advanced Deductions (Accounting Perspective)
    tollgate_fees = db.Column(db.Float, default=0.0)
    cash_advances = db.Column(db.Float, default=0.0)        # Direct fuel/cash to driver
    diesel_advances = db.Column(db.Float, default=0.0)      # Fuel slips
    loading_charges = db.Column(db.Float, default=0.0)      # Deducted from vendor
    unloading_charges = db.Column(db.Float, default=0.0)    # Deducted from vendor
    shortage_amount = db.Column(db.Float, default=0.0)      # Penalty for weight loss
    
    # Tax & Net
    tds_percentage = db.Column(db.Float, default=1.0)       # Usually 1% or 2%
    tds_amount = db.Column(db.Float, default=0.0)
    
    # Payment Status
    amount_paid = db.Column(db.Float, default=0.0)          # Bank/Cash transfers
    remaining_balance = db.Column(db.Float, default=0.0)    # Rent - Deductions - Paid
    payment_status = db.Column(db.String(20), default='PENDING') # [PAID, PARTIAL, PENDING]
    
    # Vendor Banking
    owner_bank_details = db.Column(db.Text)                 # AC Num, IFSC, Nominee
