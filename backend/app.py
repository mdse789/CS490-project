import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy import or_, func

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

class FilmActor(db.Model):
    __tablename__ = 'film_actor'
    actor_id = db.Column(db.Integer,primary_key=True)
    film_id = db.Column(db.Integer,primary_key=True)

class Actor(db.Model):
    __tablename__ = 'actor' 
    actor_id = db.Column(db.Integer,primary_key=True)
    first_name = db.Column(db.Text)
    last_name = db.Column(db.Text)

class Customer(db.Model):
    __tablename__ = 'customer' 
    customer_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(45))
    last_name = db.Column(db.String(45)) 
    email = db.Column(db.String(50))
    address_id = db.Column(db.Integer, db.ForeignKey('address.address_id'))

class Address(db.Model):
    __tablename__ = 'address' 
    address_id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(50))
    address2 = db.Column(db.String(50))
    district = db.Column(db.String(20))
    city_id = db.Column(db.Integer, db.ForeignKey('city.city_id'))
    postal_code = db.Column(db.String(50))
    phone = db.Column(db.String(50))

class City(db.Model):
    __tablename__ = 'city' 
    city_id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(50))
    country_id = db.Column(db.Integer, db.ForeignKey('country.country_id'))

class Country(db.Model):
    __tablename__ = 'country'
    country_id = db.Column(db.Integer, primary_key=True)    
    country = db.Column(db.String(50))

@app.route("/")
def home():
    return jsonify({"message": "Testing Flask"})

@app.route('/api/films')
def get_sakila_films():
    user_search = request.args.get('search', '')
    
    results = db.session.query(
            Film.film_id,
            Film.title,
            Film.description,
            func.max(Category.name).label('category'),
            func.max(Actor.first_name).label('first_name'),
            func.max(Actor.last_name).label('last_name')
        ).join(FilmCategory, Film.film_id == FilmCategory.film_id)\
         .join(Category, FilmCategory.category_id == Category.category_id) \
         .join(FilmActor, Film.film_id == FilmActor.film_id) \
         .join(Actor, FilmActor.actor_id == Actor.actor_id) \
         .filter( or_ (
            Film.title.like(f"%{user_search}%"),
            Actor.first_name.like(f"%{user_search}%"),
            Actor.last_name.like(f"%{user_search}%"),
            Category.name.like(f"%{user_search}%"),
        ))\
         .group_by(Film.film_id)\
         .order_by(Film.title.asc()) \
         .all()
    
    output = []
    for film in results:
        output.append({
            "id": film.film_id,
            "title": film.title,
            "description": film.description,
            #"year": film.release_year
        })
    return jsonify(output)

#film details
@app.route('/api/film_details')
def films_details():
    user_search = request.args.get('search', '')
    
    results = db.session.query(
            Film.film_id,
            Film.title,
            Film.description,
            Film.length,
            Film.release_year,
            Film.rating,
        ).join(FilmCategory, Film.film_id == FilmCategory.film_id)\
         .join(Category, FilmCategory.category_id == Category.category_id) \
         .group_by(Film.film_id)\
         .order_by(Film.title.asc()) \
         .all()
    
    output = []
    for filmd in results:
        output.append({
            "id": filmd.film_id,
            "title": filmd.title,
            "description": filmd.description,
            "year": filmd.release_year,
            "length": filmd.length,
            "rating": filmd.rating
        })
    return jsonify(output)

#customer details
@app.route('/api/customer_details')
def customer_details():
    user_search = request.args.get('search', '')
    
    results = db.session.query(
            Customer.customer_id,
            Customer.first_name,
            Customer.last_name,
            Customer.email,
            Address.address,
            Address.phone,
            City.city,
            Country.country
        ).join(Address, Customer.address_id == Address.address_id) \
         .join(City, Address.city_id == City.city_id) \
         .join(Country, City.country_id == Country.country_id) \
         .filter(or_(
            Customer.customer_id.like(f"%{user_search}%"),
            Customer.first_name.like(f"%{user_search}%"),
            Customer.last_name.like(f"%{user_search}%"),
            Customer.email.like(f"%{user_search}%")
         )) \
         .order_by(Customer.customer_id.asc()) \
         .all()
    
    output = []
    for customer in results:
        output.append({
            "id": customer.customer_id,
            "first name": customer.first_name,
            "last name": customer.last_name,
            "email": customer.email,
            "address": customer.address,
            "phone": customer.phone
        })
    return jsonify(output)

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