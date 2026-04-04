import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Select,
  Text,
  Center,
  Box,
  PinInput,
  Group,
  FileInput,
  Progress,
  Badge,
  Alert,
  Stepper,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate, Link } from "react-router-dom";
import {
  IconMail,
  IconLock,
  IconUser,
  IconPhone,
  IconBus,
  IconId,
  IconCheck,
  IconScan,
  IconAlertCircle,
  IconShieldCheck,
  IconCamera,
} from "@tabler/icons-react";
import { register } from "../../api/auth";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:8082";

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { label: "Aadhaar", description: "Scan & verify" },
  { label: "OTP",     description: "Phone verification" },
  { label: "Account", description: "Create account" },
];

export default function Register() {
  const navigate = useNavigate();

  // Wizard state
  const [active, setActive] = useState(0);

  // Form data
  const [aadhaarFile, setAadhaarFile]         = useState(null);
  const [aadhaarNumber, setAadhaarNumber]     = useState("");
  const [maskedAadhaar, setMaskedAadhaar]     = useState("");
  const [adharFileUrl, setAdharFileUrl]       = useState("");
  const [phone, setPhone]                     = useState("");
  const [otp, setOtp]                         = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });

  // Loading states
  const [scanning, setScanning]       = useState(false);
  const [sendingOtp, setSendingOtp]   = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ─── Step 1: OCR Aadhaar ────────────────────────────────────────────────────

  const handleScanAadhaar = async () => {
    if (!aadhaarFile) {
      notifications.show({
        color: "red",
        title: "No file selected",
        message: "Please upload your Aadhaar card image first",
      });
      return;
    }

    const data = new FormData();
    data.append("file", aadhaarFile);

    try {
      setScanning(true);
      const res = await axios.post(`${API_BASE}/auth/extract-aadhaar`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAadhaarNumber(res.data.aadhaarNumber);
      setMaskedAadhaar(res.data.masked);
      setAdharFileUrl(res.data.adharFileUrl || "");
      notifications.show({
        color: "green",
        title: "Aadhaar Detected ✅",
        message: `Aadhaar number found: ${res.data.masked}`,
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      notifications.show({
        color: "red",
        title: "OCR Failed",
        message: msg,
      });
    } finally {
      setScanning(false);
    }
  };

  const handleStep1Next = async () => {
    if (!aadhaarNumber) {
      notifications.show({ color: "red", title: "Scan required", message: "Please scan your Aadhaar card first" });
      return;
    }
    if (!phone || phone.length < 10) {
      notifications.show({ color: "red", title: "Phone required", message: "Enter a valid phone number" });
      return;
    }

    // Send OTP to phone via SMS
    const e164 = (phone.startsWith("+") ? phone : `+91${phone}`).replace(/\s+/g, "");
    try {
      setSendingOtp(true);
      await axios.post(`${API_BASE}/auth/send-otp-phone?phone=${encodeURIComponent(e164)}`);
      notifications.show({
        color: "green",
        title: "OTP Sent 📱",
        message: `A 6-digit OTP has been sent to ${e164}`,
      });
      setPhone(e164); // store in E.164 format
      setActive(1);
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Failed to send OTP",
        message: err.response?.data || err.message,
      });
    } finally {
      setSendingOtp(false);
    }
  };

  // ─── Step 2: OTP verification ────────────────────────────────────────────────

  const handleResendOtp = async () => {
    try {
      setSendingOtp(true);
      const res = await axios.post(`${API_BASE}/auth/send-otp-phone?phone=${encodeURIComponent(phone)}`);
      notifications.show({ color: "blue", title: "OTP Resent", message: res.data || "Check your SMS" });
    } catch (err) {
      notifications.show({ color: "red", title: "Resend failed", message: err.message });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleStep2Next = () => {
    if (!otp || otp.length !== 6) {
      notifications.show({ color: "red", title: "Invalid OTP", message: "Enter the 6-digit OTP from your SMS" });
      return;
    }
    setActive(2);
  };

  // ─── Step 3: Registration ────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      notifications.show({ color: "red", title: "Validation Error", message: "Please fill all required fields" });
      return;
    }
    try {
      setLoading(true);
      await register({
        ...form,
        phone,
        otp,
        aadhaarNumber,
        adharFileUrl, // Aadhaar image already stored during OCR scan
      });

      notifications.show({ color: "green", title: "Registered! 🎉", message: "Your account has been created" });
      navigate("/");
    } catch (err) {
      notifications.show({ color: "red", title: "Registration failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared styles ────────────────────────────────────────────────────────────

  const inputStyles = { input: { height: 48, fontSize: "0.95rem" } };

  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "var(--radius-xl)",
    padding: "2rem",
    boxShadow: "var(--shadow-lg)",
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 50%, #0f0f1a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "2rem 1rem",
      }}
    >
      {/* Background glow orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)", top: "-10%", left: "-10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(118,75,162,0.1) 0%, transparent 70%)", bottom: "-5%", right: "-5%", pointerEvents: "none" }} />

      <Center style={{ width: "100%" }}>
        <div style={{ width: "100%", maxWidth: 520, animation: "cardFloat 0.6s ease-out" }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--user-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", boxShadow: "0 8px 32px rgba(124,92,252,0.3)" }}>
              <IconBus size={36} color="white" stroke={1.5} />
            </div>
            <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>Create Account</Title>
            <Text size="sm" c="dimmed" mt={6}>Complete 3 steps to register</Text>
          </div>

          {/* Step progress bar */}
          <Progress
            value={((active + 1) / 3) * 100}
            color="violet"
            size="sm"
            radius="xl"
            mb="md"
            style={{ opacity: 0.7 }}
          />

          {/* Step labels */}
          <Group justify="space-between" mb="lg" px={4}>
            {STEPS.map((s, i) => (
              <Group key={i} gap={6}>
                <ThemeIcon
                  size={24}
                  radius="xl"
                  color={i < active ? "green" : i === active ? "violet" : "gray"}
                  variant={i <= active ? "filled" : "light"}
                >
                  {i < active ? <IconCheck size={12} /> : <Text size={11} fw={700}>{i + 1}</Text>}
                </ThemeIcon>
                <div>
                  <Text size="xs" fw={600} c={i === active ? "violet.4" : "dimmed"}>{s.label}</Text>
                  <Text size={10} c="dimmed">{s.description}</Text>
                </div>
              </Group>
            ))}
          </Group>

          {/* ── Step 1: Aadhaar Scan ── */}
          {active === 0 && (
            <div style={cardStyle}>
              <Stack gap="md">
                <Group gap={8}>
                  <IconId size={20} color="#9b59b6" />
                  <Text fw={700} size="md">Scan Your Aadhaar Card</Text>
                </Group>

                <FileInput
                  id="register-aadhaar-file"
                  label="Aadhaar Card Image"
                  placeholder="Upload JPG / PNG of your Aadhaar card"
                  accept="image/jpeg,image/png"
                  value={aadhaarFile}
                  onChange={setAadhaarFile}
                  leftSection={<IconScan size={16} />}
                  size="md"
                  styles={inputStyles}
                  clearable
                />

                <Button
                  id="register-scan-aadhaar"
                  fullWidth
                  size="md"
                  loading={scanning}
                  onClick={handleScanAadhaar}
                  disabled={!aadhaarFile}
                  variant="light"
                  color="violet"
                  leftSection={<IconScan size={16} />}
                >
                  {scanning ? "Scanning…" : "Scan Aadhaar"}
                </Button>

                {maskedAadhaar && (
                  <Alert
                    icon={<IconShieldCheck size={16} />}
                    color="green"
                    radius="md"
                    title="Aadhaar Verified"
                  >
                    <Text size="sm">Detected: <strong>{maskedAadhaar}</strong></Text>
                    <Badge color="green" size="sm" mt={4}>Verhoeff checksum ✓</Badge>
                  </Alert>
                )}

                {!maskedAadhaar && (
                  <Alert color="orange" icon={<IconAlertCircle size={16} />} radius="md" title="Clear image required">
                    Ensure the Aadhaar number is fully visible and the image is not blurry.
                  </Alert>
                )}

                <TextInput
                  id="register-phone"
                  label="Mobile Number linked to Aadhaar"
                  description="OTP will be sent to this number via SMS"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftSection={<IconPhone size={16} stroke={1.5} />}
                  size="md"
                  styles={inputStyles}
                  required
                />

                <Button
                  id="register-send-otp"
                  fullWidth
                  size="lg"
                  loading={sendingOtp}
                  onClick={handleStep1Next}
                  disabled={!aadhaarNumber}
                  variant="gradient"
                  gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
                  styles={{ root: { height: 50, fontSize: "1rem", fontWeight: 600 } }}
                >
                  Send OTP to Phone →
                </Button>
              </Stack>
            </div>
          )}

          {/* ── Step 2: OTP Verification ── */}
          {active === 1 && (
            <div style={cardStyle}>
              <Stack gap="md">
                <Group gap={8}>
                  <IconPhone size={20} color="#9b59b6" />
                  <Text fw={700} size="md">Verify Your Phone</Text>
                </Group>

                <Text size="sm" c="dimmed">
                  A 6-digit OTP was sent via SMS to <strong style={{ color: "#9b8fd0" }}>{phone}</strong>
                </Text>

                <Box>
                  <Text size="sm" fw={600} mb={8} style={{ color: "var(--text-secondary)" }}>
                    Enter OTP
                  </Text>
                  <Group justify="center">
                    <PinInput
                      id="register-otp"
                      length={6}
                      type="number"
                      value={otp}
                      onChange={setOtp}
                      size="md"
                    />
                  </Group>
                  <Text size="xs" c="dimmed" ta="center" mt={8}>
                    OTP expires in 5 minutes
                  </Text>
                </Box>

                <Button
                  id="register-otp-next"
                  fullWidth
                  size="lg"
                  onClick={handleStep2Next}
                  variant="gradient"
                  gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
                  styles={{ root: { height: 50, fontSize: "1rem", fontWeight: 600 } }}
                >
                  Verify OTP →
                </Button>

                <Group justify="space-between">
                  <Button variant="subtle" color="gray" size="xs" onClick={() => setActive(0)}>
                    ← Back
                  </Button>
                  <Button variant="subtle" color="violet" size="xs" loading={sendingOtp} onClick={handleResendOtp}>
                    Resend OTP
                  </Button>
                </Group>
              </Stack>
            </div>
          )}

          {/* ── Step 3: Account Details ── */}
          {active === 2 && (
            <div style={cardStyle}>
              <Stack gap="md">
                <Group gap={8}>
                  <IconUser size={20} color="#9b59b6" />
                  <Text fw={700} size="md">Account Details</Text>
                </Group>

                <TextInput
                  id="register-name"
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  leftSection={<IconUser size={16} stroke={1.5} />}
                  size="md"
                  styles={inputStyles}
                  required
                />

                <TextInput
                  id="register-email"
                  name="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  leftSection={<IconMail size={16} stroke={1.5} />}
                  size="md"
                  styles={inputStyles}
                  required
                />

                <PasswordInput
                  id="register-password"
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  leftSection={<IconLock size={16} stroke={1.5} />}
                  size="md"
                  styles={inputStyles}
                  required
                />

                <Select
                  id="register-role"
                  label="Role"
                  placeholder="Select your role"
                  data={[
                    { value: "STUDENT", label: "Student" },
                    { value: "USER",    label: "User" },
                  ]}
                  value={form.role}
                  onChange={(value) => setForm({ ...form, role: value })}
                  size="md"
                  styles={inputStyles}
                  required
                />

                <Button
                  id="register-submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  onClick={handleRegister}
                  variant="gradient"
                  gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
                  leftSection={<IconCheck size={18} />}
                  styles={{ root: { height: 50, fontSize: "1rem", fontWeight: 600 } }}
                >
                  Create Account
                </Button>

                <Button variant="subtle" color="gray" size="xs" onClick={() => setActive(1)}>
                  ← Back
                </Button>
              </Stack>
            </div>
          )}

          {/* Sign-in link */}
          <Text size="sm" ta="center" mt="lg" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "var(--user-primary-light)", fontWeight: 600 }}>
              Sign in
            </Link>
          </Text>
        </div>
      </Center>

      <style>{`
        @keyframes cardFloat {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </Box>
  );
}
