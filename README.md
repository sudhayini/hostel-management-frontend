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

### Resident Profile Page

* View detailed resident information
* View contact details and emergency contact information
* View current room allocation
* View check-in and expected check-out dates
* View room allocation history
* Retrieve individual resident information from the backend

###  Room Management

* View rooms retrieved from the backend
* Add, edit, and delete rooms
* Manage room allocation
* Track room occupancy
* View room availability

###  Maintenance Management

* Create maintenance requests
* Set priority
* Track request status
* View and manage maintenance requests according to user permissions
* Maintenance notifications

###  Billing Management

* Create bills
* View bills
* Track pending payments
* Track overdue payments
* Due date management
* Billing notifications

### Payment Management

* Record payment information
* Support recording payment methods such as cash, UPI, card, and bank transfer, where configured
* Store transaction IDs and payment history where implemented
* Track payment status
Note: Online payment gateway integration is not yet implemented.

###  Notifications

* View notifications
* Maintenance assignment notifications
* Pending payment notifications
* Overdue notifications
* Read & unread notifications

###  Staff Management

* Add staff & View staff
* Edit staff information
* Delete staff
* Admin-only staff management

###  Reports

* View resident information
* View room information
* View maintenance information
* View billing information
* Generate or view hostel reports, according to implemented functionality

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

## Database Backup

A manual MongoDB database backup was created using MongoDB Database Tools. This backup procedure is performed separately from the frontend application and is not an automatic backup feature.

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

## Author

**Sudhayini**

Hostel Management System — Full Stack Project
```