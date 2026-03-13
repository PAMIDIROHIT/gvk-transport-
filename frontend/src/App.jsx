import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MinePurchases from './pages/MinePurchases';
import FactoryOperations from './pages/FactoryOperations';
import LorryFleet from './pages/LorryFleet';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-base-900 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="mine" element={<MinePurchases />} />
            <Route path="factory" element={<FactoryOperations />} />
            <Route path="lorries" element={<LorryFleet />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
