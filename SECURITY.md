# Security Policy 🔐

## 📌 Supported Versions

Only the latest version on the `main` branch is currently supported with security updates.

| Version        | Supported |
| -------------- | --------- |
| `main`         | ✅ Yes     |
| Older releases | ❌ No      |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, **please do NOT open a public GitHub issue**.

Instead, report it responsibly by following one of the methods below:

### 🔒 Preferred Method

* Open a **private GitHub Security Advisory**

  * Go to the repository
  * Click **Security → Advisories → New draft security advisory**

### 📧 Alternative

* Contact the repository maintainers directly (if provided in the repo or organization)

---

## 🧪 What to Include in Your Report

Please include as much information as possible:

* Description of the vulnerability
* Steps to reproduce
* Affected routes, files, or components
* Potential impact (data leak, privilege escalation, etc.)
* Suggested fix (if known)

---

## ⏱ Response Timeline

We aim to:

* Acknowledge reports within **48 hours**
* Assess and validate within **5 business days**
* Release a fix as soon as possible depending on severity

---

## 🔐 Security Best Practices Used in This Project

This project follows these security measures:

### Authentication & Authorization

* Password hashing (e.g., bcrypt)
* Role-based access control (Admin vs User)
* Protected admin-only routes
* No direct access to privileged actions

### Database Security

* Parameterized queries
* Foreign key constraints
* No credentials stored in source code
* `.env` files excluded from version control

### Application Security

* Server-side rendering (no sensitive logic on client)
* Input validation
* Session-based authentication
* No direct commits to `main` branch

---

## ❌ Out of Scope Vulnerabilities

The following are considered out of scope unless they result in real security risk:

* Missing HTTP security headers (unless exploitable)
* Brute force attacks without rate limiting proof
* Social engineering attacks
* Issues requiring physical access

---

## 🧠 Responsible Disclosure

We appreciate responsible disclosure and will **not take legal action** against researchers who:

* Act in good faith
* Avoid data destruction
* Do not exploit vulnerabilities beyond proof of concept

---

## 🏆 Credits

We thank all security researchers and contributors who help keep this project safe.

---

## 📄 License

This project is licensed under the MIT License. See details [LICENSE](https://github.com/DevSecOps-Project-2-0/secure-jokes-api-app?tab=MIT-1-ov-file)

