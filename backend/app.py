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

class Actor(db.Model):
    __tablename__ = 'actor' 
    actor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(45), nullable=False)
    last_name = db.Column(db.String(45), nullable=False)

class FilmActor(db.Model):
    __tablename__ = 'film_actor'
    actor_id = db.Column(db.Integer, db.ForeignKey('actor.actor_id'), primary_key=True)
    film_id = db.Column(db.Integer, db.ForeignKey('film.film_id'), primary_key=True)

class Customer(db.Model):
    __tablename__ = 'customer' 
    customer_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(45))
    last_name = db.Column(db.String(45)) 
    email = db.Column(db.String(50))
    address_id = db.Column(db.Integer, db.ForeignKey('address.address_id'))
    create_date = db.Column(db.DateTime)
    last_update = db.Column(db.DateTime)

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

'''@app.route("/")
def home():
    return jsonify({"message": "Testing Flask"})
'''

@app.route('/api/films')
def get_sakila_films():
    user_search = request.args.get('search', '')

    results = db.session.query(
            Film.film_id,
            Film.title,
            Film.release_year,
            func.max(Category.name).label('category'),
            func.max(Actor.first_name).label('first_name'),
            func.max(Actor.last_name).label('last_name')
        ).join(FilmCategory, Film.film_id == FilmCategory.film_id)\
         .join(Category, FilmCategory.category_id == Category.category_id) \
         .join(FilmActor, Film.film_id == FilmActor.film_id) \
         .join(Actor, FilmActor.actor_id == Actor.actor_id) \
         .filter( or_ (
            Film.film_id.like(f"%{user_search}%"),
            Film.title.like(f"%{user_search}%"),
            Actor.first_name.like(f"%{user_search}%"),
            Actor.last_name.like(f"%{user_search}%"),
            Category.name.like(f"%{user_search}%"),
        ))\
         .group_by(Film.film_id)\
         .order_by(Film.title.asc()) \
         .all()
    
    return jsonify([{
        "id": f.film_id, 
        "title": f.title, 
        "year": f.release_year} 
        for f in results])



@app.route('/api/films/<int:id>')
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

@app.route('/api/film_details/<int:id>') 
def films_details(id):
   
    film = db.session.query(
            Film.film_id,
            Film.title,
            Film.description,
            Film.length,
            Film.release_year,
            Film.rating,
            Film.replacement_cost,
            Film.special_features
        ).filter(Film.film_id == id).first() 

    if not film:
        return jsonify({"error": "Film not found"}), 404
    
    return jsonify({
        "id": film.film_id,
        "title": film.title,
        "description": film.description,
        "year": film.release_year,
        "length": film.length,
        "rating": film.rating,
        "replacement_cost": film.replacement_cost,
        "special_features": str(film.special_features)
    })
'''
@app.route('/api/film_details_ma/<int:id>') 
def films_details(id):
    film = db.session.query(Film).filter(Film.film_id == id).first() 
    if not film:
        return jsonify({"error": "Film not found"}), 404
    return jsonify({
        "id": film.film_id,
        "title": film.title,
        "description": film.description,
        "year": film.release_year,
        "length": film.length,
        "rating": film.rating
    })
'''
@app.route('/api/customer_all')
def customer_all():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    limitss = 15
    offset_value = (page - 1) * limitss

    query = db.session.query(
        Customer.customer_id,
        Customer.first_name,
        Customer.last_name,
        Customer.email,
        Address.address,
        Address.phone
    ).join(Address, Customer.address_id == Address.address_id)
    if search:
        query = query.filter(or_(
            Customer.customer_id.like(f"%{search}%"),
            Customer.first_name.like(f"%{search}%"),
            Customer.last_name.like(f"%{search}%")
        ))

    total_records = query.count()
    results = query.order_by(Customer.customer_id.asc()) \
                   .limit(limitss) \
                   .offset(offset_value) \
                   .all()

    customers_list = [{
        "id": c.customer_id,
        "first_name": c.first_name,
        "last_name": c.last_name,
        "email": c.email
    } for c in results] 
    
    return jsonify({
        "customers": customers_list,
        "total_records": total_records,
        "total_pages": (total_records + limitss - 1) // limitss 
    })

