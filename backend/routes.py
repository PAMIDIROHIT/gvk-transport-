from flask import Blueprint, jsonify, request
from models import db, User, MinePurchase, FactoryLoading, FactorySale, Lorry, FuelRecord, LorryExpense, OtherExpense
from profit_calc import ProfitCalculator
from sqlalchemy.exc import SQLAlchemyError

api_bp = Blueprint('api', __name__)

# ---------------------------------------------------------
# UTILITY HELPERS (Prevents 90% of your 500 & CORS errors)
# ---------------------------------------------------------
def safe_float(value, default=0.0):
    """Safely converts front-end inputs (including empty strings and None) to float."""
    try:
        if value is None or str(value).strip() == '':
            return float(default)
        return float(value)
    except (ValueError, TypeError):
        return float(default)

def safe_iso(date_obj):
    """Safely serializes a datetime object, resolving NoneType serialization crashes."""
    return date_obj.isoformat() if date_obj else None

def get_body():
    """Safely extracts JSON to prevent .get() crashes on empty requests."""
    return request.json or {}

# ---------------------------------------------------------
# AUTHENTICATION
# ---------------------------------------------------------
@api_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = get_body()
        username = data.get('username', '')
        password = data.get('password', '')

        if username == 'warner' and password == 'owner123':
            return jsonify({"token": "mock-token-owner", "role": "OWNER"}), 200
        elif username == 'accountant' and password == 'accountant123':
            return jsonify({"token": "mock-token-acct", "role": "ACCOUNTANT"}), 200
            
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": "Login processing failed", "details": str(e)}), 500

# ---------------------------------------------------------
# DASHBOARD / PROFIT
# ---------------------------------------------------------
@api_bp.route('/profit', methods=['GET'])
def get_profit():
    try:
        net_profit = ProfitCalculator.calculate_net_profit()
        split_data = ProfitCalculator.calculate_partner_split(net_profit, "Partner 1", "Partner 2")
        return jsonify(split_data), 200
    except Exception as e:
        return jsonify({"error": "Failed to calculate profit", "details": str(e)}), 500

