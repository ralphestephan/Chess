from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
# Import other models here


db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_object('config')  # Load configuration

    db.init_app(app)  # Attach database to Flask app
    migrate.init_app(app, db)  # Initialize Flask-Migrate

    # Register Blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app
