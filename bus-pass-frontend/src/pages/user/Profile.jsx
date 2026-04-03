import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Badge,
  Loader,
  Center,
  Card,
  Group,
  Avatar,
  Stack,
  ActionIcon,
  Tooltip,
  Divider,
  Button
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUser, IconMail, IconPhone, IconEdit, IconLogout, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import "./Profile.css";

import { getCurrentUser, logout } from "../../api/auth";

const Profile = ({ isModal = false, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";

  useEffect(() => {
    if (currentUser?.email) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          ...data,
          phone: data.phone || "Not provided"
        });
        
        // Sync local storage so navbar and other components stay updated
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...stored, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to local storage user
      setUser({
        ...currentUser,
        phone: currentUser.phone || "Not available"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <Center style={{ minHeight: isModal ? "300px" : "60vh" }}>
        <Loader size="lg" color="violet" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center style={{ minHeight: isModal ? "300px" : "60vh" }}>
        <Text c="dimmed">User details not available</Text>
      </Center>
    );
  }

  const ProfileContent = () => (
    <Card
      padding={0}
      radius="lg"
      className={`glass profile-card ${isModal ? 'modal-mode' : ''}`}
      style={isModal ? { paddingBottom: '2rem' } : undefined}
    >
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-avatar-wrapper">
          <Avatar
            src={user.photoUrl ? `${BASE_URL}/files/${user.photoUrl}` : null}
            alt={user.name}
            size={isModal ? 100 : 120}
            radius={120}
            className="profile-avatar"
            color="violet"
            onError={(e) => {
              console.error("Avatar failed to load", e);
              // Fallback to initials happens automatically if src fails
            }}
          >
            {user.name?.charAt(0)}
          </Avatar>
        </div>
      </div>

      <Stack align="center" mt={isModal ? "xs" : "sm"} spacing={isModal ? "xs" : "sm"} px="md">
        <Title order={isModal ? 4 : 3} mt={isModal ? 10 : 0}>{user.name}</Title>
        <Text c="dimmed" size="sm" ta="center">{user.role === "STUDENT" ? "Student Account" : "User Account"}</Text>
        <Badge
          variant="gradient"
          gradient={{ from: 'violet', to: 'indigo' }}
          size={isModal ? "md" : "lg"}
          mt={4}
        >
          Active Member
        </Badge>
      </Stack>

      <Divider my={isModal ? "md" : "xl"} label="Contact Information" labelPosition="center" color="rgba(255,255,255,0.1)" />

      <div className="profile-details" style={{ padding: isModal ? '0 1.5rem' : '0 2rem' }}>
        <Group mb="sm">
          <IconMail size={18} className="detail-icon" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Email</Text>
            <Text size="sm" truncate>{user.email}</Text>
          </div>
        </Group>

        <Group mb="sm">
          <IconPhone size={18} className="detail-icon" />
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Phone</Text>
            <Text size="sm">{user.phone}</Text>
          </div>
        </Group>
      </div>

      <Group justify="center" mt={isModal ? "lg" : "xl"} gap="sm" px="md">
        <Button
          variant="light"
          color="red"
          size="sm"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Group>
    </Card>
  );

  if (isModal) {
    return (
      <div className="profile-modal-wrapper">
        <ProfileContent />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Container size="sm" mt="xl">
        <Title order={2} mb="xl" className="profile-title">My Profile</Title>
        <ProfileContent />
      </Container>
    </div>
  );
};

export default Profile;