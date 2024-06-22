import os

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://prerit:Kj4ewkXr6UJRXSpe@cluster0.icbfbao.mongodb.net/tasks_db')
    DEBUG = True
