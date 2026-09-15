# SmartStock – Inventory Management System

SmartStock is a full-stack inventory management project built to model real business workflows around products, suppliers, stock movements, access control and inventory analytics.

The backend uses **Django + Django REST Framework**, runs on **PostgreSQL 16**, and is containerized with **Docker / Docker Compose**. The repository also includes an **Angular** frontend that consumes the REST API.

## Current status

SmartStock is approaching its first portfolio-ready release (`v1.0`). Core backend and frontend flows, JWT authentication, RBAC, inventory operations, analytics, OpenAPI documentation, automated tests and CI are implemented. Production runtime configuration is prepared; public provider URLs and the final public smoke test remain pending.

## Tech stack

### Backend
- Python
- Django 6
- Django REST Framework
- django-filter
- SimpleJWT
- drf-spectacular / OpenAPI
- pytest / pytest-django / pytest-cov

### Database
- PostgreSQL 16

### Frontend
- Angular
- TypeScript
- Angular Material

### DevOps
- Docker
- Docker Compose
- Gunicorn
- WhiteNoise
- GitHub Actions
- Environment-based configuration

## Core features

### Product management
- Product CRUD
- SKU tracking
- Categories and suppliers
- Price and stock management
- Filtering, searching, ordering and pagination

### Inventory management
- IN / OUT stock movements
- Movement history with deterministic pagination
- User attribution
- Automatic stock updates
- Validation for non-positive quantities and insufficient stock

### Authentication and authorization
- JWT authentication
- Protected API endpoints
- Role-based access control using Django Groups
- Custom DRF permissions

Current roles:
- **Admin** – full system access
- **Staff** – inventory operations
- **Viewer** – read-only access

### Analytics

```text
/api/reports/inventory-value/
/api/reports/low-stock/
/api/reports/top-products/
```

### Product API capabilities

```text
/api/products/?category=1
/api/products/?search=maceta
/api/products/?ordering=price
/api/products/?ordering=-price
/api/products/?page=2
```

### Operations and API documentation

```text
/api/health/
/api/docs/
/api/redoc/
```

`GET /api/health/` is public and intentionally lightweight so a hosting provider can verify that the Django process is alive without accessing business data.

## Architecture

```text
SmartStock/
├── backend/
│   ├── config/              # Django project configuration
│   ├── products/            # Product, category and supplier domain
│   ├── inventory/           # Movements, permissions and reports
│   ├── services/            # Business/service layer
│   ├── conftest.py          # Shared pytest fixtures
│   └── manage.py
├── smartstock-frontend/     # Angular frontend
├── .github/workflows/       # CI
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Run locally with Docker

### 1. Clone the repository

```bash
git clone https://github.com/MirandaFrancoCBA/SmartStock.git
cd SmartStock
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and replace development placeholders as needed.

```text
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,backend
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
DJANGO_CSRF_TRUSTED_ORIGINS=
DJANGO_CORS_ALLOW_CREDENTIALS=True

POSTGRES_DB=smartstock
POSTGRES_USER=smartstock_user
POSTGRES_PASSWORD=change-me
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

Do not commit the real `.env` file or production secrets. When `DJANGO_DEBUG=True`, SmartStock also accepts browser origins on dynamic `localhost` and `127.0.0.1` development ports.

### 3. Start the stack

```bash
docker compose up -d --build
```

The backend is exposed on port `8000` by the current Docker Compose configuration.

### 4. Apply migrations

```bash
docker compose exec backend python manage.py migrate
```

### 5. Bootstrap RBAC roles

Create the SmartStock groups (`Admin`, `Staff`, `Viewer`) idempotently:

```bash
docker compose exec backend python manage.py seed_roles
```

### 6. Create an admin user and assign the SmartStock role

```bash
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py seed_roles --username admin --role Admin
```

Replace `admin` with the username you created. Django's `is_superuser` flag and SmartStock's application role are deliberately separate: SmartStock API/UI authorization uses the `Admin`, `Staff` and `Viewer` groups.

To assign an existing user to another SmartStock role:

```bash
docker compose exec backend python manage.py seed_roles --username staff --role Staff
docker compose exec backend python manage.py seed_roles --username viewer --role Viewer
```

The command replaces only the user's SmartStock role and leaves unrelated Django groups intact.

## Production deployment checklist

The repository is provider-agnostic. The same application image can be connected to a managed PostgreSQL service and an HTTPS frontend without committing provider secrets.

### Backend environment

Set production values in the hosting provider, not in the repository:

```text
DJANGO_SECRET_KEY=<strong-random-secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<backend-public-hostname>
DJANGO_CORS_ALLOWED_ORIGINS=https://<frontend-public-hostname>
DJANGO_CSRF_TRUSTED_ORIGINS=https://<frontend-public-hostname>
DJANGO_CORS_ALLOW_CREDENTIALS=True

