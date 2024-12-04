class Config:
    SECRET_KEY = 'your-secret-key'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:123@localhost:5432/chess_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
