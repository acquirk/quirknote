from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
import sys

print(sys.executable)
print(sys.path)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///quirknote.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Bucket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    bucket_id = db.Column(db.Integer, db.ForeignKey('bucket.id'), nullable=False)

@app.route('/')
def index():
    buckets = Bucket.query.all()
    return render_template('index.html', buckets=buckets)

@app.route('/add_note', methods=['POST'])
def add_note():
    content = request.form['content']
    bucket_id = request.form['bucket_id']
    new_note = Note(content=content, bucket_id=bucket_id)
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
