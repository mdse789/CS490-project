import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy import func

load_dotenv() 

app = Flask(__name__)
CORS(app)   # allow requests from React

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


@app.route("/")
def home():
    return jsonify({"message": "Testing Flask"})

# Top 5 most rented films 
@app.route("/top5films")
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

        # Format for React
    output = []
    for row in results:
        output.append({
            "film_id": row.film_id,
            "title": row.title,
            "category": row.category,
            "rented": row.rented            
        })
            
    return jsonify(output)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

