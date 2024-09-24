from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
import sys

print(sys.executable)
print(sys.path)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///quirknote.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Bucket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    bucket_id = db.Column(db.Integer, db.ForeignKey('bucket.id'), nullable=False)
    is_todo = db.Column(db.Boolean, default=False)
    completed = db.Column(db.Boolean, default=False)

def get_or_create_inbox():
    inbox = Bucket.query.filter_by(name="Inbox").first()
    if not inbox:
        inbox = Bucket(name="Inbox")
        db.session.add(inbox)
        db.session.commit()
    return inbox

@app.route('/')
def index():
    buckets = Bucket.query.all()
    return render_template('index.html', buckets=buckets)

@app.route('/add_note', methods=['POST'])
def add_note():
    content = request.form['content']
    is_todo = request.form.get('is_todo') == 'true'
    bucket_id = request.form.get('bucket_id')
    
    if not bucket_id:
        inbox = get_or_create_inbox()
        bucket_id = inbox.id
    
    new_note = Note(content=content, bucket_id=bucket_id, is_todo=is_todo)
    db.session.add(new_note)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/add_bucket', methods=['POST'])
def add_bucket():
    name = request.form['name']
    new_bucket = Bucket(name=name)
    db.session.add(new_bucket)
    db.session.commit()
    return jsonify({'success': True, 'id': new_bucket.id, 'name': new_bucket.name})

@app.route('/bucket/<int:bucket_id>')
def bucket_notes(bucket_id):
    bucket = Bucket.query.get_or_404(bucket_id)
    notes = Note.query.filter_by(bucket_id=bucket_id).all()
    return render_template('bucket.html', bucket=bucket, notes=notes)

@app.route('/update_note_status', methods=['POST'])
def update_note_status():
    note_id = request.form.get('note_id')
    completed = request.form.get('completed') == 'true'
    
    note = Note.query.get_or_404(note_id)
    note.completed = completed
    db.session.commit()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

# Ensure tables are created
with app.app_context():
    db.create_all()
    
    # Add some initial data if the database is empty
    if not Bucket.query.first():
        initial_buckets = [
            Bucket(name="Inbox"),
            Bucket(name="Home"),
            Bucket(name="Work"),
            Bucket(name="Personal")
        ]
        db.session.add_all(initial_buckets)
        db.session.commit()
