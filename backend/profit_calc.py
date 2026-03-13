from models import db, MinePurchase, FactoryLoading, FactorySale, Lorry, FuelRecord, LorryExpense, OtherExpense
from sqlalchemy import func

class ProfitCalculator:
    """
    Handles the complex business logic for GVK Transport profit calculation.
    Designed to be readable so beginners can understand how money flows.
    """
    
    @staticmethod
    def get_total_income(start_date=None, end_date=None):
        """
        Total Income = Money made from Factory Sales + Money made directly by our own Lorries.
        """
        # Query 1: Total Factory Sales
        sales_query = FactorySale.query
        if start_date and end_date:
            sales_query = sales_query.filter(FactorySale.date.between(start_date, end_date))
        total_sales = db.session.query(func.sum(FactorySale.total_amount)).scalar() or 0.0

        # Query 2: Lorry direct income (if they took outside jobs)
        lorry_query = Lorry.query
        # Note: In a real system you'd track individual trip income per timeframe,
        # but for this basic calculation, we'll sum the Lorry model's master income field.
        total_lorry_income = db.session.query(func.sum(Lorry.income)).scalar() or 0.0

        return total_sales + total_lorry_income

    @staticmethod
    def get_total_expenses(start_date=None, end_date=None):
        """
        Total Expenses = Mine Purchases + Factory Transport Costs (rent/vendor) + Fuel + Lorry Expenses + General Expenses
        """
        # 1. Cost of buying material from the mine
        mine_query = db.session.query(func.sum(MinePurchase.total_buying)).scalar() or 0.0
        
        # 2. Fuel Costs
        fuel_query = db.session.query(func.sum(FuelRecord.total_cost)).scalar() or 0.0
        
        # 3. Lorry Operating Expenses (Driver salary, maintenance, EMI, etc)
        lorry_exp_query = db.session.query(func.sum(LorryExpense.total_amount)).scalar() or 0.0
        
        # 4. Other Expenses (Taxes, formalities)
        other_exp_query = db.session.query(func.sum(OtherExpense.total_amount)).scalar() or 0.0

        return mine_query + fuel_query + lorry_exp_query + other_exp_query

    @staticmethod
    def calculate_net_profit(start_date=None, end_date=None):
        """
        Net Profit = Total Income - Total Expenses
        """
        income = ProfitCalculator.get_total_income(start_date, end_date)
        expenses = ProfitCalculator.get_total_expenses(start_date, end_date)
        return income - expenses

    @staticmethod
    def calculate_partner_split(net_profit, partner1_name="Partner 1", partner2_name="Partner 2", ratio=0.5):
        """
        Splits the net profit between two partners.
        Ratio is 0.5 for a 50/50 split.
        """
        partner1_share = net_profit * ratio
        partner2_share = net_profit * (1 - ratio)
        
        return {
            "net_profit": net_profit,
            "split": [
                {"name": partner1_name, "share": partner1_share},
                {"name": partner2_name, "share": partner2_share}
            ]
        }
