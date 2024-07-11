from datetime import datetime
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    contact_number = db.Column(db.String(20), nullable=True)
    tasks = db.relationship('Task', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'contact_number': self.contact_number
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    entity_name = db.Column(db.String(80), nullable=False)
    task_type = db.Column(db.String(50), nullable=False)
    task_time = db.Column(db.DateTime, nullable=False)
    contact_person_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(10), default='open')

    def to_dict(self):
        return {
            'id': self.id,
            'date_created': self.date_created.isoformat(),
            'entity_name': self.entity_name,
            'task_type': self.task_type,
            'task_time': self.task_time.isoformat(),
            'contact_person': self.user.to_dict(),
            'note': self.note,
            'status': self.status
        }
