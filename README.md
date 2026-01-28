## Tracking Performance

Tracking Performance is a web application for monitoring and analyzing business performance.  
It provides authentication, secure data handling, and interactive dashboards so users can log in, manage their company profile, and track key performance metrics through a modern UI.

---

### Features

- **User Authentication**
  - Email/password registration and login
  - JWT-based authentication
  - Support for Google login (OAuth)
  - Password reset and email verification flows

- **Performance Dashboards**
  - Multiple dashboard layouts (e.g. Sales, Telemarketing, Real Estate, Agency)
  - Data visualizations for tracking KPIs and results over time

- **Modern Landing Page**
  - Marketing landing page with sections like hero/banner, integrations, process, resources, etc.
  - Responsive design and branded components

- **Security & Reliability**
  - Protected API routes with auth middleware
  - Input validation and sanitization
  - Rate limiting and security headers (Helmet)
  - CORS configuration for safe frontend–backend communication

---

### Tech Stack

- **Frontend**
  - React (TypeScript)
  - Vite (build tool)
  - React Router
  - Custom CSS modules / styles
  - `@react-oauth/google` for Google authentication
  - `xlsx` for working with Excel data (import/export)

- **Backend**
  - Node.js + Express
  - MongoDB with Mongoose
  - JWT (`jsonwebtoken`)
  - `bcrypt` for password hashing
  - `express-validator` for request validation
  - `express-rate-limit` for rate limiting
  - `helmet`, `cors`, `cookie-parser`, `express-session`
  - `@sendgrid/mail` for transactional emails (password reset, verification)
  - `passport` + `passport-google-oauth20` for Google OAuth

---

### Project Structure

tracking-performance/
  Backend/           # Node.js / Express API
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
    package.json

  tracking-app/      # React + Vite frontend
    public/
    src/
      Components/
      context/
      services/
      Style/
      App.tsx
      main.tsx
    package.json---

### How the App Works

- **Authentication Flow**
  - Users can register and log in using email and password.
  - On successful login, the backend issues a JWT and returns it to the frontend.
  - Protected routes on the backend check the JWT and only allow authorized users.
  - Google login uses OAuth to authenticate via Google, then links or creates a user account in MongoDB.

- **Frontend–Backend Communication**
  - The React frontend sends HTTP requests (e.g. via fetch or an `api.ts` service) to the Express API.
  - CORS is configured on the backend to only allow requests from the configured `FRONTEND_URL`.
  - Auth tokens are sent with each protected request so the backend can verify the user.

- **Dashboards & Pages**
  - Different dashboard components (Sales, Telemarketing, Real Estate, Agency) display performance data.
  - The landing page is split into reusable sections like `Header`, `Banner`, `Integrations`, `OurProcess`, `Performance`, `Resources`, and `Footer`.
  - React Router is used to navigate between public pages (landing, login/register) and protected pages (dashboards).

---

### Available Scripts

#### Backend (`Backend/`)

- `npm start` – start Express server
- `npm run dev` – start server with nodemon (auto reload)

#### Frontend (`tracking-app/`)

- `npm run dev` – run Vite dev server
- `npm run build` – build production bundle
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint

---

### Security Notes

- In production, the backend should run behind **HTTPS** (via a reverse proxy like Nginx/Apache or Node HTTPS).
- Environment variables should **never** be committed to Git.
- Rate limiting and Helmet are enabled to help protect against common attacks.
- CORS is locked down to allowed frontend origins using `FRONTEND_URL`.

---

### License

This project is for educational and personal use.  
