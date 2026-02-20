📚 College Marketplace

A full-stack web application built for college students to buy, sell, and chat securely within their campus community.

Students can list items (books, electronics, notes, etc.), communicate in real-time with buyers/sellers, manage carts & wishlists, and complete purchases — all in one platform.

🚀 Features

👤 Authentication

JWT based login / signup
Protected routes
User profile management

🛒 Marketplace

Create / Edit / Delete listings
Upload product images
Mark items as Sold
Category + condition support
Prevent users from buying their own listings

❤️ Wishlist & Cart

Add / remove items from wishlist
Add / remove items from cart
Auto-remove sold items from cart/wishlist

💬 Real-Time Chat (Socket.IO)

Buyer ↔ Seller messaging
Online / Offline indicators
Typing indicators
Unread message count
Optimistic UI updates
Chat disabled automatically when item is sold

💰 Payments (Razorpay Integration)

Create order
Verify payment
Secure checkout flow

🎨 Frontend UI

Responsive layout (Tailwind CSS)
Modern hero section
Search + filters
Profile dropdown
Marketplace filters

🛠 Tech Stack
Frontend

React + Vite
Tailwind CSS
Axios
Socket.IO Client

Backend

Node.js
Express.js
MongoDB + Mongoose
Socket.IO
JWT Authentication
Razorpay

⚙️ Environment Variables

Create:

backend/.env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

👨‍💻 Author

Siddharth Bhandari

Aspiring Full Stack Developer

⭐ If you like this project, give it a star!
