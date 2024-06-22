from flask import request, jsonify
from . import mongo
from bson import ObjectId
from datetime import datetime

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
            task_time = datetime.strptime(data['task_time'], '%H:%M').time()
        except ValueError as e:
            return jsonify({'error': 'Invalid date or time format'}), 400

        task = {
            'date': data['date'],  # Store date as ISO formatted string
            'entity_name': data['entity_name'],
            'task_type': data['task_type'],
            'task_time': data['task_time'],  # Store time as ISO formatted string
            'contact_person': data['contact_person'],
            'note': data.get('notes'),
            'status': 'open',  # Set status to 'open' by default
            'contact_number':data['contact_number']
        }

        mongo.db.tasks.insert_one(task)
        task['_id'] = str(task['_id'])
        print(f"Task created: {task}")
        return jsonify(task), 201

    @app.route('/tasks', methods=['GET'])
    def get_tasks():
        print("Fetching tasks...")
        tasks = list(mongo.db.tasks.find())
        for task in tasks:
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

        # Validate and parse date and task_time if provided
        if 'date' in data:
            try:
                data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date().isoformat()
            except ValueError as e:
                return jsonify({'error': 'Invalid date format'}), 400
        if 'task_time' in data:
            try:
                data['task_time'] = datetime.strptime(data['task_time'], '%H:%M').time().isoformat()
            except ValueError as e:
                return jsonify({'error': 'Invalid time format'}), 400

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
            filter_criteria['contact_person'] = query_params.get('contact_person')
        if 'entity_name' in query_params:
            filter_criteria['entity_name'] = query_params.get('entity_name')

        print(f"Filtering tasks with criteria: {filter_criteria}")
        tasks = list(mongo.db.tasks.find(filter_criteria))
        for task in tasks:
            task['_id'] = str(task['_id'])
        return jsonify(tasks)

    @app.route('/contacts', methods=['GET'])
    def get_contacts():
        print("Fetching contact persons...")
        contacts = list(mongo.db.tasks.find({}, {'contact_person': 1, '_id': 0}))
        contact_persons = [contact['contact_person'] for contact in contacts]
        return jsonify(contact_persons)
