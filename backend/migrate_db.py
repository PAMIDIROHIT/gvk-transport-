import sqlite3
import os

db_path = "c:\\Users\\rohit\\.gemini\\antigravity\\scratch\\gvk_transport\\gvk_transport_v2.db"

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # FactorySale migrations
    try:
        cursor.execute("ALTER TABLE factory_sale ADD COLUMN invoice_number VARCHAR(50)")
        cursor.execute("ALTER TABLE factory_sale ADD COLUMN vehicle_number VARCHAR(20)")
        cursor.execute("ALTER TABLE factory_sale ADD COLUMN driver_name VARCHAR(100)")
        cursor.execute("ALTER TABLE factory_sale ADD COLUMN destination VARCHAR(100)")
        cursor.execute("ALTER TABLE factory_sale ADD COLUMN advanced_payment FLOAT DEFAULT 0.0")
        print("Migrated factory_sale")
    except sqlite3.OperationalError:
        print("factory_sale already migrated or error occurred")

    # PrivateTransport migrations
    try:
        cursor.execute("ALTER TABLE private_transport ADD COLUMN diesel_advances FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN loading_charges FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN unloading_charges FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN shortage_amount FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN tds_percentage FLOAT DEFAULT 1.0")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN tds_amount FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN amount_paid FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING'")
        cursor.execute("ALTER TABLE private_transport ADD COLUMN owner_bank_details TEXT")
        print("Migrated private_transport")
    except sqlite3.OperationalError:
        print("private_transport already migrated or error occurred")

    # OtherExpense migrations
    try:
        cursor.execute("ALTER TABLE other_expense ADD COLUMN category VARCHAR(50) DEFAULT 'BUSINESS'")
        cursor.execute("ALTER TABLE other_expense ADD COLUMN sub_category VARCHAR(50)")
        cursor.execute("ALTER TABLE other_expense ADD COLUMN paid_to VARCHAR(100)")
        cursor.execute("ALTER TABLE other_expense ADD COLUMN payment_mode VARCHAR(20) DEFAULT 'CASH'")
        print("Migrated other_expense")
    except sqlite3.OperationalError:
        print("other_expense already migrated or error occurred")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
