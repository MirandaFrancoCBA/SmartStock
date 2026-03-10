# SmartStock – Inventory Management System

SmartStock is a backend-driven inventory management system designed to manage products, suppliers, and stock movements efficiently.

This project was developed as a **professional portfolio project** to demonstrate backend architecture, REST API development, and scalable service design using modern Python technologies.

---

# Overview

SmartStock allows businesses to manage their inventory through a structured backend system with:

* Product catalog management
* Supplier tracking
* Inventory movement history
* Automated stock updates
* REST API for frontend integration

The backend is built with **Django and Django REST Framework**, following a modular architecture and best practices for API development.

---

# Tech Stack

## Backend

* Python
* Django
* Django REST Framework
* django-filter
* drf-spectacular (OpenAPI documentation)

## Database

* SQLite (development)
* PostgreSQL (planned for production)

## Frontend (planned)

* Angular
* TypeScript
* Chart.js

## DevOps (planned)

* Docker
* Railway / Render deployment

---

# Core Features

## Product Management

* Create and manage products
* SKU management
* Product categories
* Supplier relationships
* Price and stock tracking

---

## Supplier Management

* Store supplier information
* Track which suppliers provide each product

---

## Inventory Movements

* Register **IN** and **OUT** stock movements
* Track movement history
* Record the user performing each movement

---

## Automated Stock Updates

Stock levels are automatically updated using **Django Signals** when a movement is created.

Example:

```
IN movement  → increases stock
OUT movement → decreases stock
```

---

# REST API

The backend exposes a RESTful API for integration with external clients such as Angular applications.

Example endpoints:

```
/api/products
/api/categories
/api/suppliers
/api/movements
```

---

# API Features

### Filtering

```
/api/products/?category=1
```

### Searching

```
/api/products/?search=maceta
```

### Ordering

```
/api/products/?ordering=price
/api/products/?ordering=-price
```

### Pagination

```
/api/products/?page=2
```

---

# API Documentation

Interactive API documentation is available using OpenAPI.

Swagger UI:

```
/api/docs/
```

ReDoc:

```
/api/redoc/
```

These interfaces allow developers to explore and test the API directly from the browser.

---

# Project Structure

```
backend/
│
├── config/        # Django project configuration
├── products/      # Product domain models and API
├── inventory/     # Inventory movement logic
├── services/      # Business logic layer
│
├── manage.py
└── db.sqlite3
```

---

# Installation

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/smartstock.git
```

Navigate to the backend:

```
cd smartstock/backend
```

Create virtual environment:

```
python -m venv venv
```

Activate it:

Windows:

```
venv\Scripts\activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Run migrations:

```
python manage.py migrate
```

Create admin user:

```
python manage.py createsuperuser
```

Run the server:

```
python manage.py runserver
```

---

# Future Improvements

* JWT authentication
* Role-based permissions
* Advanced reporting endpoints
* Angular frontend dashboard
* Docker containerization
* PostgreSQL production database
* Real-time stock updates (WebSockets)

---

# Author

**Franco Rodrigo Miranda**

Software Development Student – Argentina

LinkedIn
https://www.linkedin.com/in/franco-rodrigo-miranda-993710248

GitHub
https://github.com/MirandaFrancoCBA
