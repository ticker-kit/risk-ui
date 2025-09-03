import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import TickerMetrics from "./pages/TickerMetrics";
import Portfolio from "./pages/Portfolio";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Users from "./pages/Users";
import CurrencyPickerDemo from "./pages/CurrencyPickerDemo";
import ProtectedRoute from "./components/ProtectedRoute";
import AppNavbar from "./navbar";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <AppNavbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/ticker/:ticker?" element={<TickerMetrics />} />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demo" element={<CurrencyPickerDemo />} />
      </Routes>
    </div>
  );
}

export default App;
