import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy import func

load_dotenv() 

app = Flask(__name__)
CORS(app)   # allow requests from React

# Database Connection
user = os.getenv('DB_USER')
password = os.getenv('DB_PASSWORD')
host = os.getenv('DB_HOST')
database = os.getenv('DB_NAME')

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{user}:{password}@{host}/{database}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# Sakila Tables
class Film(db.Model):
    __tablename__ = 'film'
    film_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text)
    description = db.Column(db.Text)                      
    release_year = db.Column(db.Integer)                  
    rental_duration = db.Column(db.Integer)           
    length = db.Column(db.Integer)                   
    replacement_cost = db.Column(db.Numeric(5,2))          
    rating = db.Column(db.String(10))                     
    special_features = db.Column(db.String(255))          
    last_update = db.Column(db.DateTime)

class FilmCategory(db.Model):
    __tablename__ = 'film_category'
    film_id = db.Column(db.Integer, db.ForeignKey('film.film_id'), primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.category_id'), primary_key=True)

class Category(db.Model):
    __tablename__ = 'category'
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(25), nullable=False)

class Inventory(db.Model):
    __tablename__ = 'inventory'
    inventory_id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.Integer, db.ForeignKey('film.film_id'))
    
class Rental(db.Model):
    __tablename__ = 'rental'
    rental_id = db.Column(db.Integer, primary_key=True)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.inventory_id'), primary_key=True)

class Actor(db.Model):
    __tablename__ = 'actor'
    actor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(45), nullable=False)
    last_name = db.Column(db.String(45), nullable=False)

class FilmActor(db.Model):
    __tablename__ = 'film_actor'
    actor_id = db.Column(db.Integer, db.ForeignKey('actor.actor_id'), primary_key=True)
    film_id = db.Column(db.Integer, db.ForeignKey('film.film_id'), primary_key=True)

@app.route("/")
def home():
    return jsonify({"message": "Testing Flask"})

@app.route('/api/films')
def get_sakila_films():
    user_search = request.args.get('search', '')
    
    results = Film.query.filter(Film.title.like(f"%{user_search}%")).all()
    
    output = []
    for film in results:
        output.append({
            "id": film.film_id,
            "title": film.title,
            "description": film.description,
            "year": film.release_year
        })
    return jsonify(output)

@app.route("/api/top5films")
def top_films_rented():
    results = db.session.query(
            Film.film_id,
            Film.title,
            Category.name.label('category'),
            func.count(Rental.rental_id).label('rented')
        ).join(FilmCategory, Film.film_id == FilmCategory.film_id) \
         .join(Category, FilmCategory.category_id == Category.category_id) \
         .join(Inventory, Film.film_id == Inventory.film_id) \
         .join(Rental, Inventory.inventory_id == Rental.inventory_id) \
         .group_by(Film.film_id, Film.title, Category.name) \
         .order_by(db.desc('rented'), Film.title.asc()) \
         .limit(5).all()

    output = []
    for row in results:
        output.append({
            "film_id": row.film_id,
            "title": row.title,
            "category": row.category,
            "rented": row.rented            
        })
            
    return jsonify(output)

@app.route('/api/films/<int:film_id>')
def get_film_info(film_id):
    film = Film.query.get(film_id)
        
    return jsonify({
            "id": film.film_id,
            "title": film.title,
            "description": film.description,
            "release_year": film.release_year,
            "rating": film.rating,
            "length": film.length,
            "replacement_cost": str(film.replacement_cost),
            "special_features": film.special_features
        })

@app.route("/api/top5actors")
def top_actors():
    results = db.session.query(
            Actor.actor_id,
            Actor.first_name,
            Actor.last_name,
            func.count(FilmActor.film_id).label('movies')
        ).join(FilmActor, Actor.actor_id == FilmActor.actor_id) \
         .group_by(Actor.actor_id) \
         .order_by(db.desc('movies')) \
         .limit(5).all()

    output = []
    for row in results:
        output.append({
            "actor_id": row.actor_id,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "movies": row.movies            
        })
            
    return jsonify(output)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)