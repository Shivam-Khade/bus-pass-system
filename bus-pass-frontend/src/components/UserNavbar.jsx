import { useEffect, useState } from "react";
import { Group, Button, Text, Menu, Avatar, Burger, Drawer, Stack, Box, UnstyledButton, Badge, Modal } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { logout, getCurrentUser } from "../api/auth";
import { IconBus, IconLogout, IconUser, IconTicket, IconLayoutDashboard, IconPlus } from "@tabler/icons-react";
import Profile from "../pages/user/Profile";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  const [hasActivePass, setHasActivePass] = useState(false);
  const [photoSrc, setPhotoSrc] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";

  useEffect(() => {
    if (user?.email) {
      checkPassStatus();
      fetchLatestProfile();
    }
    // Set initial photo from cached user data
    if (user?.photoUrl) {
      setPhotoSrc(`${BASE_URL}/files/${user.photoUrl}`);
    }
  }, []);

  const fetchLatestProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.photoUrl) {
          setPhotoSrc(`${BASE_URL}/files/${data.photoUrl}`);
          // Update localStorage so the photo persists
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          stored.photoUrl = data.photoUrl;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      }
    } catch (error) {
      console.error("Profile fetch failed", error);
    }
  };

  const checkPassStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/pass?email=${encodeURIComponent(user.email)}`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (data && data.status === 'ACTIVE') {
          setHasActivePass(true);
        }
      }
    } catch (error) {
      console.error("Status check failed", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navigateTo = (path) => {
    navigate(path);
    close();
  };

  const navLinks = [
    { label: "Dashboard", path: "/user", icon: IconLayoutDashboard },
    !hasActivePass && { label: "Apply Pass", path: "/user/apply", icon: IconPlus },
    { label: "My Pass", path: "/user/my-pass", icon: IconTicket },
  ].filter(Boolean);

  return (
    <>
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
              <UnstyledButton onClick={() => navigate("/user")}>
                <Group gap="xs">
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "var(--user-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow-glow-user)",
                  }}>
                    <IconBus size={22} color="white" stroke={1.5} />
                  </div>
                  <Text size="lg" fw={700} style={{ color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                    Bus Pass
                  </Text>
                </Group>
              </UnstyledButton>

              {/* Desktop Navigation */}
              <Group gap={4} visibleFrom="md">
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    variant={isActive(link.path) ? "light" : "subtle"}
                    color={isActive(link.path) ? "violet" : "gray"}
                    onClick={() => navigate(link.path)}
                    leftSection={<link.icon size={16} stroke={1.5} />}
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
                      <Avatar size="sm" radius="xl" color="violet" variant="filled" src={photoSrc}>
                        {user?.name?.charAt(0)}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500} lh={1.2} style={{ color: "var(--text-primary)" }}>
                          {user?.name}
                        </Text>
                        <Text size="xs" lh={1.2} style={{ color: "var(--text-muted)" }}>
                          {user?.role === "STUDENT" ? "Student" : "User"}
                        </Text>
                      </div>
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>My Account</Menu.Label>
                    <Menu.Item leftSection={<IconUser size={16} />} onClick={openProfile}>
                      My Profile
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
                <IconBus size={24} color="var(--user-primary)" />
                <Text fw={700}>Menu</Text>
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
              }} onClick={openProfile}>
                <Group gap="sm">
                  <Avatar size="lg" radius="xl" color="violet" variant="filled" src={photoSrc}>
                    {user?.name?.charAt(0)}
                  </Avatar>
                  <div>
                    <Text size="sm" fw={600}>{user?.name}</Text>
                    <Text size="xs" c="dimmed">{user?.email}</Text>
                    <Badge color="violet" size="xs" variant="light" mt={4}>{user?.role}</Badge>
                  </div>
                </Group>
              </div>

              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  variant={isActive(link.path) ? "light" : "subtle"}
                  color={isActive(link.path) ? "violet" : "gray"}
                  fullWidth
                  onClick={() => navigateTo(link.path)}
                  justify="flex-start"
                  leftSection={<link.icon size={18} />}
                  size="md"
                  styles={{
                    root: {
                      fontWeight: isActive(link.path) ? 600 : 400,
                      borderRadius: "var(--radius-md)",
                    },
                  }}
                >
                  {link.label}
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
      </div >

      {/* Profile Modal - Size reduced to 'sm' (approx 380px) for compact view */}
      <Modal
        opened={profileOpened}
        onClose={() => {
          closeProfile();
          fetchLatestProfile(); // Refresh navbar data (like photo) after modal closes
        }}
        size="sm"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        withCloseButton={false}
        padding={0}
      >
        <div style={{ position: "relative" }}>
          <Profile isModal={true} onClose={closeProfile} />
        </div>
      </Modal>
    </>
  );
};

export default UserNavbar;