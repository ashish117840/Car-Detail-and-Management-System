

# 🚗 **Car Detail and Management System (MERN)**

A full-stack **Car Management Platform** built using **React, Node.js, Express, MongoDB**, secured with **JWT authentication**, featuring **Cloudinary image upload** and **Razorpay integration** for service billing/payments.

---

## 📌 **Overview**

The **Car Detail and Management System** is a comprehensive MERN-based application for managing cars, customer data, service history, and billing. The **React frontend** provides an interactive UI, while the backend is powered by **Express.js**, with **MongoDB** as the database.

Car images and documents are uploaded securely to **Cloudinary**, providing fast optimized delivery.
The platform includes secure online payments through **Razorpay**, enabling billing for car servicing and premium services.

This is your **major project**, featuring a complete admin panel, user module, payment system, and CRUD operations.

---

## 🚀 **Live Demo**

### 🌐 **Frontend (Vercel):**

[https://vercel.com/ashish-kumars-projects-fbc8c286/car-detail-and-management-system](https://vercel.com/ashish-kumars-projects-fbc8c286/car-detail-and-management-system)

### 🔗 **Backend (Render):**

[https://car-detail-and-management-system.onrender.com](https://car-detail-and-management-system.onrender.com)

### 📁 **GitHub Repository:**

[https://github.com/ashish117840/Car-Detail-and-Management-System](https://github.com/ashish117840/Car-Detail-and-Management-System)

---

## 🛠️ **Tech Stack**

### **Frontend**

* React.js
* React Router
* Axios
* TailwindCSS / CSS

### **Backend**

* Node.js
* Express.js
* JWT Authentication
* Bcrypt.js

### **Database**

* MongoDB + Mongoose

### **Cloud Storage**

* **Cloudinary** for secure image & document upload

### **Payment Gateway**

* **Razorpay** for online service billing

---

## 🔐 **Authentication**

* JWT-based secure authentication
* Bcrypt.js password hashing
* Protected API routes
* Admin & user access control

---

## 🏁 **Core Features**

### 👤 **User Features**

* Register/Login securely
* View car listings
* Upload car images (Cloudinary)
* Pay service charges online (Razorpay)
* View/download payment receipts

### 🛠️ **Admin Features**

* Add new car entries
* Update car details
* Delete cars
* Manage customer details
* Track service history
* Manage payments & receipts

### ⚙️ **Technical Features**

* Cloudinary image upload integration
* Razorpay payment gateway
* Full CRUD operations
* Secure token-based routes
* Responsive UI & fast API

---

## 📸 **Cloudinary Image Upload**

All car images are stored in **Cloudinary**, ensuring:

* Secure cloud storage
* Quick CDN-based image loading
* Auto optimized quality
* No local server storage needed

---

## 💳 **Razorpay Billing Integration**

A complete Razorpay checkout flow is implemented for:

* Service payments
* Premium features
* Customer billing

### Includes:

* Razorpay order creation
* Popup checkout on frontend
* Payment verification
* Success confirmation
* Transaction storage in database

---

## 🗂️ **Project Structure**

```
Car-Detail-and-Management-System/
│── client/                # React frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│── server/                # Node-Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│── README.md
│── package.json
```

---

## ⚙️ **Installation & Setup**

### **Clone the project**

```bash
git clone https://github.com/ashish117840/Car-Detail-and-Management-System
cd Car-Detail-and-Management-System
```

---

## 🖥️ **Frontend Installation (React)**

```bash
cd client
npm install
npm run dev
```

---

## 🖥️ **Backend Installation (Node + Express)**

```bash
cd server
npm install
npm run dev
```

---

## 🔧 **Environment Variables**

Create a `.env` file inside the backend (`server/`):

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

## 📈 **Future Improvements**

* Email notifications for service updates
* Multiple admin roles
* PDF invoice generation
* Analytics dashboard
* Insurance/RC document storage

---

## 👨‍💻 **Author**

**Ashish Kumar**
Full Stack Web Developer
GitHub: [https://github.com/ashish117840](https://github.com/ashish117840)
LinkedIn: [https://www.linkedin.com/in/ashish-kumar7000](https://www.linkedin.com/in/ashish-kumar7000)

---