# ---------------------------------------------------------
# MINE PURCHASES CRUD
# ---------------------------------------------------------
@api_bp.route('/mine', methods=['GET', 'POST'])
def manage_mine_purchases():
    if request.method == 'GET':
        try:
            purchases = MinePurchase.query.all()
            return jsonify([{
                "id": p.id, "mine_name": p.mine_name, "material_name": p.material_name, "tonnes": p.tonnes,
                "cost_per_ton": p.cost_per_ton, "gst_percentage": p.gst_percentage,
                "loading_charges": p.loading_charges, "transport_hire": p.transport_hire,
                "payment_status": p.payment_status,
                "total_buying": p.total_buying, "date": safe_iso(p.date)
            } for p in purchases]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch purchases", "details": str(e)}), 500

    if request.method == 'POST':
        try:
            data = get_body()
            gst = safe_float(data.get('gst_percentage'), 18.0)
            tonnes = safe_float(data.get('tonnes'))
            cost_per_ton = safe_float(data.get('cost_per_ton'))
            loading = safe_float(data.get('loading_charges'))
            transport = safe_float(data.get('transport_hire'))
            
            cost = tonnes * cost_per_ton
            total_buying = cost + (cost * (gst / 100)) + loading + transport
            
            new_purchase = MinePurchase(
                mine_name=data.get('mine_name', 'Unknown'),
                material_name=data.get('material_name', 'Unknown'), 
                tonnes=tonnes,
                cost_per_ton=cost_per_ton, 
                gst_percentage=gst,
                loading_charges=loading, 
                transport_hire=transport,
                payment_status=data.get('payment_status', 'PENDING'),
                total_buying=total_buying
            )
            db.session.add(new_purchase)
            db.session.commit()
            return jsonify({"message": "Purchase recorded", "id": new_purchase.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to save purchase", "details": str(e)}), 500

# ---------------------------------------------------------
# FACTORY LOADING 
# ---------------------------------------------------------
@api_bp.route('/factory/loading', methods=['GET', 'POST'])
def manage_loading():
    if request.method == 'GET':
        try:
            loadings = FactoryLoading.query.all()
            return jsonify([{
                "id": l.id, "vendor_name": l.vendor_name, "tonnes": l.tonnes, 
                "rate": l.rate, "total_amount": l.total_amount, "date": safe_iso(l.date)
            } for l in loadings]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch loadings", "details": str(e)}), 500
    
    if request.method == 'POST':
        try:
            data = get_body()
            tonnes = safe_float(data.get('tonnes'))
            rate = safe_float(data.get('rate'))
            total_amount = tonnes * rate
            
            new_load = FactoryLoading(
                vendor_name=data.get('vendor_name', 'Unknown'), 
                tonnes=tonnes, 
                rate=rate, 
                total_amount=total_amount
            )
            db.session.add(new_load)
            db.session.commit()
            return jsonify({"message": "Loading recorded", "id": new_load.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to record loading", "details": str(e)}), 500

# ---------------------------------------------------------
# FACTORY SALES
# ---------------------------------------------------------
@api_bp.route('/factory/sale', methods=['GET', 'POST'])
def manage_sales():
    if request.method == 'GET':
        try:
            sales = FactorySale.query.all()
            return jsonify([{
                "id": s.id, "factory_name": s.factory_name, "material_name": s.material_name,
                "destination": s.destination, "tonnes": s.tonnes, "selling_price_per_ton": s.rate_per_ton,
                "gst_percentage": s.gst_percentage, "due_date": s.due_date,
                "total_sales_amount": s.total_amount, "payment_status": s.payment_status,
                # Safe subtraction protecting against NULLs in database
                "payment_pending": safe_float(s.total_amount) - safe_float(s.amount_paid),
                "date": safe_iso(s.date)
            } for s in sales]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch sales", "details": str(e)}), 500
    
    if request.method == 'POST':
        try:
            data = get_body()
            rate = safe_float(data.get('selling_price_per_ton', data.get('rate_per_ton', 0)))
            tonnes = safe_float(data.get('tonnes'))
            gst_percentage = safe_float(data.get('gst_percentage', 18))
            rent_deduction = safe_float(data.get('rent_deduction', 0))
            amount_paid = safe_float(data.get('payment_received', data.get('amount_paid', 0)))

            base = tonnes * rate
            gst = (base * gst_percentage) / 100
            total = base + gst - rent_deduction
            
            payment_status = 'PAID' if amount_paid >= total and total > 0 else 'PARTIAL' if amount_paid > 0 else 'PENDING'
            
            new_sale = FactorySale(
                loading_id=data.get('loading_id'), 
                factory_name=data.get('factory_name', 'Unknown'),
                material_name=data.get('material_name', 'Unknown'), 
                destination=data.get('destination', ''),
                tonnes=tonnes, 
                rate_per_ton=rate, 
                rent_deduction=rent_deduction,
                gst_percentage=gst_percentage, 
                due_date=data.get('due_date'),
                total_amount=total, 
                payment_status=payment_status, 
                payment_mode=data.get('payment_mode', 'CASH'),
                amount_paid=amount_paid
            )
            db.session.add(new_sale)
            db.session.commit()
            return jsonify({"message": "Sale recorded", "id": new_sale.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to record sale", "details": str(e)}), 500

# ---------------------------------------------------------
# LORRY MANAGEMENT & FUEL
# ---------------------------------------------------------
@api_bp.route('/lorry', methods=['GET', 'POST'])
def manage_lorries():
    if request.method == 'GET':
        try:
            lorries = Lorry.query.all()
            return jsonify([{
                "id": l.id, "lorry_number": l.lorry_number, "owner_name": l.owner_name,
                "lorry_type": l.lorry_type, "emi_cost": l.emi_cost,
                "insurance_details": l.insurance_details, "permit_details": l.permit_details
            } for l in lorries]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch lorries", "details": str(e)}), 500
    
    if request.method == 'POST':
        try:
            data = get_body()
            new_lorry = Lorry(
                lorry_number=data.get('lorry_number', 'Unknown'), 
                owner_name=data.get('owner_name', 'Unknown'),
                lorry_type=data.get('lorry_type', 'OWN'),
                emi_cost=safe_float(data.get('emi_cost', 0)),
                insurance_details=data.get('insurance_details', ''),
                permit_details=data.get('permit_details', '')
            )
            db.session.add(new_lorry)
            db.session.commit()
            return jsonify({"message": "Lorry created", "id": new_lorry.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to save lorry", "details": str(e)}), 500

@api_bp.route('/lorry/fuel', methods=['GET', 'POST'])
def manage_fuel():
    if request.method == 'GET':
        try:
            records = FuelRecord.query.all()
            return jsonify([{
                "id": r.id, "lorry_id": r.lorry_id, "liters": r.liters, 
                "total_cost": r.total_cost, "cost_per_km": r.cost_per_km
            } for r in records]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch fuel records", "details": str(e)}), 500
    
    if request.method == 'POST':
        try:
            data = get_body()
            new_fuel = FuelRecord(
                lorry_id=data.get('lorry_id'), 
                liters=safe_float(data.get('liters')), 
                total_cost=safe_float(data.get('total_cost')), 
                odometer_reading=safe_float(data.get('odometer_reading'))
            )
            db.session.add(new_fuel)
            db.session.commit()
            return jsonify({"message": "Fuel logged", "id": new_fuel.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to log fuel", "details": str(e)}), 500

@api_bp.route('/lorry/expense', methods=['GET', 'POST'])
def manage_lorry_expenses():
    if request.method == 'GET':
        try:
            expenses = LorryExpense.query.all()
            return jsonify([{
                "id": e.id, "lorry_id": e.lorry_id, "driver_name": e.driver_name, 
                "total_amount": e.total_amount
            } for e in expenses]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch lorry expenses", "details": str(e)}), 500
    
    if request.method == 'POST':
        try:
            data = get_body()
            d_salary = safe_float(data.get('driver_salary'))
            maint = safe_float(data.get('maintenance'))
            toll = safe_float(data.get('toll'))
            total = d_salary + maint + toll
            
            new_exp = LorryExpense(
                lorry_id=data.get('lorry_id'), 
                driver_name=data.get('driver_name', 'Unknown'), 
                driver_salary=d_salary, 
                maintenance=maint, 
                toll=toll, 
                total_amount=total
            )
            db.session.add(new_exp)
            db.session.commit()
            return jsonify({"message": "Lorry Expense logged", "id": new_exp.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to log lorry expense", "details": str(e)}), 500

# ---------------------------------------------------------
# OTHER GENERAL EXPENSES
# ---------------------------------------------------------
@api_bp.route('/expense', methods=['GET', 'POST'])
def manage_general_expenses():
    if request.method == 'GET':
        try:
            expenses = OtherExpense.query.all()
            return jsonify([{
                "id": e.id, "description": e.description, 
                "total_amount": e.total_amount
            } for e in expenses]), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch expenses", "details": str(e)}), 500
    
    if request.method == 'POST':
        try:
            data = get_body()
            taxes = safe_float(data.get('taxes'))
            formalities = safe_float(data.get('formalities'))
            total = taxes + formalities
            
            new_exp = OtherExpense(
                description=data.get('description', 'Miscellaneous'), 
                taxes=taxes, 
                formalities=formalities, 
                total_amount=total
            )
            db.session.add(new_exp)
            db.session.commit()
            return jsonify({"message": "Expense logged", "id": new_exp.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to log expense", "details": str(e)}), 500
