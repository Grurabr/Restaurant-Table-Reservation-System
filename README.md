# **Restaurant Table Reservation System**

## **Project Overview**
This project is a restaurant table reservation system designed to provide an efficient and user-friendly booking experience for restaurants and their customers.

## **Project Structure**
The repository contains the following main components:

- **Backend** (Node.js)  
  - Manages the server-side logic and API endpoints.
  - Uses a MySQL database for storing reservation data.
  - Database credentials and encryption keys are stored in the `.env` file.

- **Frontend** (React)  
  - Provides an interactive user interface for customers and administrators.
  - Allows users to register, book tables, and manage reservations.
  - To set an admin role manually, execute the following SQL command:
    ```sql
    UPDATE users  
    SET role = 'admin'  
    WHERE id_user = 1;
    ```

- **Database** (MySQL)  
  - Firebase is used for authentication and account management.
  - The primary project database is hosted on Azure Database for MySQL Flexible Server.
  - Dump in the database folder. In the dump for the database, there is data for tables, 
    working hours, and additional services. All data about users and bookings has been deleted.

## **Installation & Setup**
### **Backend Setup**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure database credentials as follows:
   ```env
   DB_HOST=***
   DB_USER=***
   DB_PASS=***
   DB_NAME=***
   PORT=5002
   
   GMAIL_USER=***
   GMAIL_PASS=******
   
   ENCRYPTION_KEY=***
   ENCRYPTION_IV=***
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### **Frontend Setup**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and configure database credentials as follows:
   ```env
   REACT_APP_FIREBASE_API_KEY = ***
    REACT_APP_FIREBASE_AUTH_DOMAIN = ***
    REACT_APP_FIREBASE_PROJECT_ID = ***
    REACT_APP_FIREBASE_STORAGE_BUCKET = ***
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID = ***
    REACT_APP_FIREBASE_APP_ID = ***
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```

## **Technologies Used**
- **Backend**: Node.js, Express.js, MySQL, Firebase Authentication
- **Frontend**: React.js
- **Database**: MySQL (hosted on Azure)

