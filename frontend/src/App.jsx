import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EvaluatorDashboard from "./pages/EvaluatorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import EvaluationForm from "./pages/EvaluationForm";
import EvaluationSummary from "./pages/EvaluationSummary";
import EvaluationDetailAdmin from "./pages/EvaluationDetailAdmin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluator"
            element={
              <ProtectedRoute role="evaluator">
                <EvaluatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluate/:id"
            element={
              <ProtectedRoute role="evaluator">
                <EvaluationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary/:id"
            element={
              <ProtectedRoute role="evaluator">
                <EvaluationSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/evaluation/:id"
            element={
              <ProtectedRoute role="admin">
                <EvaluationDetailAdmin />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