@app.route('/api/customer_details/<int:id>')
def customer_details(id):
    user_search = request.args.get('search', '')
    
    customer = db.session.query(
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
         .filter(Customer.customer_id == id) \
         .first()
    
    
    if not customer: 
        return jsonify({"error": "Customer not found"}), 404

    return jsonify({
        "id": customer.customer_id,
        "first_name": customer.first_name,
        "last_name": customer.last_name,
        "email": customer.email,
        "address": customer.address,
        "phone": customer.phone
    })

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

@app.route('/api/actors/<int:actor_id>')
def get_actor_info(actor_id):
    actor = Actor.query.get(actor_id)

    top_films =db.session.query(
        Film.film_id,
        Film.title,
        func.count(Rental.rental_id).label('rental_count')
    ).join(FilmActor, Film.film_id == FilmActor.film_id) \
     .join(Actor, FilmActor.actor_id == Actor.actor_id) \
     .join(Inventory, Film.film_id == Inventory.film_id) \
     .join(Rental, Inventory.inventory_id == Rental.inventory_id) \
     .filter(FilmActor.actor_id == actor_id) \
     .group_by(Film.title, Film.film_id) \
     .order_by(db.desc('rental_count')) \
     .limit(5).all()
     
    output = []
    for row in top_films:
        output.append({
            "film_id": row.film_id,
            "title": row.title,
            "rental_count": row.rental_count          
        })    
    return jsonify(output)

#Add new customer
@app.route('/api/customers', methods=['POST'])
def add_customer():
    data = request.get_json()
    
    user_country = data.get('country', '').strip().title()
    user_city = data.get('city', '').strip().title()

    try:
        country_record = Country.query.filter(func.lower(Country.country) == user_country.lower()).first()
        
        if not country_record:
            return jsonify({"error": f"Country '{user_country}' not found in database"})
        
        city_record = City.query.filter(
            func.lower(City.city) == user_city.lower(), 
            City.country_id == country_record.country_id
        ).first()

        if not city_record:
            city_record = City(city=user_city.title(), country_id=country_record.country_id)
            db.session.add(city_record)
            db.session.flush()

        new_address = Address(
            address=data['address'],
            address2=data['address2', ''],
            district=data.get('district'),
            city_id=city_record.city_id,
            postal_code=data.get('postal_code', ''),
            phone=data['phone'] 
        )
        db.session.add(new_address)
        db.session.flush()

        new_customer = Customer(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            address_id=new_address.address_id,
            store_id=1,
            active=1
        )
        db.session.add(new_customer)
        
        db.session.commit()
        return jsonify({"message": "Customer created successfully!", "id": new_customer.customer_id})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)})
    
#Edit customer details 
@app.route('/api/customers/edit/<int:id>', methods=['PUT'])
def edit_customer(id):
    data = request.get_json()

    customer = Customer.query.get_or_404(id)
    address_record = Address.query.get(customer.address_id)
    
    try:
        customer.first_name = data.get('first_name', customer.first_name)
        customer.last_name = data.get('last_name', customer.last_name)
        customer.email = data.get('email', customer.email)

       
        user_country = data.get('country', '').strip()
        user_city = data.get('city', '').strip()

        if user_country and user_city:
            country_rec = Country.query.filter(func.lower(Country.country) == user_country.lower()).first()
            if country_rec:
                city_rec = City.query.filter(
                    func.lower(City.city) == user_city.lower(), 
                    City.country_id == country_rec.country_id
                ).first()
                
                if not city_rec:
                    city_rec = City(city=user_city.title(), country_id=country_rec.country_id)
                    db.session.add(city_rec)
                    db.session.flush()
                
                address_record.city_id = city_rec.city_id

        address_record.address = data.get('address', address_record.address)
        address_record.address2 = data.get('address2', address_record.address2)
        address_record.postal_code = data.get('postal_code', address_record.postal_code)
        address_record.phone = data.get('phone', address_record.phone)
        address_record.district = data.get('district', address_record.district)

        db.session.commit()
        return jsonify({"message": "Customer updated successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)