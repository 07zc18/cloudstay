# CloudStay — Hotel Booking System

CloudStay is a hotel room booking application, adapted from the original **CloudEats** food ordering system as part of the XDCS2054N Introduction to Cloud Computing domain migration assignment.

It keeps the original microservices architecture (User Service, Room Service, Booking Service), containerisation strategy, and supporting infrastructure (MySQL, MongoDB, Redis, Docker Compose), while replacing all food/menu-related business logic with hotel room and booking logic.

---

## 1. Prerequisites

Before starting, make sure the following are installed on your machine:

- [Docker](https://www.docker.com/) (version 20+)
- [Docker Compose](https://docs.docker.com/compose/) (v2, usually bundled with Docker Desktop)
- [Node.js](https://nodejs.org/) (version 18+) — only required if running a service outside Docker for development
- [Git](https://git-scm.com/)

---

## 2. Project Structure

```
cloudstay/
├── backend/
│   ├── api/
│   ├── auth.js
│   ├── controllers/
│   ├── db.js
│   ├── Dockerfile
│   ├── models/
│   ├── package.json
│   ├── public/
│   │   └── register.html
│   ├── server.js
│   └── server.js.monolith
│
├── db/
│   └── init.sql
│
├── frontend/
│   ├── css/
│   │   └── style1.css
│   ├── html/
│   │   └── index.html
│   ├── images/
│   ├── js/
│   └── Dockerfile
│
├── services/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │
│   ├── booking-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   └── src/
│   │
│   ├── room-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │
│   └── user-service/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 3. Clone the Repository

```bash
git clone https://github.com/07zc18/cloudstay.git
cd cloudstay
```

---

## 4. Environment Configuration

Copy the example environment file and fill in your own values. **Never commit your actual `.env` file** — only `.env.example` should be tracked in Git.

```bash
cp .env.example .env
```

`.env.example`:

```
MYSQL_ROOT_PASSWORD=change_this_root_password
MYSQL_USER=cloudstay_user
MYSQL_PASSWORD=change_this_password
JWT_SECRET=change_this_to_a_long_random_string
```

---

## 5. Installing Dependencies

No manual dependency installation is required when running CloudStay with Docker Compose. Each service installs its required Node.js dependencies during the Docker image build.

For local development outside Docker, dependencies can be installed using `npm install` inside the individual service directories under `services/`.

---

## 6. Running the System

Start all services, databases, and supporting infrastructure with a single command from the project root:

```bash
docker compose up
```

To run in the background:

```bash
docker compose up -d
```

To rebuild images after changing code:

```bash
docker compose up --build
```

To stop all services:

```bash
docker compose down
```

---

## 7. Verifying the System Is Running

Check that all containers are up:

```bash
docker ps
```

Check each service's health endpoint:

```bash
curl http://localhost:3101/health   # User Service
curl http://localhost:3102/health   # Room Service
curl http://localhost:3103/health   # Booking Service
```

Each should return a response indicating the service is running.

---

## 8. Database Setup / Verification

Connect to the MySQL container and confirm the schema was created correctly:

```bash
docker exec -it cloudstay-mysql mysql -u cloudstay_user -p cloudstay_db
```

Inside the MySQL prompt:

```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE rooms;
DESCRIBE bookings;
```

If sample data has not been loaded automatically, insert test data as needed (see the assignment report, Section 6.6, for sample room records).

---

## 9. Example API Requests

**Register a user**
```bash
curl -X POST http://localhost:3101/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User","phone":"0123456789"}'
```

**Get all rooms**
```bash
curl http://localhost:3102/api/rooms
```

**Create a booking**
```bash
curl -X POST http://localhost:3103/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"room_id":1,"check_in":"2026-08-15","check_out":"2026-08-18","total_amount":450.00,"special_request":"Late check-in"}'
```

**Get a user's bookings**
```bash
curl http://localhost:3103/api/bookings/user/1
```

---
## 10. Accessing the Frontend

The CloudStay frontend is located in the `frontend/html` directory.

Open the following file in a web browser:

frontend/html/index.html

---

## 11. Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `User not found` on booking creation | No user record exists yet | Register a user first via `/api/auth/register`, or insert test data directly into MySQL |
| A service container exits immediately | Missing or incorrect `.env` values | Check `docker compose logs <service-name>` and confirm `.env` is filled in |
| Port already in use | Another process is using the same port | Change the port mapping in `docker-compose.yml` or stop the conflicting process |
| `docker compose up` fails to build | Stale image cache | Run `docker compose build --no-cache` |

---

## 12. Project Background

CloudStay was adapted from **CloudEats**, a food ordering microservices application, as part of a domain migration assignment. The original User Service, Menu Service, and Order Service were adapted into the User Service, Room Service, and Booking Service respectively. See the accompanying assignment report for full details on the domain mapping, data model design, and testing evidence.

---

## 13. Domain Mapping

| Original CloudEats | CloudStay        |
| User Service       | User Service     |
| Menu Service       | Room Service     |
| Order Service      | Booking Service  |
| Menu Item          | Hotel Room       |
| Order              | Booking          |

---

## 14. Architecture

CloudStay uses a microservices architecture consisting of three main services:

- **User Service** — handles user registration, authentication and user information.
- **Room Service** — manages hotel room information and room availability.
- **Booking Service** — handles hotel room reservations and booking records.
 
The services are containerised using Docker Compose. MySQL is used for persistent relational data, while MongoDB and Redis are provisioned as supporting infrastructure.

---

## 15. Service Ports

| Service         | Local Host Port  | Container Port |
| User Service    |       3101       |      3001      |
| Room Service    |       3102       |      3002      |
| Booking Service |       3103       |      3003      |
| API Gateway     |       8000       |      8000      |
| MySQL           |       3316       |      3306      |
| MongoDB         |       27117      |      27017     |
| Redis           |       6389       |      6379      |

---

## 16. API Gateway

The API Gateway runs on port 8000 and provides a central routing point for the CloudStay microservices.

The gateway communicates with the services using their Docker service names and internal container ports:

- User Service: `user-service:3001`
- Room Service: `room-service:3002`
- Booking Service: `booking-service:3003`

From the local VM, the API Gateway is available at:

`http://localhost:8000`

---
