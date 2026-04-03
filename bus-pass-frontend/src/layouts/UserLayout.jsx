import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import SOSButton from "../components/SOSButton";

const UserLayout = () => {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--color-bg)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflowX: "hidden"
    }}>
      {/* Background Gradient Orbs */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-15%",
        width: "700px",
        height: "700px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124, 92, 252, 0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "-5%",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <UserNavbar />
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "2rem",
        flex: 1,
        width: "100%",
        position: "relative",
        zIndex: 1
      }}>
        <Outlet />
      </div>
      <Footer />
      <SOSButton />
    </div>
  );
};

export default UserLayout;
