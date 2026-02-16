import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"
import errorHandler from "./middlewares/error.middleware.js";
import listingRoutes from "./routes/listing.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import priceRoutes from "./routes/price.routes.js";
import refundRoutes from "./routes/refund.routes.js";
import paymentRoutes from "./routes/payment.routes.js" 
import chatRoutes from "./routes/chat.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://college-marketplace-eight.vercel.app"
];

app.use((req,res,next)=>{
 console.log("ORIGIN:", req.headers.origin);
 next();
});

app.use(cors({
 origin: function(origin, callback) {
   if (!origin) return callback(null, true);

   if (allowedOrigins.includes(origin)) {
     callback(null, true);
   } else {
     callback(new Error("CORS BLOCKED"));
   }
 },
 credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>res.send("Hello"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use("/api/price", priceRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/refund", refundRoutes);

app.use("/api/chat", chatRoutes);

// ❗ ALWAYS LAST
app.use(errorHandler);

export default app;