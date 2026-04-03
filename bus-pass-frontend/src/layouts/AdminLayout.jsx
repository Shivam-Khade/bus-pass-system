import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import AdminFooter from "../components/AdminFooter";

const AdminLayout = () => {
  return (
    <div style={{
      height: "100vh",
      backgroundColor: "var(--color-bg)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Background Gradient Orbs */}
      <div style={{
        position: "absolute",
        top: "-20%",
        right: "-10%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "-5%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(5, 150, 105, 0.06) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <AdminNavbar />
      <div style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1
      }}>
        <Outlet />
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;