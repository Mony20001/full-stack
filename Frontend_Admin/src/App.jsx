import { BrowserRouter, Navigate, Route, Routes, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import "./index.css";
import Products from "./components/Products";
import Category from "./components/Category";
import Order from "./components/Order";
import Inventory from "./components/Inventory";
import Delivery from "./components/Delivery";
import Register from "./components/Register";
import Login from "./components/Login";

// --- auth helpers -----------------------------------------------------------
const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const isAuthed = () => Boolean(getToken());

// // --- guards -----------------------------------------------------------------
// function RequireAuth() {
//   if (!isAuthed()) {
//     // remember where the user was heading so we can send them back after login
//     return <Navigate to="/login" replace />;
//   }
//   return <Outlet />;
// }

// function RedirectIfAuthed() {
//   if (isAuthed()) return <Navigate to="/dashboard" replace />;
//   return <Outlet />;
// }

// // --- layout -----------------------------------------------------------------
// function DashboardLayout() {
//   return (
//     <div className="flex h-dvh overflow-hidden bg-slate-50">
//       <Sidebar />
//       <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// // --- auth page wrappers (so they get the navigation props) ------------------
// function LoginPage() {
//   const navigate = useNavigate();
//   // return (
//   //   // <Login
//   //   //   onSwitchToRegister={() => navigate("/register")}
//   //   //   onSuccess={() => navigate("/dashboard", { replace: true })}
//   //   // />
//   // );
// }

// function RegisterPage() {
//   const navigate = useNavigate();
//   return (
//     <Register
//       onSwitchToLogin={() => navigate("/login")}
//     />
//   );
// }

function RequireAuth() {
  return isAuthed() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RedirectIfAuthed() {
  return isAuthed() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function DashboardLayout() {
  return <div className="flex h-dvh overflow-hidden bg-slate-50"><Sidebar /><main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden"><Outlet /></main></div>;
}

function LoginPage() {
  const navigate = useNavigate();
  return <Login onSwitchToRegister={() => navigate("/register")} onSuccess={() => navigate("/dashboard", { replace: true })} />;
}

function RegisterPage() {
  const navigate = useNavigate();
  return <Register onSwitchToLogin={() => navigate("/login")} />;
}

// --- app --------------------------------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public-only routes — already-authed users get bounced to dashboard */}
        <Route element={<RedirectIfAuthed />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes — must be signed in */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category" element={<Category />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/delivery" element={<Delivery />} />
          </Route>
        </Route>

        {/* Unknown URL → dashboard (guard will bounce to /login if not authed) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
