# 📚 College Marketplace

A **full-stack marketplace platform** designed for college students to **buy, sell, and chat securely within their campus community**.

This application enables students to list products, communicate in real-time, manage purchases, and complete transactions — all in one place.

---

## 🌐 Live Demo

* 🔗 Frontend: https://college-marketplace-eight.vercel.app
* 🔗 Backend API: https://college-marketplace-k69b.onrender.com

---

## ✨ Key Features

### 👤 Authentication & Security

* JWT-based authentication (Login / Signup)
* Protected routes with role-based access (User/Admin)
* Persistent login with token storage
* Secure API access

---

### 🛒 Marketplace System

* Create, edit, and delete listings
* Upload product images
* Mark items as **Sold**
* Category & condition filtering
* Prevent users from purchasing their own listings

---

### ❤️ Wishlist & Cart

* Add/remove items from wishlist
* Add/remove items from cart
* Auto-remove sold items
* Seamless user experience across sessions

---

### 💬 Real-Time Chat System (Core Highlight 🚀)

* One-to-one **Buyer ↔ Seller conversations**
* **Multiple buyers per listing supported**
* Real-time messaging using Socket.IO
* online/offline status
* Unread message count per user
* Optimistic UI updates
* **Chat disabled automatically when item is sold**

---

### 💰 Payment Integration

* Razorpay payment gateway integration
* Order creation & verification
* Secure checkout flow

---

### 🎨 Modern UI/UX

* Responsive design using Tailwind CSS
* Clean and minimal interface
* Search and filtering system
* Profile dropdown & dashboard
* Smooth user interactions

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Socket.IO
* JWT Authentication
* Razorpay API

---

## 🧠 System Design Highlights

* Scalable **chat architecture using conversation-based rooms**
* Database design supports:

  ```
  1 listing → multiple buyers → separate conversations
  ```
* Real-time event handling using WebSockets
* Optimized unread message tracking using Map structure
* Secure middleware-based authentication

---

## ⚙️ Environment Variables

Create a `.env` file inside `/backend`:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## 🚀 Getting Started

### 1. Clone the repository

```
git clone https://github.com/your-username/college-marketplace.git
cd college-marketplace
```

### 2. Install dependencies

```
cd backend && npm install
cd ../frontend && npm install
```

### 3. Run the app

```
# backend
npm run dev

# frontend
npm run dev
```

---

## 📌 Future Improvements

* Message read receipts (✔✔ seen)
* Push notifications
* Chat pagination (infinite scroll)
* Advanced search filters
* AI-based recommendations

---

## 👨‍💻 Author

**Siddharth Bhandari**
Aspiring Full Stack Developer

* GitHub: https://github.com/bhandarisiddharth256
* LinkedIn: https://www.linkedin.com/in/siddharthbhandari0911/

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!
