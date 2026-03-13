from flask import Blueprint, jsonify, request
from app.models import db, Lorry, TripRecord, FuelRecord, DriverExpense, LorryEmi, MaintenanceRecord, PrivateTransport
from datetime import datetime
from app.utils import safe_float, paginate_query

lorry_bp = Blueprint('lorry', __name__)

# ---------------------------------------------------------
# LORRY MASTER DATA ENDPOINTS
# ---------------------------------------------------------
@lorry_bp.route('', methods=['GET'], strict_slashes=False)
def get_lorries():
    try:
        query = Lorry.query
        
        search = request.args.get('search')
        if search:
            query = query.filter(
                db.or_(
                    Lorry.lorry_number.ilike(f"%{search}%"),
                    Lorry.owner_name.ilike(f"%{search}%")
                )
            )
            
        # Pagination
        paginated = paginate_query(query, request)
        
        result = []
        for l in paginated['items']:
            result.append({
                "id": l.id,
                "lorry_number": l.lorry_number,
                "owner_name": l.owner_name,
                "lorry_type": l.lorry_type,
                "emi_cost": l.emi_cost,
                "insurance_details": l.insurance_details,
                "permit_details": l.permit_details
            })
            
        return jsonify({
            "data": result,
            "total_pages": paginated['total_pages'],
            "current_page": paginated['current_page'],
            "total_items": paginated['total_items']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lorry_bp.route('', methods=['POST'], strict_slashes=False)
def add_lorry():
    data = request.json
    try:
        new_lorry = Lorry(
            lorry_number=data['lorry_number'],
            owner_name=data.get('owner_name', 'GVK'),
            lorry_type=data.get('lorry_type', 'OWN'),
            emi_cost=safe_float(data.get('emi_cost', 0.0)),
            insurance_details=data.get('insurance_details', ''),
            permit_details=data.get('permit_details', '')
        )
        db.session.add(new_lorry)
        db.session.commit()
        return jsonify({"message": "Lorry saved successfully", "id": new_lorry.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ---------------------------------------------------------
# OWN TRANSPORT ENDPOINTS (Fuel)
# ---------------------------------------------------------
@lorry_bp.route('/expense/fuel', methods=['GET'])
def get_fuel():
    try:
        query = FuelRecord.query.order_by(FuelRecord.date.desc())
        
        # Pagination
        paginated = paginate_query(query, request)
        
        result = []
        for r in paginated['items']:
            result.append({
                "id": r.id,
                "lorry_id": r.trip_record.lorry_id if r.trip_record else None,
                "date": r.date.strftime("%Y-%m-%d %H:%M:%S") if r.date else None,
                "km_start": r.km_start,
                "km_end": r.km_end,
                "diesel_liters": r.diesel_liters,
                "cost_per_liter": r.cost_per_liter,
                "total_cost": r.total_cost,
                "mileage": r.mileage
            })
            
        return jsonify({
            "data": result,
            "total_pages": paginated['total_pages'],
            "current_page": paginated['current_page'],
            "total_items": paginated['total_items']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lorry_bp.route('/expense/fuel', methods=['POST'])
def add_fuel():
    data = request.json
    try:
        km_start = safe_float(data.get('km_start'))
        km_end = safe_float(data.get('km_end'))
        liters = safe_float(data.get('diesel_liters'))
        cost = safe_float(data.get('cost_per_liter'))
        
        total_cost = liters * cost
        mileage = (km_end - km_start) / liters if liters > 0 else 0
        
        fuel = FuelRecord(
            trip_id=data.get('trip_id', 1),
            km_start=km_start,
            km_end=km_end,
            diesel_liters=liters,
            cost_per_liter=cost,
            total_cost=total_cost,
            mileage=mileage
        )
        db.session.add(fuel)
        db.session.commit()
        return jsonify({"message": "Fuel logged", "id": fuel.id, "mileage": mileage}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ---------------------------------------------------------
# PRIVATE TRANSPORT (RENTED) ENDPOINTS - ACC PRO
# ---------------------------------------------------------
@lorry_bp.route('/private', methods=['GET'])
def get_private_transport():
    try:
        query = PrivateTransport.query
        
        # Filters
        vendor = request.args.get('vendor_name')
        if vendor:
            query = query.filter(PrivateTransport.vendor_name.ilike(f"%{vendor}%"))
            
        search = request.args.get('search')
        if search:
            query = query.filter(PrivateTransport.lorry_number.ilike(f"%{search}%"))
            
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        if start_date:
            query = query.filter(PrivateTransport.date >= datetime.strptime(start_date, '%Y-%m-%d'))
        if end_date:
            query = query.filter(PrivateTransport.date <= datetime.strptime(end_date, '%Y-%m-%d'))
            
        query = query.order_by(PrivateTransport.date.desc())
        
        # Pagination
        paginated = paginate_query(query, request)
        
        result = []
        for r in paginated['items']:
            result.append({
                "id": r.id,
                "vendor_name": r.vendor_name,
                "lorry_number": r.lorry_number,
                "date": r.date.strftime("%Y-%m-%d %H:%M:%S") if r.date else None,
                "tonnes_loaded": r.tonnes_loaded,
                "freight_rate_per_ton": r.freight_rate_per_ton,
                "total_rent": r.total_rent,
                
                # Deductions
                "tollgate_fees": r.tollgate_fees,
                "cash_advances": r.cash_advances,
                "diesel_advances": r.diesel_advances,
                "loading_charges": r.loading_charges,
                "unloading_charges": r.unloading_charges,
                "shortage_amount": r.shortage_amount,
                
                # Tax
                "tds_percentage": r.tds_percentage,
                "tds_amount": r.tds_amount,
                
                # Payouts
                "amount_paid": r.amount_paid,
                "remaining_balance": r.remaining_balance,
                "payment_status": r.payment_status,
                "owner_bank_details": r.owner_bank_details
            })
            
        return jsonify({
            "data": result,
            "total_pages": paginated['total_pages'],
            "current_page": paginated['current_page'],
            "total_items": paginated['total_items']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lorry_bp.route('/private', methods=['POST'])
def add_private_transport():
    data = request.json
    try:
        tonnes = safe_float(data.get('tonnes_loaded'))
        rate = safe_float(data.get('freight_rate_per_ton'))
        base_rent = tonnes * rate
        
        # Advances & Charges
        cash = safe_float(data.get('cash_advances'))
        diesel = safe_float(data.get('diesel_advances'))
        tolls = safe_float(data.get('tollgate_fees'))
        loading = safe_float(data.get('loading_charges'))
        unloading = safe_float(data.get('unloading_charges'))
        shortage = safe_float(data.get('shortage_amount'))
        
        total_advances = cash + diesel + tolls
        total_charges = loading + unloading + shortage
        
        # TDS Calculation
        tds_p = safe_float(data.get('tds_percentage', 1.0))
        tds_amt = (base_rent * tds_p) / 100
        
        already_paid = safe_float(data.get('amount_paid', 0.0))
        
        # Expert Accounting Formula
        remaining = base_rent - total_advances - total_charges - tds_amt - already_paid
        
        # Determine Status
        status = 'PAID' if remaining <= 0 else 'PARTIAL' if already_paid > 0 else 'PENDING'
        
        pt = PrivateTransport(
            vendor_name=data['vendor_name'],
            lorry_number=data['lorry_number'],
            tonnes_loaded=tonnes,
            freight_rate_per_ton=rate,
            total_rent=base_rent,
            cash_advances=cash,
            diesel_advances=diesel,
            tollgate_fees=tolls,
            loading_charges=loading,
            unloading_charges=unloading,
            shortage_amount=shortage,
            tds_percentage=tds_p,
            tds_amount=tds_amt,
            amount_paid=already_paid,
            remaining_balance=remaining,
            payment_status=status,
            owner_bank_details=data.get('owner_bank_details', '')
        )
        db.session.add(pt)
        db.session.commit()
        return jsonify({"message": "Private transport logged", "id": pt.id, "balance": remaining}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
