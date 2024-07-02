# Bus Buddy - Bus Booking Web Application (Backend)

Bus Buddy is a backend service for a bus booking web application that allows users to search for bus routes, book tickets, and manage reservations.

## Features

- **User Authentication**: Secure user registration and authentication using JWT tokens.
- **Bus Routes Management**: CRUD operations for bus routes, including adding, updating, and deleting routes.
- **Ticket Booking**: Ability for users to search for buses by route, select seats, and book tickets.
- **Reservation Management**: View and manage booked tickets and reservations.
- **Admin Panel**: Separate endpoints and functionality for admin users to manage buses, routes, and user bookings.

## Technologies Used

- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (using Mongoose for ODM)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/)
- **Testing**: [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/)
- **Deployment**: [Heroku](https://www.heroku.com/) (example, replace with your deployment platform)

## Installation

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bus-buddy-backend.git
   cd bus-buddy-backend
