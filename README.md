# Artisan's Corner - E-commerce Platform for Handmade Goods

Artisan's Corner is a full-stack multi-vendor e-commerce marketplace for handmade products. The platform allows buyers to browse and purchase handmade items, vendors to manage their own products and orders, and admins to monitor the overall marketplace activity.

This project was developed as part of a Full Stack Developer Internship project.

---

## Project Overview

Many individual artisans do not have the technical knowledge to create and manage their own online stores. Artisan's Corner provides a centralized marketplace where artisans can register as sellers, list handmade products, manage inventory, and receive orders.

Buyers can register, browse products, add items to cart, checkout using demo payment, and track their orders. Admins can manage products, orders, revenue, commission, and order status.

---

## Key Features

### Buyer Features
- Buyer registration and login
- Browse handmade products
- View product details
- Add products to cart
- Wishlist products
- Checkout with shipping address
- Demo payment system
- View order history
- Track order status
- Review purchased products
- Option to become a seller

### Seller / Vendor Features
- Seller registration and login
- Vendor dashboard
- Add new products
- Edit product details
- Delete products
- Manage product stock
- View received orders
- Update order status
- View total sales
- View vendor earnings
- Platform commission calculation

### Admin Features
- Admin login
- Admin dashboard
- View total products
- View total orders
- View total revenue
- View platform commission
- View vendor payout
- View all products
- View all orders
- Update order status

---

## Tech Stack

### Frontend
- React.js
- Vite
- React Router DOM
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- dotenv
- CORS

### Tools
- VS Code
- Thunder Client
- MongoDB Atlas
- GitHub

---

## Folder Structure

```bash
Artisans-Corner/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── paymentRoutes.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Database Collections

### Users
Stores buyer, vendor, and admin details.

Main fields:
- name
- email
- phone
- password
- role

### Products
Stores products added by vendors.

Main fields:
- name
- description
- price
- image
- stock
- vendor

### Orders
Stores buyer orders and payment details.

Main fields:
- buyer
- products
- totalAmount
- shippingAddress
- paymentStatus
- paymentMethod
- status
- platformFee
- vendorPayout

### Reviews
Stores product reviews from buyers.

Main fields:
- user
- product
- rating
- comment

---

## Database Relationship

```text
User (Vendor)  ───────>  Products
User (Buyer)   ───────>  Orders
Orders         ───────>  Products
User (Buyer)   ───────>  Reviews
Products       ───────>  Reviews
```

---

## Environment Variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

STRIPE_SECRET_KEY=
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
```

Note: Secret keys and MongoDB URI should not be uploaded to GitHub. The `.env` file is included in `.gitignore`.

---

## Demo Credentials

### Buyer Login

```text
Email: buyer@gmail.com
Password: buyer123
```

### Seller Login

```text
Email: seller@gmail.com
Password: seller123
```

### Admin Login

```text
Email: admin@gmail.com
Password: admin123456
```

---

## Important Routes

### Frontend Routes

```text
/                  Home page
/login             Buyer login
/register          Buyer register
/vendor-login      Seller login
/vendor-register   Seller register
/buyer             Buyer dashboard
/vendor            Vendor dashboard
/admin-login       Admin login
/admin             Admin dashboard
/cart              Cart page
/checkout          Checkout page
/orders            Orders page
```

### Backend API Routes

```text
/api/auth/register
/api/auth/login
/api/products
/api/orders
/api/reviews
/api/payments
```

---

## How to Run the Project

### Backend Setup

Open terminal inside the backend folder:

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

### Frontend Setup

Open another terminal inside the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Payment and Commission Logic

The project uses a demo payment system for testing the checkout flow.

Example:

```text
Product Price = ₹100
Platform Commission = 5% = ₹5
Vendor Earnings = 95% = ₹95
```

The system records:
- Total order amount
- Payment method
- Payment status
- Platform commission
- Vendor payout
- Order status

---

## Project Highlights

- Multi-vendor marketplace architecture
- Separate buyer, seller/vendor, and admin dashboards
- Protected routes based on user roles
- JWT-based authentication
- Password encryption using bcryptjs
- Product CRUD operations for vendors
- Product listing and product detail pages
- Cart and checkout flow
- Demo payment implementation
- Order creation after successful payment
- Cart clearing after checkout
- Order status management
- Review and rating system
- Platform commission calculation
- Vendor earnings calculation
- Responsive classic UI design

---

## Limitations / Future Enhancements

- Real Stripe payment can be enabled by adding Stripe secret key.
- Cloudinary image upload can be configured using Cloudinary credentials.
- Vendor store profile with logo and description can be added as an enhancement.
- Live deployment can be done using Vercel for frontend and Render for backend.

---

## Conclusion

Artisan's Corner successfully demonstrates a full-stack multi-vendor e-commerce platform for handmade goods. It provides buyer shopping flow, vendor product management, order processing, payment simulation, commission calculation, review system, and admin marketplace management.