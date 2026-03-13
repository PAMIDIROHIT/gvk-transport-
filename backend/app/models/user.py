from . import db

class User(db.Model):
    """
    User model to store login credentials.
    Roles are either 'OWNER' (full access) or 'ACCOUNTANT' (view only).
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False) # We store hashes, never plaintext passwords
    role = db.Column(db.String(20), nullable=False, default='ACCOUNTANT')
