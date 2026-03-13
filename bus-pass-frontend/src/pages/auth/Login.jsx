import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Text,
  Center,
  Box,
  Checkbox,
  Group,
} from "@mantine/core";
import { IconMail, IconLock, IconBus } from "@tabler/icons-react";
import { login } from "../../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    if (!form.email || !form.password) return;

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.role === "ADMIN" ? "/admin" : "/user");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  // Floating particles
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }))
  );

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
      }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: "absolute",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)",
        top: "-10%",
        right: "-10%",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(118,75,162,0.1) 0%, transparent 70%)",
        bottom: "-5%",
        left: "-5%",
        pointerEvents: "none",
      }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: "rgba(124, 92, 252, 0.25)",
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      <Center style={{ width: "100%", padding: "1rem" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            animation: "cardFloat 0.6s ease-out",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--user-gradient)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                boxShadow: "0 8px 32px rgba(124, 92, 252, 0.3)",
              }}
            >
              <IconBus size={36} color="white" stroke={1.5} />
            </div>
            <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
              Welcome Back
            </Title>
            <Text size="sm" c="dimmed" mt={6}>
              Sign in to manage your bus passes
            </Text>
          </div>

          {/* Glass Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <Stack gap="md">
              <TextInput
                id="login-email"
                name="email"
                label="Email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                leftSection={<IconMail size={16} stroke={1.5} />}
                size="md"
                styles={{
                  input: {
                    height: 48,
                    fontSize: "0.95rem",
                  },
                }}
              />

              <PasswordInput
                id="login-password"
                name="password"
                label="Password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                leftSection={<IconLock size={16} stroke={1.5} />}
                size="md"
                styles={{
                  input: {
                    height: 48,
                    fontSize: "0.95rem",
                  },
                }}
              />

              <Group justify="space-between">
                <Checkbox
                  id="login-remember"
                  label="Remember me"
                  size="sm"
                  color="violet"
                  styles={{ label: { color: "var(--text-secondary)" } }}
                />
                <Text size="xs" c="dimmed" style={{ cursor: "pointer" }}>
                  Forgot password?
                </Text>
              </Group>

              <Button
                id="login-submit"
                fullWidth
                size="lg"
                loading={loading}
                onClick={handleLogin}
                variant="gradient"
                gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
                styles={{
                  root: {
                    height: 50,
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 250ms ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 8px 24px rgba(124, 92, 252, 0.35)",
                    },
                  },
                }}
              >
                Sign In
              </Button>

              <Text size="sm" ta="center" mt="xs" style={{ color: "var(--text-secondary)" }}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "var(--user-primary-light)",
                    fontWeight: 600,
                  }}
                >
                  Create one
                </Link>
              </Text>
            </Stack>
          </div>
        </div>
      </Center>

      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-40px) translateX(20px); opacity: 0.7; }
        }
        @keyframes cardFloat {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </Box>
  );
}