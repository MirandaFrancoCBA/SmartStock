# SmartStock – Inventory Management System

SmartStock is a backend-driven inventory management system designed to manage products, suppliers, and inventory movements efficiently.

This project was built as a **professional backend portfolio project** to demonstrate modern API architecture using **Django and Django REST Framework**.

The system implements clean modular architecture, role-based access control, and analytical reporting endpoints commonly found in real-world inventory systems.

---

# Overview

SmartStock enables businesses to manage inventory operations through a structured backend service providing:

* Product catalog management
* Supplier relationships
* Inventory movement tracking
* Automated stock updates
* Inventory analytics
* Secure REST API for frontend integration

The backend follows **modular domain architecture**, separating product management, inventory logic, and service layers.

---

# Tech Stack

## Backend

* Python
* Django
* Django REST Framework
* django-filter
* drf-spectacular (OpenAPI documentation)
* SimpleJWT (authentication)

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

* Create, update and manage products
* SKU tracking
* Category assignment
* Supplier relationships
* Price and stock tracking

---

## Inventory Movements

* Register **IN** and **OUT** stock movements
* Automatic stock updates
* Movement history tracking
* User attribution for each movement

---

## Automated Stock Updates

Stock is automatically updated using **Django Signals** when inventory movements occur.

Example:

```
IN movement  → increases stock
OUT movement → decreases stock
```

---

# REST API

The backend exposes a fully documented REST API.

Example endpoints:

```
/api/products/
/api/movements/
/api/categories/
/api/suppliers/
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

# Security

The API implements modern security practices:

### JWT Authentication

Secure authentication using JSON Web Tokens.

```
POST /api/token/
```

### Role-Based Access Control

Three user roles are implemented using Django Groups:

* **Admin** – full system access
* **Staff** – inventory operations
* **Viewer** – read-only access

Permissions are enforced at the API layer using **custom DRF permission classes**.

---

# Inventory Analytics API

The system includes reporting endpoints for business insights.

```
/api/reports/inventory-value
/api/reports/low-stock
/api/reports/top-products
```

These endpoints perform database-level aggregations to provide analytics on stock levels and inventory value.

---

# API Documentation

Interactive documentation is generated automatically using **OpenAPI**.

Swagger UI:

```
/api/docs/
```

ReDoc:

```
/api/redoc/
```

These tools allow developers to explore and test API endpoints directly from the browser.

---

# Project Architecture

```
backend/
│
├── config/            # Django project configuration
│
├── products/          # Product domain logic
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│
├── inventory/         # Inventory management
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── views_reports.py
│   ├── permissions.py
│
├── services/          # Business logic layer
│
├── manage.py
└── db.sqlite3
```

---

# Installation

Clone repository:

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

Activate environment:

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

Run development server:

```
python manage.py runserver
```

---

# Future Improvements

* Advanced reporting and analytics
* Angular dashboard frontend
* Docker containerization
* PostgreSQL production database
* Background jobs for reporting
* Real-time stock updates using WebSockets

---

# Author

**Franco Rodrigo Miranda**

Software Development Student – Argentina

LinkedIn
https://www.linkedin.com/in/franco-rodrigo-miranda-993710248

GitHub
https://github.com/MirandaFrancoCBA
