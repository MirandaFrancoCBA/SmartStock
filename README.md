# SmartStock – Inventory Management System

SmartStock is a full-stack inventory management system designed to manage products, suppliers, and stock movements efficiently.
This project was developed as a professional portfolio project to demonstrate backend architecture, REST API development, and full-stack integration.

## Overview

SmartStock allows businesses to manage their inventory through a structured backend system with automated stock updates, supplier tracking, and detailed inventory movements.

The system is built with a modern backend architecture using Django and Django REST Framework and will be extended with an Angular frontend.

---

## Tech Stack

### Backend

* Python 3
* Django
* Django REST Framework
* SQLite (development)
* PostgreSQL (planned for production)

### Frontend (planned)

* Angular
* TypeScript
* Chart.js (for dashboards)

### DevOps (planned)

* Docker
* Railway / Render deployment

---

## Core Features

### Product Management

* Create and manage products
* Assign categories and suppliers
* SKU management
* Price and stock tracking

### Supplier Management

* Store supplier information
* Track supplier-product relationships

### Inventory Movements

* Track incoming and outgoing stock
* Movement history
* User tracking for inventory actions

### Automated Stock Updates

Stock is automatically updated using Django signals when a movement is created.

Example:

IN movement → increases stock
OUT movement → decreases stock

### REST API

The backend exposes a RESTful API for integration with the Angular frontend.

API endpoints include:

/api/products
/api/categories
/api/suppliers
/api/movements

---

## Project Structure

backend/
├── config
├── products
├── inventory
├── services
├── manage.py
└── db.sqlite3

products → product domain logic
inventory → inventory movements and stock logic

---

## Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/smartstock.git

Navigate into the project:

cd smartstock/backend

Create a virtual environment:

python -m venv venv

Activate the environment:

Windows:
venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Run migrations:

python manage.py migrate

Create superuser:

python manage.py createsuperuser

Run server:

python manage.py runserver

---

## API Testing

Open in browser:

http://127.0.0.1:8000/api/

Django REST Framework provides a browsable API for testing endpoints.

---

## Future Improvements

* JWT authentication
* Role-based permissions
* Advanced filtering and search
* Dashboard analytics
* Angular frontend
* Docker deployment
* PostgreSQL production database
* Real-time stock updates (WebSockets)

---

## Author

Franco Rodrigo Miranda
Software Development Student – Argentina

LinkedIn
https://www.linkedin.com/in/franco-rodrigo-miranda-993710248

GitHub
https://github.com/MirandaFrancoCBA
