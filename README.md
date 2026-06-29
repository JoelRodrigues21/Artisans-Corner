# Artisan's Corner - Multi Vendor Marketplace

## Project Overview

Artisan's Corner is a full-stack multi-vendor e-commerce marketplace that allows artisans to sell handmade products online. Buyers can browse products, add them to cart, place orders, and submit reviews. Vendors can manage products through a dashboard.

---

## Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Logout

### Product Management

* Create Product
* View Products
* Update Product
* Delete Product
* Search Products

### Shopping Features

* Product Details
* Add to Cart
* Remove from Cart
* Place Orders

### Reviews

* Submit Reviews
* View Reviews

### Vendor Dashboard

* Total Products
* Total Orders
* Total Revenue
* Product Management

---

## Tech Stack

### Frontend

* React.js
* Vite
* Axios
* React Router DOM

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT (jsonwebtoken)
* bcryptjs

---

## Project Structure

Artisans-Corner/

├── backend/

│   ├── config/

│   ├── controllers/

│   ├── middleware/

│   ├── models/

│   ├── routes/

│   └── server.js

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── services/

│   │   └── App.jsx

│

└── README.md

---

## Installation

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## API Endpoints

### Authentication

* POST /api/auth/register
* POST /api/auth/login

### Products

* GET /api/products
* GET /api/products/:id
* POST /api/products
* PUT /api/products/:id
* DELETE /api/products/:id

### Orders

* GET /api/orders
* POST /api/orders

### Reviews

* GET /api/reviews/:productId
* POST /api/reviews

---

## Future Enhancements

* Product Images Upload
* Payment Gateway Integration
* Vendor Verification
* Advanced Analytics
* Order Tracking

---

## Developed By

Joel Rodrigues

Full Stack Developer Intern Project
