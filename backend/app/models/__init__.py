from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from .user import User
from .mine import MinePurchase
from .factory import FactoryLoading, FactorySale
from .lorry import Lorry, TripRecord, FuelRecord, DriverExpense, LorryEmi, MaintenanceRecord, PrivateTransport
from .expense import OtherExpense
