from flask import Blueprint, jsonify, request
from app.models import db, OtherExpense
from app.utils import safe_float, paginate_query

expense_bp = Blueprint('expense', __name__)

@expense_bp.route('/', methods=['GET'])
def get_expenses():
    try:
        query = OtherExpense.query
        
        # Filters
        category = request.args.get('category')
        if category:
            query = query.filter(OtherExpense.category == category)
            
        search = request.args.get('search')
        if search:
            query = query.filter(OtherExpense.description.ilike(f"%{search}%"))
            
        query = query.order_by(OtherExpense.date.desc())
        
        # Pagination
        paginated = paginate_query(query, request)
        
        result = []
        for e in paginated['items']:
            result.append({
                "id": e.id,
                "description": e.description,
                "category": e.category,
                "sub_category": e.sub_category,
                "paid_to": e.paid_to,
                "payment_mode": e.payment_mode,
                "taxes": e.taxes,
                "formalities": e.formalities,
                "total_amount": e.total_amount,
                "date": e.date.strftime("%Y-%m-%d %H:%M:%S")
            })
            
        return jsonify({
            "data": result,
            "total_pages": paginated['total_pages'],
            "current_page": paginated['current_page'],
            "total_items": paginated['total_items']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@expense_bp.route('/', methods=['POST'])
def add_expense():
    data = request.json
    try:
        desc = data.get('description', 'General')
        category = data.get('category', 'BUSINESS')
        sub_cat = data.get('sub_category')
        paid_to = data.get('paid_to')
        mode = data.get('payment_mode', 'CASH')
        
        taxes = safe_float(data.get('taxes'))
        formalities = safe_float(data.get('formalities'))
        total = safe_float(data.get('total_amount'))
        
        if total == 0:
            total = taxes + formalities
        
        new_exp = OtherExpense(
            description=desc,
            category=category,
            sub_category=sub_cat,
            paid_to=paid_to,
            payment_mode=mode,
            taxes=taxes,
            formalities=formalities,
            total_amount=total
        )
        db.session.add(new_exp)
        db.session.commit()
        return jsonify({"message": "Expense logged", "id": new_exp.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
