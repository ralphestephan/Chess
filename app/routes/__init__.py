from flask import Flask
from flask_migrate import Migrate
from app import db  # Ensure you import the SQLAlchemy db instance

migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_object('config')  # Load your config
    db.init_app(app)  # Attach the database instance to the app
    migrate.init_app(app, db)  # Initialize Flask-Migrate with the app and database

    # Register your blueprints here
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app
