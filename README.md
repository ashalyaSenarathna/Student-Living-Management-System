# 🌟 Student Living Management System (SLMS)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express%205-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-47a248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Payment-Stripe-008cdd?logo=stripe&logoColor=white)](https://stripe.com/)

An **All-in-One Smart Campus Living & Well-being Ecosystem** designed to streamline student life. This unified portal bridges the gap between students, hostel owners, food providers, laundry services, and healthcare professionals, bringing ease and organization to campus living.

---

## 📖 Table of Contents
1. [🚀 Core Features & Modules](#-core-features--modules)
2. [👥 User Roles & Permissions (RBAC)](#-user-roles--permissions-rbac)
3. [🛠️ Tech Stack & Libraries](#️-tech-stack--libraries)
4. [📂 Directory Structure](#-directory-structure)
5. [⚙️ Installation & Configuration](#️-installation--configuration)
6. [🗄️ Database Seeding & Test Accounts](#️-database-seeding--test-accounts)
7. [💳 Stripe Integration & Uploads](#-stripe-integration--uploads)
8. [🎨 Design System & UI Styling](#-design-system--ui-styling)

---

## 🚀 Core Features & Modules

### 🏢 1. Hostel Management Module
Provides a comprehensive platform for finding and managing accommodation.
* **For Students:**
  * Browse available hostels with details like rent, location, and rating.
  * Filter and search options to match budget and location.
  * Book rooms and make online payments securely.
  * Track booking status and booking history.
* **For Hostel Owners:**
  * Dedicated **Owner Dashboard** to list and manage hostels.
  * Add hostel name, location, price, description, and upload multiple room images.
  * Monitor and update booking requests (Pending, Approved, Rejected).
* **For Admins:**
  * Monitor all listings and manage platform-wide operations.

### 🧺 2. Laundry Management Module
Takes the hassle out of student clothing care with structured laundry service packages.
* **For Students:**
  * Browse available local laundry providers and packages.
  * Make a booking (washing, ironing, dry cleaning) with customized specifications.
  * Track laundry status (e.g. Received, Processing, Completed, Delivered).
* **For Laundry Providers:**
  * List laundry service details and packages.
  * Manage active orders and update tracking status in real time.

### 🍔 3. Food & Meal Management Module
Keeps campus dining flexible, delicious, and customized.
* **For Students:**
  * Order individual dishes from the food menu.
  * Subscribe to custom weekly or monthly meal plans.
  * View active orders and trace current meal delivery status.
* **For Food Providers:**
  * Add new food items with name, price, category, and description.
  * Manage pending orders (Pending $\rightarrow$ Cooking $\rightarrow$ Ready $\rightarrow$ Completed).
  * Manage custom meal plans.

### 🩺 4. Health & Medical Center Module
An online clinic and pharmacy system catering to student well-being.
* **For Students:**
  * Access a dedicated **Medical Panel** dashboard.
  * Browse the pharmaceutical inventory and order OTC/prescribed medicines online.
  * View active appointments and historical diagnostic prescriptions.
  * Book digital or physical appointments with specialized doctors.
* **For Doctors:**
  * Access the **Doctor Portal** to view appointment slots.
  * Formulate and issue digital prescriptions to students.
  * Write diagnosis notes directly to the patient's record.
* **For Pharmacy Admins:**
  * Access **Pharmacy Admin panel** to manage medicine stocks (Inventory, Expiry, Manufacturer).
  * Monitor medicine purchases and order fulfillments.

---

## 👥 User Roles & Permissions (RBAC)

The application employs strict Role-Based Access Control (RBAC) enforced by backend auth middleware and frontend React Router guards.

| Role | Description | Core Clearances |
| :--- | :--- | :--- |
| **`USER`** | Students | Search & book hostels, buy food, order laundry, book medical appointments, view prescriptions. |
| **`HOSTEL_OWNER`** | Hostel Proprietors | Manage and list properties, approve/reject student hostel bookings. |
| **`PROVIDER`** | Laundry Operators | Register laundry services, add packages, process and update laundry orders. |
| **`FOOD_PROVIDER`** | Kitchen/Canteen Owners | Add food dishes, customize meal plans, manage meal preparation statuses. |
| **`DOCTOR`** | Medical Professionals | Manage appointments, issue digital diagnoses and prescriptions via the Doctor Portal. |
| **`ADMIN`** | System Administrators | Complete system control, user approvals, overall database modifications, pharmacy inventory. |

---

## 🛠️ Tech Stack & Libraries

### Frontend
* **Core:** React 19 (Functional components, hooks, context API)
* **Build Tool:** Vite (For lightning-fast development builds)
* **Styling:** Tailwind CSS v4 (Modern CSS utilities), dynamic light/dark style overrides (`light-mode.css`)
* **Animation:** Framer Motion (Smooth UI transition effects, slide-ins, and button micro-animations)
* **Icons:** Lucide React (Clean, modern icons)
* **Routing:** React Router DOM (Dynamic guards and parameter mapping)
* **HTTP Client:** Axios (For async API requests)

### Backend
* **Server Framework:** Express 5 (Node.js runtime environment)
* **Database Driver:** Mongoose (To interface with MongoDB Atlas cluster)
* **Security:** JWT (JSON Web Tokens) for session authorization, `bcryptjs` for secure password hashing
* **File Uploads:** Multer (To save uploaded hostel and laundry images in local `uploads/` folder)
* **Payment Processing:** Stripe Node SDK

---

## 📂 Directory Structure

```text
Student-Living-Management-System/
├── Backend/
│   ├── config/                 # Configurations (e.g. database setup)
│   ├── controllers/            # Request handlers (laundry, hostel, food, health)
│   ├── middleware/             # Auth checks, upload filters, CORS configs
│   ├── models/                 # Mongoose schemas (grouped by module)
│   │   ├── food/
│   │   ├── health/
│   │   ├── hostel/
│   │   └── laundry/
│   ├── routes/                 # Express API endpoints
│   │   ├── food/
│   │   ├── health/
│   │   ├── hostel/
│   │   └── laundry/
│   ├── uploads/                # Local storage for user images & uploads
│   ├── app.js                  # Main Express application entrypoint
│   ├── package.json            # Backend node scripts & dependencies
│   ├── seed.js                 # Admin user seed script
│   └── seedHealthManagement.js # Complete health database seeder
│
├── frontend/
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Images and styles
│   │   ├── components/         # Common UI components (Navbar, Loader, etc.)
│   │   ├── pages/              # Module-specific pages
│   │   │   ├── Admin/
│   │   │   ├── FoodManagement/
│   │   │   ├── HealthManagement/
│   │   │   ├── HostelManagement/
│   │   │   ├── LaundryManagement/
│   │   │   └── UserManagement/
│   │   ├── App.jsx             # Main routing hub with ProtectedRoutes
│   │   ├── index.css           # Global CSS variables & Tailwind v4 directive
│   │   ├── light-mode.css      # Theme overrides
│   │   └── main.jsx            # React root injection point
│   ├── package.json            # Frontend package details
│   └── vite.config.js          # Vite configurations
└── README.md                   # System documentation
```

---

## ⚙️ Installation & Configuration

### Prerequisites
* Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).
* A running [MongoDB](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB database).

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `Backend/` folder and insert your credentials:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
4. Run the seed scripts to populate database items (optional, but highly recommended):
   ```bash
   npm run seed
   node seedHealthManagement.js
   ```
5. Start the development server (uses nodemon for hot-reloads):
   ```bash
   npm run start
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `frontend/` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Run the React development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## 🗄️ Database Seeding & Test Accounts

To speed up verification, the project includes rich mockup datasets. After executing seed files (`npm run seed` and `node seedHealthManagement.js`), you can log in with these pre-configured user credentials:

### 🔑 Test User Credentials (Password: `password123`)

* **Students (`USER` role):**
  * Username: `john_doe` | Email: `john@studentliving.com`
  * Username: `jane_smith` | Email: `jane@studentliving.com`
* **Doctors (`DOCTOR` role):**
  * Username: `dr_smith` (General Practitioner) | Email: `dr.smith@hospital.com`
  * Username: `dr_johnson` (Pediatrics/Other) | Email: `dr.johnson@hospital.com`
* **Pharmacy Admins (`ADMIN` role):**
  * Username: `pharma_admin_1` | Email: `pharma.admin1@studentliving.com`

### 🔑 System Admin Credentials (Password: `admin`)
* Username: `admin` | Email: `admin@studentliving.com` | Role: `ADMIN`

---

## 💳 Stripe Integration & Uploads

1. **Stripe Checkout:** Payment checkout relies on Stripe sessions. The backend controller interacts with the Stripe API to generate session URLs, redirecting students to secure payment forms for hostel room bookings and laundry payments.
2. **Multer Media Uploads:** Images of hostels and dishes are uploaded as multipart-form data. The backend saves them in the local `uploads/` directory, exposing them statically via `express.static` at `/uploads/<filename>`.

---

## 🎨 Design System & UI Styling

The UI prioritizes a sleek, responsive design layout:
* **Tailwind v4 base:** Built-in modular utilities to allow responsive positioning and grid structures.
* **Modern Gradients & Icons:** Rich gradients and shadows for modern panels, complete with Lucide SVG indicators.
* **Animations:** Framer Motion hooks power loading wheels, interactive sidebar foldouts, card hover scales, and page entry transitions.
* **Responsive Layout:** Fits fluidly across mobile views, tablets, and full desktop interfaces.
