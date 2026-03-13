def safe_float(val, default=0.0):
    """Safely converts a value to float. Returns default if empty, None, or unparseable."""
    if val is None or val == "":
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def paginate_query(query, request, per_page=10):
    """
    Applies pagination to a SQLAlchemy query based on request parameters.
    Returns: items, total_pages, current_page
    """
    from flask import request
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', per_page, type=int)
    
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    
    return {
        "items": pagination.items,
        "total_pages": pagination.pages,
        "current_page": pagination.page,
        "total_items": pagination.total
    }
