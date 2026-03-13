from flask import Blueprint, jsonify, request
from app.models import db, MinePurchase
from app.utils import safe_float, paginate_query

mine_bp = Blueprint('mine', __name__)

@mine_bp.route('', methods=['POST'], strict_slashes=False)
def add_purchase():
    data = request.json
    try:
        # Calculate totals securely on the backend
        tonnes = safe_float(data.get('tonnes'))
        cost_per_ton = safe_float(data.get('cost_per_ton'))
        gst = safe_float(data.get('gst_percentage', 18.0))
        loading = safe_float(data.get('loading_charges'))
        transport = safe_float(data.get('transport_hire'))
        
        # New exhaustive calculation as requested
        base_cost = tonnes * cost_per_ton
        gst_amount = (base_cost * gst) / 100
        total_buying = base_cost + gst_amount + loading + transport
        
        new_purchase = MinePurchase(
            mine_name=data['mine_name'],
            material_name=data['material_name'],
            tonnes=tonnes,
            cost_per_ton=cost_per_ton,
            gst_percentage=gst,
            loading_charges=loading,
            transport_hire=transport,
            total_buying=total_buying,
            payment_status=data.get('payment_status', 'PENDING')
        )
        db.session.add(new_purchase)
        db.session.commit()
        return jsonify({"message": "Mine purchase recorded successfully", "id": new_purchase.id, "total": total_buying}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@mine_bp.route('', methods=['GET'], strict_slashes=False)
def get_purchases():
    try:
        query = MinePurchase.query
        
        search = request.args.get('search')
        if search:
            query = query.filter(
                db.or_(
                    MinePurchase.mine_name.ilike(f"%{search}%"),
                    MinePurchase.material_name.ilike(f"%{search}%")
                )
            )
            
        query = query.order_by(MinePurchase.date.desc())
        
        # Pagination
        paginated = paginate_query(query, request)
        
        result = []
        for p in paginated['items']:
            result.append({
                "id": p.id,
                "mine_name": p.mine_name,
                "material_name": p.material_name,
                "date": p.date.strftime("%Y-%m-%d %H:%M:%S"),
                "tonnes": p.tonnes,
                "cost_per_ton": p.cost_per_ton,
                "gst_percentage": p.gst_percentage,
                "loading_charges": p.loading_charges,
                "transport_hire": p.transport_hire,
                "total_buying": p.total_buying,
                "payment_status": p.payment_status
            })
            
        return jsonify({
            "data": result,
            "total_pages": paginated['total_pages'],
            "current_page": paginated['current_page'],
            "total_items": paginated['total_items']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
