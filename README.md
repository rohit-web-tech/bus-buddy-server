# Bus Buddy - Bus Booking Web Application (Backend)

Bus Buddy is a backend service for a bus booking web application that allows users to search for bus routes, book tickets, and manage reservations.

## Features

- **User Authentication**: Secure user registration and authentication using JWT tokens.
- **Bus Routes Management**: CRUD operations for bus routes, including adding, updating, and deleting routes.
- **Ticket Booking**: Ability for users to search for buses by route, select seats, and book tickets.
- **Reservation Management**: View and manage booked tickets and reservations.
- **Admin Panel**: Separate endpoints and functionality for admin users to manage buses, routes, and user bookings.

## Technologies and services Used

- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (using Mongoose for ODM)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/)
- **Email Sending**: [MailTrap](https://mailtrap.io/)
- **Files Uploading**: [Cloudinary](https://cloudinary.com/)

## Installation

To run this project locally, follow these steps:

1. Clone the repository:
   
   ```bash
   git clone https://github.com/rohit-web-tech/bus-buddy-server.git
   cd bus-buddy-server

2. Install dependencies:
   
   ```bash
   npm install

3. Set up environment variables:
   
   Create a .env file in the src directory with the following:
   ```bash
   PORT = 3000
   DB_URI = YOUR_DB_URL
   ORIGIN = SET_YOUR_ORIGIN
   ACCESS_TOKEN_SECRET = YOUR_ACCESS_TOKEN_SECRET
   ACCESS_TOKEN_EXPIRY = YOUR_ACCESS_TOKEN_EXPIRY 
   REFRESH_TOKEN_SECRET = YOUR_REFRESH_TOKEN_SECRET
   REFRESH_TOKEN_EXPIRY = YOUR_REFRESH_TOKEN_EXPIRY 
   EMAIL_TRAP_ID = YOUR_EMAIL_TRAP_ID
   EMAIL_TRAP_PASSWORD = YOUR_EMAIL_TRAP_PASSWORD
   CLOUDINARY_API_SECRET = YOUR_CLOUDINARY_API_SECRET
   CLOUDINARY_API_KEY = YOUR_CLOUDINARY_API_KEY
   CLOUDINARY_CLOUD_NAME = YOUR_CLOUDINARY_CLOUD_NAME
   CLIENT_URL = YOUR_FRONTEND_URL
   MY_EMAIL = YOUR_EMAIL_ID

4. Run the server:
   
   ```bash
   npm run dev
