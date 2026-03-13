from flask import Blueprint, jsonify, request
from app.models import db, FactoryLoading, FactorySale
from app.utils import safe_float, paginate_query
from datetime import datetime

factory_bp = Blueprint('factory', __name__)

@factory_bp.route('/sale', methods=['GET'])
def get_sales():
    try:
        query = FactorySale.query
        
        # Filters
        factory_name = request.args.get('factory_name')
        if factory_name:
            query = query.filter(FactorySale.factory_name.ilike(f"%{factory_name}%"))
            
        start_date = request.args.get('start_date')
        if start_date:
            query = query.filter(FactorySale.date >= datetime.strptime(start_date, "%Y-%m-%d"))
            
        end_date = request.args.get('end_date')
        if end_date:
            # End of day
            query = query.filter(FactorySale.date <= datetime.strptime(f"{end_date} 23:59:59", "%Y-%m-%d %H:%M:%S"))
            
        search = request.args.get('search')
        if search:
            query = query.filter(
                db.or_(
                    FactorySale.invoice_number.ilike(f"%{search}%"),
                    FactorySale.vehicle_number.ilike(f"%{search}%"),
                    FactorySale.material_name.ilike(f"%{search}%")
                )
            )
            
        query = query.order_by(FactorySale.date.desc())
        
        # Pagination
        paginated = paginate_query(query, request)
        
        result = []
        for s in paginated['items']:
            result.append({
                "id": s.id,
                "invoice_number": s.invoice_number,
                "factory_name": s.factory_name,
                "material_name": s.material_name,
                "vehicle_number": s.vehicle_number,
                "driver_name": s.driver_name,
                "destination": s.destination,
                "date": s.date.strftime("%Y-%m-%d %H:%M:%S") if s.date else None,
                "tonnes": s.tonnes,
                "selling_price_per_ton": s.selling_price_per_ton,
                "gst_percentage": s.gst_percentage,
                "total_sales_amount": s.total_sales_amount,
                "advanced_payment": s.advanced_payment,
                "payment_received": s.payment_received,
                "payment_pending": s.payment_pending,
                "payment_status": s.payment_status,
                "due_date": s.due_date.strftime("%Y-%m-%d") if s.due_date else None
            })
            
        return jsonify({
            "data": result,
            "total_pages": paginated['total_pages'],
            "current_page": paginated['current_page'],
            "total_items": paginated['total_items']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@factory_bp.route('/loading', methods=['POST'])
def add_loading():
    data = request.json
    try:
        tonnes = safe_float(data.get('tonnes'))
        rate = safe_float(data.get('rate'))
        total_amount = tonnes * rate
        
        loading = FactoryLoading(
            vendor_name=data['vendor_name'],
            tonnes=tonnes,
            rate=rate,
            total_amount=total_amount
        )
        db.session.add(loading)
        db.session.commit()
        return jsonify({"message": "Factory loading recorded", "id": loading.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@factory_bp.route('/sale', methods=['POST'])
def add_sale():
    data = request.json
    try:
        tonnes = safe_float(data.get('tonnes'))
        price = safe_float(data.get('selling_price_per_ton'))
        gst = safe_float(data.get('gst_percentage', 18.0))
        
        # Professional accounting logic
        base_sales = tonnes * price
        gst_amount = (base_sales * gst) / 100
        total_sales = base_sales + gst_amount
        
        advanced = safe_float(data.get('advanced_payment', 0.0))
        received = safe_float(data.get('payment_received', 0.0))
        
        total_collected = advanced + received
        payment_pending = total_sales - total_collected
        
        # Determine status
        if payment_pending <= 0:
            status = 'PAID'
        elif total_collected > 0:
            status = 'PARTIAL'
        else:
            status = 'PENDING'
            
        due_date_str = data.get('due_date')
        due_date = datetime.strptime(due_date_str, "%Y-%m-%d") if due_date_str else None

        sale = FactorySale(
            invoice_number=data.get('invoice_number'),
            factory_name=data['factory_name'],
            material_name=data['material_name'],
            vehicle_number=data.get('vehicle_number'),
            driver_name=data.get('driver_name'),
            destination=data.get('destination'),
            tonnes=tonnes,
            selling_price_per_ton=price,
            gst_percentage=gst,
            total_sales_amount=total_sales,
            advanced_payment=advanced,
            payment_received=received,
            payment_pending=payment_pending,
            payment_status=status,
            due_date=due_date
        )
        db.session.add(sale)
        db.session.commit()
        return jsonify({"message": "Factory sale recorded", "invoice": sale.invoice_number, "total": total_sales, "pending": payment_pending}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
