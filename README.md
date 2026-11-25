# Hostel Management System — Frontend

A full-stack Hostel Management System frontend built using **React, TypeScript, Redux Toolkit, and Tailwind CSS**.

The application provides an interface for managing hostel operations through role-based access for Admin, Staff, and Resident users.

## Live Application

[Hostel Management System](https://hostelmanagementsystemapp.netlify.app/login)

## GitHub Repository

[Frontend Repository](https://github.com/sudhayini/hostel-management-frontend)

## Technologies Used

- React
- TypeScript
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Vite

## Features

### Authentication and Authorization
- JWT-based authentication.
- Role-based access for Admin, Staff, and Resident users.
- Protected routes based on user roles.
- Secure login and authentication handling.

### Dashboard
- Dashboard with hostel management information.
- Overview of important hostel activities.

### Room Management
- View and manage hostel rooms.
- Room allocation and availability management.
- Room occupancy tracking.

### Resident Management
- Add, view, update, and manage resident details.
- Automatic resident login account creation.
- Resident profile management.
- Resident room allocation.
- Room history tracking.

### Maintenance Management
- Submit maintenance requests.
- View and manage maintenance requests.
- Track maintenance request status.

### Billing Management
- Create and manage resident bills.
- Room fees and utility charges.
- Additional charges and discounts.
- Automatic late fee calculation.
- Payment due date tracking.
- Outstanding balance management.

### Payment Management
- Record resident payments.
- View payment history.
- Track paid and pending amounts.
- Resident mock payment checkout.
- Two-installment payment plans.

### Notifications and Alerts

The application includes an in-app notification system to keep residents and staff informed.

- In-app notifications and messages.
- Overdue payment alerts.
- Upcoming payment due date reminders.
- Maintenance request notifications.
- General announcements.
- Notifications displayed through the application interface.

### Email Notifications

The backend email service supports email notifications for residents.

- Pending payment reminder emails.
- Payment confirmation emails after successful payment recording.

### Future Enhancement
- Twilio SMS notifications for payment reminders, overdue bills, maintenance updates, and important announcements.

### Staff Management
- Staff information management.
- Staff-related administrative operations.

### Reports and Expense Tracking
- Financial reports.
- Expense management.
- Hostel financial information and payment tracking.

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


## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sudhayini/hostel-management-frontend.git
```

### 2. Navigate to the Frontend Directory

```bash
cd hostel-management-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Backend API

The frontend communicates with the backend REST APIs.

**Production API:**

```text
https://hostelmanagementsystemapp.onrender.com/api
```

**Backend GitHub Repository:**

[Hostel Management System — Backend](https://github.com/sudhayini/hostel-management-backend)

## Payment Gateway

The resident payment checkout uses a simulated payment gateway for project demonstration.

**Note:** Real online payment processing has not yet been integrated. The mock checkout does not process real financial transactions.

## Notifications

In-app notifications are displayed within the application. Email notifications are handled by the backend using Nodemailer.

Twilio SMS notifications are planned as a future enhancement.

## Deployment

- **Frontend:** Netlify
- **Backend:** Render
- **Database:** MongoDB Atlas

## Related Repository

[Hostel Management System — Backend](https://github.com/sudhayini/hostel-management-backend)

## Author

**Salai Sudhayini**

Hostel Management System — Full Stack Project