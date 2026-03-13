from . import db
from datetime import datetime

class OtherExpense(db.Model):
    """
    Business overhead (Taxes, Office Formalities) deducted from Net Profit.
    Enhanced to support Personal, Business, and Loan tracking.
    """
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String(255), nullable=False)
    
    # Financial Categories
    category = db.Column(db.String(50), default='BUSINESS') # [PERSONAL, BUSINESS, LOAN]
    sub_category = db.Column(db.String(50))                # [Rent, Salary, Withdrawal, Interest]
    paid_to = db.Column(db.String(100))                     # Recipient
    payment_mode = db.Column(db.String(20), default='CASH') # [CASH, UPI, BANK]
    
    taxes = db.Column(db.Float, default=0.0)
    formalities = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
