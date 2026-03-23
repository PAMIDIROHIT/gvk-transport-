import pytest
from app import create_app
from app.models import db, FactorySale, MinePurchase

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"  # Use in-memory DB for tests
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_profit_calculation(app):
    """
    Test that the ProfitCalculator correctly sums income and expenses,
    and accurately computes the partner split.
    """
    from profit_calc import ProfitCalculator
    
    with app.app_context():
        # Add some mock sales (Income = 15000)
        sale = FactorySale(
            invoice_number="INV-1002",
            factory_name="Test Factory",
            material_name="Test Ore",
            destination="Test City",
            tonnes=10,
            selling_price_per_ton=1500,
            total_sales_amount=15000
        )
        db.session.add(sale)
        
        # Add some mock purchases (Expense = 5000)
        purchase = MinePurchase(
            mine_name="Test Mine",
            material_name="Test Ore",
            tonnes=10,
            cost_per_ton=500,
            gst_percentage=0,
            total_buying=5000
        )
        db.session.add(purchase)
        db.session.commit()
        
        # Net profit should be 15000 - 5000 = 10000
        net_profit = ProfitCalculator.calculate_net_profit()
        assert net_profit == 10000.0
        
        # Partner split should be 50/50 by default
        split = ProfitCalculator.calculate_partner_split(net_profit)
        assert split["split"][0]["share"] == 5000.0
        assert split["split"][1]["share"] == 5000.0
