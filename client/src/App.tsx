import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import PurchaserDashboard from "./pages/PurchaserDashboard";
import OrderTakerDashboard from "./pages/OrderTakerDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import ShippingDashboard from "./pages/ShippingDashboard";

function App() {
  const [role, setRole] = useState<string | null>(null);

  return (
    <BrowserRouter>
      {!role ? (
        <Login onLogin={setRole} />
      ) : (
        <Routes>
          {role === "purchaser" && (
            <Route path="/*" element={<PurchaserDashboard />} />
          )}
          {role === "ordertaker" && (
            <Route path="/*" element={<OrderTakerDashboard />} />
          )}
          {role === "accountant" && (
            <Route path="/*" element={<AccountantDashboard />} />
          )}
          {role === "shipping" && (
            <Route path="/*" element={<ShippingDashboard />} />
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
