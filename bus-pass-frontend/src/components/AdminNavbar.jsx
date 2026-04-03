import { useState, useEffect } from "react";
import { Group, Button, Text, Menu, Avatar, Badge, Burger, Drawer, Stack, Box, UnstyledButton } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { logout, getCurrentUser } from "../api/auth";
import { IconBus, IconLogout, IconShieldCheck, IconLayoutDashboard, IconFileText, IconTicket, IconUsers, IconAlertTriangle } from "@tabler/icons-react";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [opened, { toggle, close }] = useDisclosure(false);

  const [pendingAppsCount, setPendingAppsCount] = useState(0);
  const [activeSosCount, setActiveSosCount] = useState(0);

  useEffect(() => {
    if (user && user.token) {
      fetchCounts();
      const interval = setInterval(fetchCounts, 30000); // 30 sec poll
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchCounts = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      
      // Fetch applications
      const appsRes = await fetch(`${BASE_URL}/api/pass/admin/all`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (appsRes.ok) {
        const apps = await appsRes.json();
        setPendingAppsCount(apps.filter(app => app.status === "PENDING").length);
      }

      // Fetch SOS
      const sosRes = await fetch(`${BASE_URL}/api/sos/all`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (sosRes.ok) {
        const sos = await sosRes.json();
        setActiveSosCount(sos.filter(a => a.status === "ACTIVE").length);
      }
    } catch (e) {
      console.error("Error fetching admin counts", e);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const navigateTo = (path) => {
    navigate(path);
    close();
  };

  const navLinks = [
    { label: "Dashboard", path: "/admin", icon: IconLayoutDashboard },
    { label: "Applications", path: "/admin/applications", icon: IconFileText, count: pendingAppsCount },
    { label: "Passes", path: "/admin/passes", icon: IconTicket },
    { label: "Users", path: "/admin/users", icon: IconUsers },
    { label: "SOS Alerts", path: "/admin/sos-alerts", icon: IconAlertTriangle, count: activeSosCount },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.includes(path);
  };

  const getLinkRightSection = (count) => {
    if (count > 0) {
      return (
        <Badge
          color="red"
          size="xs"
          variant="filled"
          circle
          style={{ width: "20px", height: "20px", pointerEvents: "none" }}
        >
          {count > 99 ? "99+" : count}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div style={{
      width: "100%",
      background: "rgba(15, 15, 26, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0.75rem 2rem",
      }}>
        <Group justify="space-between">
          <Group gap="xl">
            <UnstyledButton onClick={() => navigate("/admin")}>
              <Group gap="xs">
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--admin-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-glow-admin)",
                }}>
                  <IconBus size={22} color="white" stroke={1.5} />
                </div>
                <Text size="lg" fw={700} style={{ color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                  Bus Pass
                </Text>
                <Badge
                  size="sm"
                  variant="gradient"
                  gradient={{ from: "teal", to: "lime", deg: 135 }}
                  visibleFrom="sm"
                  styles={{ root: { textTransform: "uppercase", letterSpacing: "0.5px" } }}
                >
                  Admin
                </Badge>
              </Group>
            </UnstyledButton>

            {/* Desktop Navigation */}
            <Group gap={4} visibleFrom="md">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  variant={isActive(link.path) ? "light" : "subtle"}
                  color={isActive(link.path) ? "teal" : "gray"}
                  onClick={() => navigate(link.path)}
                  leftSection={<link.icon size={16} stroke={1.5} />}
                  rightSection={getLinkRightSection(link.count)}
                  size="sm"
                  styles={{
                    root: {
                      fontWeight: isActive(link.path) ? 600 : 400,
                      transition: "all 200ms ease",
                      borderRadius: "var(--radius-md)",
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Group>
          </Group>

          <Group>
            {/* Desktop User Menu */}
            <Box visibleFrom="md">
              <Menu shadow="xl" width={240} position="bottom-end" withArrow>
                <Menu.Target>
                  <UnstyledButton
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      transition: "all 200ms ease",
                    }}
                  >
                    <Avatar size="sm" radius="xl" color="teal" variant="filled">
                      {user?.name?.charAt(0)}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} lh={1.2} style={{ color: "var(--text-primary)" }}>
                        {user?.name}
                      </Text>
                      <Text size="xs" lh={1.2} style={{ color: "var(--text-muted)" }}>
                        Admin
                      </Text>
                    </div>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Admin Account</Menu.Label>
                  <Menu.Item leftSection={<IconShieldCheck size={16} />}>
                    <div>
                      <Text size="sm" fw={500}>{user?.name}</Text>
                      <Text size="xs" c="dimmed">{user?.email}</Text>
                    </div>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Box>

            {/* Mobile Burger */}
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" color="var(--text-primary)" size="sm" />
          </Group>
        </Group>

        {/* Mobile Drawer */}
        <Drawer
          opened={opened}
          onClose={close}
          title={
            <Group gap="xs">
              <IconBus size={24} color="var(--admin-primary)" />
              <Text fw={700}>Admin Menu</Text>
            </Group>
          }
          padding="lg"
          size="80%"
          hiddenFrom="md"
        >
          <Stack mt="md">
            <div style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}>
              <Group gap="sm">
                <Avatar size="lg" radius="xl" color="teal" variant="filled">
                  {user?.name?.charAt(0)}
                </Avatar>
                <div>
                  <Text size="sm" fw={600}>{user?.name}</Text>
                  <Text size="xs" c="dimmed">{user?.email}</Text>
                  <Badge color="teal" size="xs" variant="light" mt={4}>ADMIN</Badge>
                </div>
              </Group>
            </div>

            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant={isActive(link.path) ? "light" : "subtle"}
                color={isActive(link.path) ? "teal" : "gray"}
                fullWidth
                onClick={() => navigateTo(link.path)}
                justify="space-between"
                leftSection={
                  <Group gap="sm">
                    <link.icon size={18} />
                    <span>{link.label}</span>
                  </Group>
                }
                rightSection={getLinkRightSection(link.count)}
                size="md"
                styles={{
                  root: {
                    fontWeight: isActive(link.path) ? 600 : 400,
                    borderRadius: "var(--radius-md)",
                  },
                }}
              >
              </Button>
            ))}

            <Button
              variant="subtle"
              color="red"
              fullWidth
              onClick={handleLogout}
              justify="flex-start"
              leftSection={<IconLogout size={18} />}
              size="md"
              mt="xl"
            >
              Logout
            </Button>
          </Stack>
        </Drawer>
      </div>
    </div>
  );
};

export default AdminNavbar;
