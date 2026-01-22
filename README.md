# Secure Jokes API App 😂🔐

A secure jokes application built with **Node.js**, **Express**, **PostgreSQL**, and **EJS**.
Supports **user authentication**, **role-based access control**, and **server-side rendering**.

---

## 📌 What Is an API?

An **API (Application Programming Interface)** allows different software components to communicate.

In this project:

* The API handles routes for **user registration/login**, **joke operations**, and **admin actions**.
* Communicates with a **PostgreSQL database** storing users, jokes, and reactions.

---

## 📌 What Is Server-Side Rendering (SSR)?

**Server-side rendering** means HTML pages are generated on the server and sent to the client browser.

This project uses:

* **EJS templates** (`.ejs` files in `/views`) to render pages like `login`, `index`, `admin`.
* Server-side logic handles authentication, authorization, and database queries.

**Benefits of SSR**:

* Hidden business logic
* SEO-friendly
* Faster initial page load

---

## 🔐 User Roles

### 👤 Regular User

* Register & login
* Add jokes
* Like or dislike jokes

### 👑 Admin

* Pre-created automatically:

  ```
  Username: admin
  Password: Admin@123
  ```
* Delete jokes
* View registered users and reactions
* Cannot add or like jokes

---

## 🗂 Project Structure


```
secure-jokes-api-app
├─ .dockerignore
├─ LICENSE
├─ package-lock.json
├─ package.json
├─ public                     # Static files (CSS & JS)
│  ├─ random.js
│  └─ style.css
├─ README.md
├─ schemas                    # Database setup
│  └─ init.sql
├─ screenshots
│  ├─ admin-dash.png
│  ├─ admin-page.png
│  ├─ image1.png
│  ├─ login.png
│  └─ register-page.png
├─ src
│  └─ index.js                 # Main server file
├─ tests                       # Tests
│  └─ app.test.js
└─ views                       # EJS Templates
   ├─ add.ejs
   ├─ admin.ejs
   ├─ index.ejs
   ├─ login.ejs
   ├─ random.ejs
   └─ register.ejs

```

---

## ⚙️ Prerequisites

* **Node.js** (v22+)
* **npm**
* **PostgreSQL**

Check versions:

```bash
node -v
npm -v
psql --version
```

---

## 🛠 Environment Setup

Create a `.env` file in the root:

```env
POSTGRES_PASSWORD=db_password
POSTGRES_USER=your_db_user
POSTGRES_DB=jokesdb

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=db_password
DB_NAME=jokesdb
SESSION_SECRET=your_session_secret
PORT=5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123
```

---

## 🛠 Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE jokesdb;
```

2. Run the SQL initialization script:
3. 📌 Make changes to your db_username and db_password in schemas/init.sql file

```bash
psql -U your_username -d jokes_db -f schemas/init.sql
```

---

## 📦 Install Dependencies

```bash
npm install
```

---

## ▶️ Running the Application Locally

Start the server:

```bash
node src/index.js
```

using nodemon:

```bash
npm run dev
```

Open browser:

```
http://localhost:5000
```

---

## 🌐 API Endpoints

### Authentication

| Method | Route     | Description         | Body (JSON)                                    |
| ------ | --------- | ------------------- | ---------------------------------------------- |
| POST   | /register | Register a new user | { "username": "user1", "password": "pass123" } |
| POST   | /login    | Login a user        | { "username": "user1", "password": "pass123" } |
| GET    | /logout   | Logout current user | -                                              |

### Jokes (User)

| Method | Route        | Description    | Body / Params           |
| ------ | ------------ | -------------- | ----------------------- |
| GET    | /            | View all jokes | -                       |
| POST   | /add         | Add a new joke | { "joke": "Joke text" } |
| POST   | /like/:id    | Like a joke    | Joke ID in URL          |
| POST   | /dislike/:id | Dislike a joke | Joke ID in URL          |

### Admin

| Method | Route             | Description                  |
| ------ | ----------------- | ---------------------------- |
| GET    | /admin            | Admin dashboard              |
| DELETE | /admin/delete/:id | Delete a joke                |
| GET    | /admin/users      | View all users and reactions |

---

## 🧪 Running Tests

```bash
npm test
```

Tests are located in `tests/app.test.js`.

---

## 🔒 Security Features

* Password hashing (bcrypt)
* Role-based authorization
* Admin-only protected routes
* Server-side session handling

---

## ✅ Getting Started (Step-by-Step)

1. Clone the repo:

```bash
git clone https://github.com/DevSecOps-Project-2-0/secure-jokes-api-app.git
cd secure-jokes-api-app
```

2. Install dependencies:

```bash
npm install
```

3. Setup PostgreSQL and run `init.sql`.

4. Configure `.env` file with DB credentials and session secret.

5. Start the server:

```bash
node src/index.js
```

6. Open browser: [http://localhost:3000](http://localhost:3000)

7. Login as **admin** to manage jokes or register as a regular user.

---

## 🖼 Screenshots & Demo

### Login Page

![Login Page](/screenshots/login.png)
*Enter username & password to access your account.*

### Registration Page

![Register Page](/screenshots/register-page.png)
*New users can register here.*

### User Dashboard / Add Joke

![Add Joke Page](/screenshots/image1.png)
*Regular users can add jokes, like or dislike existing jokes.*

### Admin Dashboard

![Admin Page](/screenshots/admin-dash.png)
*Admin can view users, likes/dislikes, and delete jokes.*


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/DevSecOps-Project-2-0/secure-jokes-api-app?tab=MIT-1-ov-file) file for every details.


Author: [Emma](https://github.com/emaowusu)
