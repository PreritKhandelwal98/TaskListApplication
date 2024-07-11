from flask import request, jsonify
from . import mongo
from bson import ObjectId
from datetime import datetime
from .send_email import send_email  # Make sure you have your email sending module

def register_routes(app):
    @app.route('/')
    def index():
        print("Accessed the default route")
        return "Welcome to the Task API!"

    @app.route('/tasks', methods=['POST'])
    def create_task():
        data = request.json
        print(f"Received data for new task: {data}")

        # Validate and parse date and task_time
        try:
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError as e:
            return jsonify({'error': 'Invalid date format'}), 400
        try:
            task_time = datetime.strptime(data['task_time'], '%I:%M %p').time().strftime('%I:%M %p')
        except ValueError as e:
            return jsonify({'error': 'Invalid time format'}), 400

        # Fetch contact person's email from the database
        contact_person = mongo.db.users.find_one({'name': data['contact_person']})
        if not contact_person:
            return jsonify({'error': 'Contact person not found'}), 400

        task = {
            'date': data['date'],  # Store date as ISO formatted string
            'entity_name': data['entity_name'],
            'task_type': data['task_type'],
            'task_time': data['task_time'],  # Store time as ISO formatted string
            'contact_person_id': str(contact_person['_id']),
            'note': data.get('note'),
            'status': 'open',  # Set status to 'open' by default
        }

        mongo.db.tasks.insert_one(task)
        task['_id'] = str(task['_id'])
        print(f"Task created: {task}")

        # Send email notification to the contact person
        subject = f"Task Assigned: {task['task_type']}"
        message = f"Hello {contact_person['name']},\n\nA new task has been assigned to you:\n\n" \
                  f"Entity: {task['entity_name']}\n" \
                  f"Task Type: {task['task_type']}\n" \
                  f"Date: {task['date']}\n" \
                  f"Time: {task['task_time']}\n" \
                  f"Notes: {task['note']}\n\n" \
                  f"Please complete the task as soon as possible.\n\n" \
                  f"Best regards,\nYour Task Management System"

        send_email(contact_person['email'], subject, message)

        return jsonify(task), 201

    @app.route('/tasks', methods=['GET'])
    def get_tasks():
        tasks = list(mongo.db.tasks.find())
        for task in tasks:
            if 'contact_person_id' in task:  # Ensure contact_person_id exists in the task document
                contact_person = mongo.db.users.find_one({'_id': ObjectId(task['contact_person_id'])})
                if contact_person:
                    task['contact_person'] = {'name': contact_person['name']}
                else:
                    task['contact_person'] = {'name': 'Unknown'}
            task['_id'] = str(task['_id'])
        return jsonify(tasks)

    @app.route('/tasks/<task_id>', methods=['PUT'])
    def update_task(task_id):
        data = request.json
        print(f"Updating task with id: {task_id} with data: {data}")

        # Validate task status and task type
        if 'status' in data and data['status'] not in ['open', 'closed']:
            return jsonify({'error': 'Invalid status. Must be "open" or "closed"'}), 400
        if 'task_type' in data and data['task_type'] not in ['meeting', 'call', 'video call']:
            return jsonify({'error': 'Invalid task type. Must be "meeting", "call", or "video call"'}), 400

        # Validate and parse date if provided
        if 'date' in data:
            try:
                data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date().isoformat()
            except ValueError as e:
                return jsonify({'error': 'Invalid date format'}), 400

        # Validate and parse task_time with AM/PM if provided
        if 'task_time' in data:
            try:
                data['task_time'] = datetime.strptime(data['task_time'], '%I:%M %p').time().strftime('%I:%M %p')
            except ValueError as e:
                return jsonify({'error': 'Invalid time format. Must be in HH:MM AM/PM format'}), 400

        mongo.db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': data}
        )
        task = mongo.db.tasks.find_one({'_id': ObjectId(task_id)})
        task['_id'] = str(task['_id'])
        return jsonify(task)

    @app.route('/tasks/<task_id>/status', methods=['PUT'])
    def change_status(task_id):
        data = request.json
        print(f"Changing status of task with id: {task_id} to {data.get('status')}")

        # Validate task status
        if data.get('status') not in ['open', 'closed']:
            return jsonify({'error': 'Invalid status. Must be "open" or "closed"'}), 400

        mongo.db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {'status': data.get('status')}}
        )
        task = mongo.db.tasks.find_one({'_id': ObjectId(task_id)})
        task['_id'] = str(task['_id'])
        return jsonify(task)

    @app.route('/tasks/<task_id>', methods=['DELETE'])
    def delete_task(task_id):
        print(f"Deleting task with id: {task_id}")
        mongo.db.tasks.delete_one({'_id': ObjectId(task_id)})
        return '', 204

    @app.route('/tasks/filter', methods=['GET'])
    def filter_tasks():
        query_params = request.args
        filter_criteria = {}

        if 'status' in query_params:
            filter_criteria['status'] = query_params.get('status')
        if 'task_type' in query_params:
            filter_criteria['task_type'] = query_params.get('task_type')
        if 'contact_person' in query_params:
            contact_person = mongo.db.users.find_one({'name': query_params.get('contact_person')})
            if contact_person:
                filter_criteria['contact_person_id'] = str(contact_person['_id'])
        if 'entity_name' in query_params:
            filter_criteria['entity_name'] = query_params.get('entity_name')

        # Filter by date if provided
        if 'date' in query_params:
            try:
                filter_criteria['date'] = datetime.strptime(query_params['date'], '%Y-%m-%d').date().isoformat()
            except ValueError as e:
                return jsonify({'error': 'Invalid date format. Must be in YYYY-MM-DD format'}), 400

        # Filter by task_time if provided
        if 'task_time' in query_params:
            try:
                filter_criteria['task_time'] = datetime.strptime(query_params['task_time'], '%I:%M %p').time().strftime('%I:%M %p')
            except ValueError as e:
                return jsonify({'error': 'Invalid time format. Must be in HH:MM AM/PM format'}), 400

        print(f"Filtering tasks with criteria: {filter_criteria}")
        tasks = list(mongo.db.tasks.find(filter_criteria))
        for task in tasks:
            task['_id'] = str(task['_id'])
        return jsonify(tasks)

    @app.route('/tasks/contacts', methods=['GET'])
    def get_contacts():
        print("Fetching contact persons...")
        contacts = list(mongo.db.users.find({}, {'name': 1, 'email': 1, 'contact_number':1,'_id': 0}))
        return jsonify(contacts)

    @app.route('/tasks/<task_id>/note', methods=['PUT'])
    def update_task_note(task_id):
        data = request.json
        print(f"Updating note for task with id: {task_id} with data: {data}")

        # Validate and parse note
        if 'note' not in data or not data['note'].strip():
            return jsonify({'error': 'Note cannot be empty'}), 400

        mongo.db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {'note': data['note']}}
        )
        task = mongo.db.tasks.find_one({'_id': ObjectId(task_id)})
        task['_id'] = str(task['_id'])
        return jsonify(task)
    

    @app.route('/users', methods=['POST'])
    def create_user():
        data = request.json
        print(f"Received data for user: {data}")

        user = {
            'name': data['name'],  # Store date as ISO formatted string
            'email': data['email'],
            'contact_number': data.get('contact_number')
        }

        mongo.db.users.insert_one(user)
        user['_id'] = str(user['_id'])
        print(f"Task created: {user}")

        return jsonify(user), 201
