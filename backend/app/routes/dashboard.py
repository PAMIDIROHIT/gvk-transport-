from flask import Blueprint, jsonify
from sqlalchemy.sql import func
from app.models import db, MinePurchase, FactorySale
from app.models.lorry import FuelRecord, DriverExpense, MaintenanceRecord
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
def get_summary():
    # 1. Total Purchases this month
    today = datetime.today()
    first_day = today.replace(day=1)
    
    purchases = db.session.query(func.sum(MinePurchase.total_buying))\
        .filter(MinePurchase.date >= first_day).scalar() or 0
        
    # 2. Total Sales this month
    sales = db.session.query(func.sum(FactorySale.total_sales_amount))\
        .filter(FactorySale.date >= first_day).scalar() or 0
        
    # 3. Total Pending Receivables
    pending = db.session.query(func.sum(FactorySale.payment_pending)).scalar() or 0
    
    # 4. Total Expense Summary (Basic implementation)
    fuel = db.session.query(func.sum(FuelRecord.total_cost)).scalar() or 0
    driver = db.session.query(func.sum(DriverExpense.monthly_salary + DriverExpense.bata + DriverExpense.overtime)).scalar() or 0
    maint = db.session.query(func.sum(MaintenanceRecord.total_maintenance)).scalar() or 0
    expenses = fuel + driver + maint
    
    # 5. Estimated Gross Margin
    net_profit = sales - purchases - expenses
    
    return jsonify({
        "total_purchases": float(purchases),
        "total_sales": float(sales),
        "total_pending_payments": float(pending),
        "vehicle_expense_summary": float(expenses),
        "net_profit": float(net_profit)
    })

@dashboard_bp.route('/alerts', methods=['GET'])
def get_alerts():
    alerts = []
    
    # Check for Factory Sales that are pending
    pending_sales = FactorySale.query.filter(FactorySale.payment_pending > 0).all()
    for sale in pending_sales:
        if sale.due_date:
            days_until_due = (sale.due_date.date() - datetime.today().date()).days
            if days_until_due < 0:
                alerts.append({
                    "id": f"sale-{sale.id}",
                    "type": "error",
                    "title": "Overdue Factory Payment",
                    "message": f"{sale.factory_name} is overdue for Rs. {sale.payment_pending:,.2f}"
                })
            elif days_until_due <= 3:
                alerts.append({
                    "id": f"sale-{sale.id}",
                    "type": "warning",
                    "title": "Upcoming Factory Payment",
                    "message": f"Collect Rs. {sale.payment_pending:,.2f} from {sale.factory_name} in {days_until_due} days."
                })
                
    # Check for Lorry EMIs (mocked as general lorry expense constraint here)
    # Ideally, real fleet management checks the 'Lorry' specific EMI dates
    
    return jsonify(alerts), 200
