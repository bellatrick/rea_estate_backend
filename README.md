# Estate Management Backend API

This project is a backend API for managing real estate properties, tenants, landlords, maintenance requests, and rental payments. It provides endpoints for landlords to manage their properties and tenants, as well as tenants to make rent payments, request maintenance, and receive notifications.

---

## API DOCS

The Swagger UI documentation can be found [here](https://rea-estate-backend.onrender.com/api-docs/)

## Features

### Tenant Features:
- **Rent Payment**: Allows tenants to make rental payments for a specific property.
- **Maintenance Requests**: Tenants can request maintenance on the properties they rent.
- **Notifications**: Tenants receive notifications from landlords.
- **Profile Management**: Tenants can view their rental history and associated landlords.

### Landlord Features:
- **Property Management**: Landlords can add, edit, view, or delete properties.
- **Tenant Management**: View tenants renting their properties and send notifications.
- **Maintenance Management**: View and update the status of maintenance requests made by tenants.
- **Financial Reports**: Generate reports for income from tenants, property occupancy, and total tenant count.
- **Notification System**: Send email notifications to tenants regarding updates, reminders, etc.


## Technologies

- **Node.js**: Backend framework for server-side operations.
- **Express**: Web framework for API routing and request handling.
- **MongoDB**: NoSQL database used for data storage.
- **Mongoose**: ODM library to interface MongoDB with models.
- **JWT**: For user authentication and authorization.
- **TypeScript**: Strongly typed language for the server-side code.
- **Swagger UI**: API documentation generation and visualization.
- **Jest & Supertest**: For unit and integration testing.

---

## Prerequisites

- Node.js: v14 or higher
- MongoDB: A MongoDB instance (local or cloud)
- Postman (optional): For testing API endpoints.

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/estate-management

# JWT Secret Key
ACTIVATION_SECRET=your_jwt_secret

# Server Port
PORT=3000
```

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bellatrick/rea_estate_backend.git
   cd estate-management-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run MongoDB**:
   If you're using a local MongoDB instance, ensure it's running:
   ```bash
   mongod
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Access the API**:
   The application will run at `http://localhost:3000`. You can access the API routes via Postman or any other API client.

---

## Running Tests

The project uses Jest and Supertest for writing unit and integration tests.

To run the test suite:

```bash
npm test
```

---

## Swagger Documentation

API documentation is provided via Swagger. To view the documentation:

1. Run the app.
2. Open a browser and navigate to `http://localhost:3000/api-docs`.

---

## Contribution Guidelines

1. Fork the repo.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes.
4. Commit your changes: `git commit -m "Add some feature"`.
5. Push to the branch: `git push origin feature-name`.
6. Submit a pull request.

---

## License

This project is licensed under the MIT License.

