import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import Home from "./pages/Home";
import AddListing from "./pages/AddListing";
import MyListings from "./pages/MyListings";
import Messages from "./pages/Messages";
import ListingDetails from "./pages/ListingDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyPurchases from "./pages/MyPurchases";
import PurchaseDetails from "./pages/PurchaseDetails";
import MySales from "./pages/MySales";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />

        <Routes>
          {/* 🌐 Public */}
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 Protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-listing/:id"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <MyPurchases />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchases/:purchaseId"
            element={
              <ProtectedRoute>
                <PurchaseDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <MySales />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
