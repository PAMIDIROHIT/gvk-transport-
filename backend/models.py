from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize the SQLAlchemy object (this manages our database connection and tables)
db = SQLAlchemy()

# ---------------------------------------------------------
# USER AUTHENTICATION MODEL
# ---------------------------------------------------------
class User(db.Model):
    """
    User model to store login credentials.
    Roles are either 'OWNER' (full access) or 'ACCOUNTANT' (view only).
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False) # We store hashes, never plaintext passwords
    role = db.Column(db.String(20), nullable=False, default='ACCOUNTANT')

# ---------------------------------------------------------
# PURCHASE MODULE (Buying from Mine)
# ---------------------------------------------------------
class MinePurchase(db.Model):
    """
    Records materials bought from the mine by GVK Transport.
    """
    id = db.Column(db.Integer, primary_key=True)
    mine_name = db.Column(db.String(100), nullable=True)      # Newly added from frontend
    material_name = db.Column(db.String(100), nullable=False) # E.g., Iron Ore, Coal
    date = db.Column(db.DateTime, default=datetime.utcnow)    # When it was bought
    tonnes = db.Column(db.Float, nullable=False)              # Quantity brought
    cost_per_ton = db.Column(db.Float, nullable=False)        # Base cost of one ton
    gst_percentage = db.Column(db.Float, default=18.0)        # Tax applied (usually 18%)
    loading_charges = db.Column(db.Float, default=0.0)        # Newly added
    transport_hire = db.Column(db.Float, default=0.0)         # Newly added
    payment_status = db.Column(db.String(50), default='PENDING') # Newly added
    total_buying = db.Column(db.Float, nullable=False)        # Calculated: base + gst + loading + transport

# ---------------------------------------------------------
# SALES MODULE (Selling to Factory)
# ---------------------------------------------------------
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
    Handles installments and EMIs for payments.
    """
    id = db.Column(db.Integer, primary_key=True)
    loading_id = db.Column(db.Integer, db.ForeignKey('factory_loading.id'), nullable=True) # Link to the loading record
    date = db.Column(db.DateTime, default=datetime.utcnow)
    factory_name = db.Column(db.String(100), nullable=False)   # Who bought it from us
    material_name = db.Column(db.String(100), nullable=True)   # Newly added
    destination = db.Column(db.String(100), nullable=True)     # Where we sent it
    tonnes = db.Column(db.Float, nullable=False)               # Quantity sold
    rate_per_ton = db.Column(db.Float, nullable=False)         # Selling price per ton
    gst_percentage = db.Column(db.Float, default=18.0)         # Newly added
    due_date = db.Column(db.String(50), nullable=True)         # Newly added
    rent_deduction = db.Column(db.Float, default=0.0)          # Logistics/rent subtracted from final payout
    total_amount = db.Column(db.Float, nullable=False)         # Final money owed to us
    payment_status = db.Column(db.String(50), default='PENDING') # E.g., 'PAID', 'PARTIAL', 'PENDING'
    payment_mode = db.Column(db.String(50), default='CASH')      # E.g., 'CASH', 'INSTALLMENT', 'EMI'
    amount_paid = db.Column(db.Float, default=0.0)             # How much has been paid so far

# ---------------------------------------------------------
# LORRY (TRUCK) MANAGEMENT MODULE
# ---------------------------------------------------------
class Lorry(db.Model):
    """
    Master record for trucks owned by GVK Transport.
    """
    id = db.Column(db.Integer, primary_key=True)
    lorry_number = db.Column(db.String(20), unique=True, nullable=False) # The license plate
    owner_name = db.Column(db.String(100), nullable=False)               # If hired, who owns it. If ours, 'GVK'
    lorry_type = db.Column(db.String(20), default='OWN')                 # OWN or RENTED
    income = db.Column(db.Float, default=0.0)                            # Direct transport income
    emi_cost = db.Column(db.Float, default=0.0)                          # Monthly truck payment
    insurance_details = db.Column(db.String(255))                        # Expiry dates or policy num
    permit_details = db.Column(db.String(255))                           # Route permits

class FuelRecord(db.Model):
    """
    Tracks diesel costs per Lorry to calculate Efficiency (Cost per KM).
    """
    id = db.Column(db.Integer, primary_key=True)
    lorry_id = db.Column(db.Integer, db.ForeignKey('lorry.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    liters = db.Column(db.Float, nullable=False)                         # Fuel pumped
    total_cost = db.Column(db.Float, nullable=False)                     # Bill amount
    odometer_reading = db.Column(db.Float, nullable=False)               # Dash mileage
    # These two are calculated when the NEXT fuel record is added (difference in odometer / cost)
    total_km_run = db.Column(db.Float, default=0.0)                      
    cost_per_km = db.Column(db.Float, default=0.0)                       

class LorryExpense(db.Model):
    """
    General operating expenses per truck. Used to calculate Net Profit.
    """
    id = db.Column(db.Integer, primary_key=True)
    lorry_id = db.Column(db.Integer, db.ForeignKey('lorry.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    driver_name = db.Column(db.String(100), nullable=False)
    driver_salary = db.Column(db.Float, default=0.0)                     # Labor
    maintenance = db.Column(db.Float, default=0.0)                       # Repairs/Services
    toll = db.Column(db.Float, default=0.0)                              # FASTag/Tolls
    total_amount = db.Column(db.Float, nullable=False)                   # Sum of the above

# ---------------------------------------------------------
# GENERAL BUSINESS EXPENSES
# ---------------------------------------------------------
class OtherExpense(db.Model):
    """
    Business overhead (Taxes, Office Formalities) deducted from Net Profit.
    """
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String(255), nullable=False)
    taxes = db.Column(db.Float, default=0.0)
    formalities = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
