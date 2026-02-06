import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

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

@app.route("/")
def home():
    return jsonify({"message": "Testing Flask"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

