from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')  # Load configuration

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Import and register blueprints
    from app.routes import auth_bp, chess_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(chess_bp, url_prefix='/chess')

    return app