POSTGRES_DB=<provider-database>
POSTGRES_USER=<provider-user>
POSTGRES_PASSWORD=<provider-password>
POSTGRES_HOST=<provider-host>
POSTGRES_PORT=<provider-port>
```

The production container starts Django with Gunicorn and respects the provider's `PORT` variable. WhiteNoise serves Django static assets. `DEBUG` defaults to false when omitted.

### Database initialization

After connecting the managed PostgreSQL database, run:

```bash
python manage.py migrate
python manage.py seed_roles
```

Create a portfolio/demo administrator through the provider shell or another secure administrative channel, then assign its application role:

```bash
python manage.py createsuperuser
python manage.py seed_roles --username <username> --role Admin
```

Do not place demo passwords, database credentials or Django secrets in Git, build logs or this README.

### Frontend production endpoint

Angular development uses the local API. Production builds replace that environment with `src/environments/environment.production.ts`.

Before the final frontend deploy, replace the placeholder API origin there with the real HTTPS backend URL, keeping the `/api` suffix, then build the production application:

```bash
npm ci
npm run build
```

The public frontend origin must match the backend `DJANGO_CORS_ALLOWED_ORIGINS` and `DJANGO_CSRF_TRUSTED_ORIGINS` values.

### Public verification

Once provider URLs exist, verify all of the following before declaring `v1.0` deployed:

- `GET https://<backend>/api/health/` returns HTTP 200
- `https://<backend>/api/docs/` loads the OpenAPI UI over HTTPS
- Angular loads from its public HTTPS URL without mixed-content or CORS errors
- Admin can authenticate, manage catalog data and perform IN/OUT movements
- Staff can create/edit and perform movements but cannot delete protected resources
- Viewer remains read-only
- logout clears the session and a refresh token can no longer silently restore it
- data remains available after an application restart/redeploy

The actual public frontend/backend URLs are intentionally not documented until those services exist and have passed this smoke test.

## Tests and CI

Run the backend suite inside the container:

```bash
docker compose exec backend pytest
```

CI executes pytest against **PostgreSQL 16** on relevant pull requests and pushes to `main`. Critical flows covered include authentication, product protection, inventory IN/OUT, stock validation, RBAC, role bootstrap, health checks and analytics reports.

## v1.0 roadmap

The release is intentionally scoped to finishing and hardening the existing product rather than adding unrelated features.

1. Stabilize configuration, repository hygiene and documentation
2. Complete the essential Angular flows
3. Consolidate backend tests and CI
4. Prepare production configuration and deployment
5. Publish the final demo and portfolio documentation

Features such as WebSockets, background jobs or additional infrastructure are considered post-`v1.0` unless they become necessary for a core workflow.

## Author

**Franco Rodrigo Miranda**  
Software Development Student / Backend Developer – Argentina

- LinkedIn: https://www.linkedin.com/in/franco-rodrigo-miranda-993710248
- GitHub: https://github.com/MirandaFrancoCBA
