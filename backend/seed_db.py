import os
from datetime import datetime, timedelta
from app import create_app
from app.models import db, MinePurchase, FactoryLoading, FactorySale, Lorry, TripRecord, FuelRecord, DriverExpense, LorryEmi, MaintenanceRecord, PrivateTransport

app = create_app()

def seed_db():
    with app.app_context():
        # Clear existing
        db.drop_all()
        db.create_all()

        print("Seeding Lorries...")
        own1 = Lorry(lorry_number="AP 39 TE 1234", owner_name="GVK Transport", lorry_type="OWN", emi_cost=45000.0, insurance_details="Valid till 2027", permit_details="All India")
        own2 = Lorry(lorry_number="TS 09 XY 9876", owner_name="GVK Transport", lorry_type="OWN", emi_cost=0.0, insurance_details="Valid till 2026", permit_details="All India")
        rent1 = Lorry(lorry_number="KA 01 AB 1111", owner_name="Raju Travels", lorry_type="RENTED", emi_cost=0.0)
        
        db.session.add_all([own1, own2, rent1])
        db.session.commit()

        print("Seeding Mine Purchases...")
        m1 = MinePurchase(mine_name="Singareni", material_name="Coal", tonnes=50.0, cost_per_ton=3000.0, loading_charges=2000.0, transport_hire=5000.0, total_buying=184000.0, payment_status="PAID")
        m2 = MinePurchase(mine_name="NMDC", material_name="Iron Ore", tonnes=100.0, cost_per_ton=1500.0, loading_charges=4000.0, transport_hire=10000.0, total_buying=191000.0, payment_status="PENDING")
        db.session.add_all([m1, m2])

        print("Seeding Factory Sales...")
        fs1 = FactorySale(factory_name="JSW Steel", material_name="Iron Ore", tonnes=100.0, selling_price_per_ton=2500.0, gst_percentage=18.0, total_sales_amount=295000.0, payment_received=100000.0, payment_pending=195000.0, payment_status="PARTIAL", due_date=datetime.utcnow() + timedelta(days=15))
        fs2 = FactorySale(factory_name="Adani Power", material_name="Coal", tonnes=50.0, selling_price_per_ton=4000.0, gst_percentage=18.0, total_sales_amount=236000.0, payment_received=236000.0, payment_pending=0.0, payment_status="PAID", due_date=datetime.utcnow() + timedelta(days=5))
        db.session.add_all([fs1, fs2])
        
        db.session.commit()

        print("✅ Database successfully seeded with fake data!")

if __name__ == '__main__':
    seed_db()
