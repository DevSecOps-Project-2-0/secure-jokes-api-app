# 🤝Contributing to Secure Jokes API App 

Thank you for your interest in contributing!
This document explains how to contribute to the project in a clean, consistent, and collaborative way.

---

## 📌 Code of Conduct

By participating in this project, you agree to:

* Be respectful and professional
* Provide constructive feedback
* Follow project guidelines and best practices

Harassment, abuse, or inappropriate behavior will not be tolerated.

---

## 🏗 Project Overview

**Tech stack:**

* Node.js (Express)
* PostgreSQL
* EJS (Server-side rendering)
* Jest / Supertest (testing)

**Key concepts:**

* Role-based access control (Admin vs User)
* Server-side rendering
* REST-style routes
* Secure authentication

---

## 🔀 Branching Strategy (Required)

⚠️ **Direct commits to `main` are not allowed**

### Branch naming conventions

| Type     | Branch name example       |
| -------- | ------------------------- |
| Feature  | `feature/add-joke-voting` |
| Bug fix  | `fix/login-validation`    |
| Refactor | `refactor/db-queries`     |
| Docs     | `docs/update-readme`      |

Create a branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

---

## 🔄 Workflow

1. Create a new branch (see naming rules above)
2. Make your changes
3. Commit using clear commit messages
4. Push the branch to GitHub
5. Open a Pull Request (PR) to `main`
6. Request review from your teammate
7. Merge **only after approval**

---

## 📝 Commit Message Guidelines

Use **imperative, short, meaningful messages**:

✅ Good examples:

```
feat: add like/dislike functionality
fix: prevent duplicate joke votes
docs: update setup instructions
refactor: simplify auth middleware
```

❌ Bad examples:

```
updated stuff
fix
changes
```

---

## 🧪 Testing Requirements

Before opening a PR:

* Run tests locally:

```bash
npm test
```

* Ensure:

  * Existing tests pass
  * New features include tests where applicable
  * No test files are committed with `.only`

---

## 🔐 Security Guidelines

* ❌ Never commit:

  * Database passwords
  * Session keys
  * `.env` files
* Use `.env.example` for reference
* Validate user input
* Enforce role checks for admin routes

---

## 🗄 Database Changes

If your change affects the database:

* Update SQL scripts in `/schema`
* Use `CREATE TABLE IF NOT EXISTS`
* Avoid destructive migrations unless discussed
* Document changes in the PR description

---

## 📦 Dependencies

* Avoid adding unnecessary dependencies
* Explain *why* a new dependency is required in the PR
* Keep dependencies updated and secure

---

## 📸 UI / EJS Changes

For frontend (EJS/CSS/JS) changes:

* Include screenshots in the PR
* Ensure pages render correctly
* Keep logic out of templates when possible

---

## 👀 Code Review Rules

* At least **1 approval required**
* Address all review comments
* Do not merge your own PR without review
* Resolve all conversations before merging

---

## 🚀 Release & Deployment

* `main` must always be stable
* No broken builds or failing tests
* Hotfixes still require PRs

---

## ❓ Need Help?

If you’re unsure about:

* Architecture decisions
* Database design
* Security concerns

Open an **Issue** or ask in the PR discussion.

---

## 🙌 Thank You

Your contributions help make this project better, more secure, and more maintainable.
Happy coding! 🚀


