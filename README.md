# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
```
#  Hostel Management System — Frontend

A modern Hostel Management System frontend built using React, TypeScript, Redux Toolkit, React Router, Axios, and Tailwind CSS.

The application provides role-based access for Admin, Staff, and Resident users.

##  Live Application

https://hostelmanagementsystemapp.netlify.app/login

##  Technologies Used

* React
* TypeScript
* Redux Toolkit
* React Redux
* React Router
* Axios
* Tailwind CSS
* Vite

##  Features

###  Authentication

* User login
* JWT authentication
* Protected routes
* Role-based access control
* Automatic authorization for API requests

###  Dashboard

* Hostel overview
* Room information
* Resident information
* Maintenance information
* Billing information
* Notifications

###  Resident Management

* Add residents
* View residents
* Edit resident details
* Check-out residents
* Delete residents — Admin only
* Emergency contact information
* Resident login account

###  Room Management

* View rooms
* Add rooms
* Edit rooms
* Delete rooms
* Room allocation
* Occupancy tracking
* Room availability

###  Maintenance Management

* Create maintenance requests
* Set priority
* Track request status
* Assign requests to staff
* Maintenance notifications

###  Billing Management

* Create bills
* View bills
* Track pending payments
* Track overdue payments
* Due date management
* Billing notifications

### Payment Management

* Record payments
* Cash
* UPI
* Card
* Bank Transfer
* Transaction ID
* Payment history

###  Notifications

* View notifications
* Maintenance assignment notifications
* Pending payment notifications
* Overdue notifications
* Read/unread notifications

###  Staff Management

* Add staff
* View staff
* Edit staff
* Delete staff
* Admin-only staff management

###  Reports

* Resident information
* Room information
* Maintenance information
* Billing information
* Hostel reports

##  User Roles

| Feature            | Admin | Staff | Resident |
| ------------------ | ----- | ----- | -------- |
| Dashboard          | yes   | yes   | yes      |
| View Residents     | yes   | yes   | no       |
| Add Resident       | yes   | yes   | no       |
| Edit Resident      | yes   | yes   | no       |
| Check Out Resident | yes   | yes   | no       |
| Delete Resident    | yes   | no    | no       |
| Manage Rooms       | yes   | no    | no       |
| Maintenance        | yes   | yes   | yes      |
| Billing            | yes   | yes   | no       |
| Payments           | yes   | yes   | no       |
| Staff Management   | yes   | no    | no       |
| Reports            | yes   | no    | no       |

##  Project Structure

```text
frontend/
└── src/
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Sidebar.tsx
    │   ├── ProtecteRoute.tsx
    │   └── RoleRute.tsx
    │
    ├── features/
    │   ├── billing/
    │   ├── maintenance/
    │   ├── residents/
    │   ├── rooms/
    │   ├── notifications/
    │   └── payments/
    │
    ├── layouts/
    │   └── Layout.tsx
    │
    ├── pages/
    │   ├── Billing.tsx
    │   ├── Dashboard.tsx
    │   ├── Login.tsx
    │   ├── Maintenance.tsx
    │   ├── Reports.tsx
    │   ├── Residents.tsx
    │   ├── Rooms.tsx
    │   └── Staff.tsx
    │
    ├── services/
    │   └── api.ts
    │
    ├── store/
    │   └── store.ts
    │
    ├── App.tsx
    ├── main.tsx
    └── index.css
```

##  Installation

Clone the frontend repository:

```bash
git clone https://github.com/sudhayini/hostel-management-frontend.git
```

Enter the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

##  Run Locally

Start the development server:

```bash
npm run dev
```

The application normally runs at:

```text
http://localhost:5173
```

##  Backend API

The frontend communicates with the deployed backend:

```text
https://hostelmanagementsystemapp.onrender.com/
```

##  Authentication

The application uses JWT authentication.

After login, the frontend stores the authentication information in browser local storage and sends the JWT token with protected API requests.

##  Responsive Design

The interface is built using Tailwind CSS and is designed to work across different screen sizes.

##  Deployment

* **Frontend:** Netlify
* **Backend:** Render
* **Database:** MongoDB Atlas

##  Demo Login Credentials

The following accounts can be used to test the deployed application.

| Role        | Email                | Password       |
| ----------- | -------------------- | -------------- |
|  Admin      | `admin@gmail.com`    | `admin123`     |
|  Staff      | `staff@gmail.com`    | `satffname123` |
|  Resident   | `resident@gmail.com` | `Resident@123` |

### Resident Login

All resident accounts created through the system use the default password:(all residents same password)

```text
Resident@123
```

  **Note:** These credentials are provided for project demonstration/testing purposes only. Do not use these default passwords for a production application.


## Author

**Sudhayini**

Hostel Management System — Full Stack Project
```