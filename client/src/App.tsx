import { type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import PurchaserDashboard from "./pages/PurchaserDashboard";
import OrderTakerDashboard from "./pages/OrderTakerDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import ShippingDashboard from "./pages/ShippingDashboard";

// 認証済みルートコンポーネント
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// アプリケーションルート
function AppRoutes() {
  const { role, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            // ログイン済みなら自分のダッシュボードへリダイレクト
            <Navigate
              to={
                role === "purchaser"
                  ? "/purchaser"
                  : role === "ordertaker"
                  ? "/ordertaker"
                  : role === "accountant"
                  ? "/accountant"
                  : role === "shipping"
                  ? "/shipping"
                  : "/"
              }
              replace
            />
          )
        }
      />
      <Route
        path="/purchaser/*"
        element={
          <ProtectedRoute>
            <PurchaserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordertaker/*"
        element={
          <ProtectedRoute>
            <OrderTakerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accountant/*"
        element={
          <ProtectedRoute>
            <AccountantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipping/*"
        element={
          <ProtectedRoute>
            <ShippingDashboard />
          </ProtectedRoute>
        }
      />
      {/* 未ログイン時は/loginへリダイレクト */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
