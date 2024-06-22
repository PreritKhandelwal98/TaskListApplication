from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    
    # Load configuration from config.py
    app.config.from_object('config.Config')
    
    # Initialize PyMongo with the app
    mongo.init_app(app)
    
    # Enable CORS
    CORS(app)
    
    # Register routes
    with app.app_context():
        from .routes import register_routes
        register_routes(app)

        # Check MongoDB connection
        db = mongo.cx[mongo.db.name]
        # print(f"Database Name: {db.name}")
        # print(f"Collections: {db.list_collection_names()}")

        return app
