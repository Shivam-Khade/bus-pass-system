import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// Dashboards
import AdminDashboard from "./pages/admin/Dashboard";
import UserDashboard from "./pages/user/Dashboard";
import Profile from "./pages/user/Profile";
import ApplyPass from "./pages/user/ApplyPass";
import MyPass from "./pages/user/MyPass";
import Applications from "./pages/admin/Applications";
import Passes from "./pages/admin/Passes";
import Users from "./pages/admin/Users";
import SosAlerts from "./pages/admin/SosAlerts";

// Utils
const getUser = () => {
	const user = localStorage.getItem("user");
	return user ? JSON.parse(user) : null;
};

// Route guards
const AdminRoute = ({ children }) => {
	const user = getUser();
	if (!user || user.role !== "ADMIN") {
		return <Navigate to="/" replace />;
	}
	return children;
};

const UserRoute = ({ children }) => {
	const user = getUser();
	if (!user || (user.role !== "USER" && user.role !== "STUDENT")) {
		return <Navigate to="/" replace />;
	}
	return children;
};

import SmoothScroll from "./components/SmoothScroll";

export default function App() {
	return (
		<BrowserRouter>
			<SmoothScroll />
			<Routes>
				{/* Auth */}
				<Route path="/" element={<Login />} />
				<Route path="/register" element={<Register />} />

				{/* Admin Panel with Layout */}
				<Route
					path="/admin"
					element={
						<AdminRoute>
							<AdminLayout />
						</AdminRoute>
					}
				>
					<Route index element={<AdminDashboard />} />
					<Route path="applications" element={<Applications />} />
					<Route path="passes" element={<Passes />} />
					<Route path="users" element={<Users />} />
					<Route path="sos-alerts" element={<SosAlerts />} />
				</Route>

				{/* User / Student Panel with Layout */}
				<Route
					path="/user"
					element={
						<UserRoute>
							<UserLayout />
						</UserRoute>
					}
				>
					<Route index element={<UserDashboard />} />
					<Route path="apply" element={<ApplyPass />} />
					<Route path="my-pass" element={<MyPass />} />
					<Route path="profile" element={<Profile />} />
				</Route>

				{/* Fallback */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
