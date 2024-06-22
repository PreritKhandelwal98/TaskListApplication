from datetime import datetime
from . import db

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    entity_name = db.Column(db.String(80), nullable=False)
    task_type = db.Column(db.String(50), nullable=False)
    task_time = db.Column(db.DateTime, nullable=False)
    contact_person = db.Column(db.String(80), nullable=False)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(10), default='open')

    def to_dict(self):
        return {
            'id': self.id,
            'date_created': self.date_created.isoformat(),
            'entity_name': self.entity_name,
            'task_type': self.task_type,
            'task_time': self.task_time.isoformat(),
            'contact_person': self.contact_person,
            'note': self.note,
            'status': self.status
        }
