# 🐦 Web Game Flappy Bird

A web-based **Flappy Bird** game integrated with a **leaderboard system** and **user authentication** — developed as a university project.

---

## 📖 About The Project

**Web Game Flappy Bird** is a modern, browser-based recreation of the classic Flappy Bird game. Players control a bird, tap or press a key to flap through pipes, and try to achieve the highest possible score.

The project combines an engaging front-end game with a fully functional back-end:

- 🎮 **Frontend** — the playable game built with React and Canvas, featuring a coin economy, a bird-skin shop, and a leaderboard.
- 🔐 **Backend** — a REST API that handles user authentication (register, login, logout, get user info) using JWT and bcrypt password hashing.
- 🗄️ **Database** — a MySQL database that stores user accounts, owned skins, and game results.

The primary goal is to practice and demonstrate full-stack development skills: designing a database schema, building a secure authentication API, and connecting it to a polished front-end.

---

## 👥 Contributors

| Name | Student ID |
|------|------------|
| [Nguyen Van A] | [123456] |
| [Tran Thi B] | [654321] |
| [Le Van C] | [789012] |

> ✏️ Replace the placeholders above with the real names and student IDs of your team members.

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **ReactJS** — UI framework
- ⚡ **Vite** — build tool & dev server
- 🎨 **Tailwind CSS** — styling

### Backend
- 🟢 **Node.js** — JavaScript runtime
- 🚂 **Express** — web framework (CommonJS)
- 🔑 **JSON Web Token (JWT)** — authentication
- 🔒 **bcryptjs** — password hashing
- 📚 **Swagger UI** — API documentation & testing

### Database
- 🐬 **MySQL** — relational database (using a connection pool via `mysql2`)

---

## ✨ Key Features

- ✅ **Register** — create a new account (password is hashed with bcryptjs).
- ✅ **Login** — authenticate with username/password and receive a JWT.
- ✅ **Logout** — sign out of the current session.
- ✅ **Get User Info** — retrieve the current user's profile (protected by JWT).
- ✅ **Swagger UI** — interactive API documentation for testing the Auth endpoints.

---

## 📁 Project Structure

```
TTTN_FlappyBird/
├── src/                        # Frontend (React + Vite)
│   ├── components/             # Header, HUD, modals (Auth, Leaderboard, Shop)
│   ├── context/                # AuthContext (authentication state)
│   ├── game/                   # Game engine, drawing, game loop hook
│   └── services/               # API service layer
├── public/                     # Static assets (favicon, icons)
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── package.json                # Frontend dependencies & scripts
└── backend/                    # Backend (Express + MySQL)
    ├── index.js                # Entry point (routes, Swagger, error handling)
    ├── swagger.js              # OpenAPI (Swagger) specification
    ├── .env.example            # Environment configuration template
    ├── config/db.js            # MySQL connection pool
    ├── sql/schema.sql          # Database schema (tables & seed data)
    ├── models/                 # User & Skin data access layer
    ├── controllers/            # Business logic (auth)
    ├── middleware/             # JWT authentication middleware
    └── routes/                 # Route definitions
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or later) — [nodejs.org](https://nodejs.org)
- **XAMPP** (or any MySQL server) — [apachefriends.org](https://www.apachefriends.org)

### 1. Clone the repository

```bash
git clone https://github.com/qnam2309-debug/TTTN_FlappyBird.git
cd TTTN_FlappyBird
```

### 2. Backend setup

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create the .env file from the template
# (Windows PowerShell)
Copy-Item .env.example .env
# (Linux / macOS)
cp .env.example .env
```

Edit the `.env` file and fill in your database credentials:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=TTTN_FlappyBird

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

> ⚠️ **Important:** Never commit the real `.env` file to Git. Only `.env.example` should be tracked.

Import the database schema (`backend/sql/schema.sql`):

- **Option A — phpMyAdmin:** open `http://localhost/phpmyadmin`, then **Import** the `sql/schema.sql` file.
- **Option B — Command line:**
  ```bash
  "C:\xampp\mysql\bin\mysql.exe" -u root < sql/schema.sql
  ```

### 3. Frontend setup

Open a new terminal **in the project root** and run:

```bash
npm install
```

---

## 💻 Usage

Run the **backend** server (from the `backend` folder):

```bash
cd backend
npm run dev
# or: npm start
```

Run the **frontend** dev server (from the project root):

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5000 |
| Swagger UI | http://localhost:5000/api-docs |

> 💡 Vite prints the exact frontend URL in the terminal when it starts (the default is `http://localhost:5173`).

---

## 📚 API Documentation

The backend exposes interactive API documentation via **Swagger UI**.

1. Start the backend server.
2. Open your browser and go to: **http://localhost:5000/api-docs**
3. Test the Auth APIs directly from the interface.

### Available Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new account | ❌ |
| `POST` | `/api/auth/login` | Log in and receive a JWT | ❌ |
| `GET` | `/api/auth/me` | Get the current user's info | ✅ Bearer token |
| `POST` | `/api/auth/logout` | Log out | ❌ |

### Testing with Swagger

1. Call **`POST /api/auth/register`** → click **Try it out** → enter a `username` and `password` → **Execute** → copy the returned `token`.
2. Click the **🔒 Authorize** button (top-right) → paste the `token` → **Authorize**.
3. Call **`GET /api/auth/me`** to retrieve the current user's information.
4. Test error cases as well: duplicate username (`409`), wrong password (`401`), missing token (`401`).

> 📄 A raw OpenAPI JSON specification is also available at: **http://localhost:5000/api-docs.json**

---

## 🗄️ Database Schema

Database name: **`TTTN_FlappyBird`**

| Table | Primary Key | Foreign Key | Description |
|-------|-------------|-------------|-------------|
| `SKINS` | `SkinID` | — | Bird skin catalog |
| `USERS` | `UserID` | `CurrentSkinID` → `SKINS.SkinID` | Player accounts |
| `USER_SKINS` | (`UserID`, `SkinID`) | → `USERS`, → `SKINS` | Owned skins (many-to-many) |
| `GAME_RESULTS` | `ResultID` | `UserID` → `USERS.UserID` | Individual game results |

The full schema (columns, constraints, and indexes) is available in [`backend/sql/schema.sql`](backend/sql/schema.sql).

---

## 📄 License

This project is developed for educational purposes as part of a university course.
