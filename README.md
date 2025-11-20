# URL Shortener

A simple URL shortener built using Node.js, Express, and SQLite.

---

## 🚀 Setup

### 1. Install dependencies
```sh
npm install
```

### 2. Start the server

```sh
npm start
```

### 3. Open in browser

```sh
http://localhost:3000
```

## 📄 Pages

### Dashboard
```
GET /
```

Create short URLs and view all existing URLs.

---

### Stats Page

```
GET /code/:slug
```

Shows analytics for a single short URL.

---

### Redirect Page
```
GET /:slug
```

Redirects to the original URL.

----
### Health Check

```
GET /healthz
```

Returns service status.










