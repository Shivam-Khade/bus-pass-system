import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Badge,
  Group,
  Table,
  Button,
  Loader,
  Center,
  Text,
  ActionIcon,
  Tooltip,
  TextInput,
  Select,
  Modal,
  Avatar,
  Menu,
  Dialog,
  Image
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconSearch,
  IconFilter,
  IconDownload,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconId,
  IconEye
} from "@tabler/icons-react";
import "./Users.css";

import { getCurrentUser } from "../../api/auth";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [aadhaarModal, setAadhaarModal] = useState({ opened: false, user: null });
  const currentUser = getCurrentUser();
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'USER',
      phone: ''
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        notifications.show({
          color: "green",
          title: "Success",
          message: "User deleted successfully",
        });
        fetchUsers();
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to delete user",
      });
    }
  };

  const handleAddUser = async (values) => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        notifications.show({ title: "Success", message: "User added successfully", color: "green" });
        close();
        form.reset();
        fetchUsers();
      } else {
        const errorText = await response.text();
        // Extract message from Spring Boot error JSON if present
        let msg = errorText;
        try {
          const json = JSON.parse(errorText);
          msg = json.message || json.error || errorText;
        } catch (e) { /* ignore */ }
        throw new Error(msg || "Failed to add user");
      }
    } catch (error) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    }
  };

  const handleExport = () => {
    if (!users.length) return;
    const headers = ["ID", "Name", "Email", "Role", "Phone"];
    const rows = users.map(u => [u.id, `"${u.name}"`, u.email, u.role, u.phone || ""]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Center style={{ minHeight: "50vh" }}>
        <Loader size="lg" color="teal" />
      </Center>
    );
  }

  return (
    <div className="users-container">
      <Container size="xl" mt="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>User Management</Title>
            <Text c="dimmed" size="sm">Administer system users and permissions</Text>
          </div>
          <Group>
            <Button leftSection={<IconDownload size={16} />} variant="default" onClick={handleExport}>Export</Button>
            <Button leftSection={<IconUser size={16} />} variant="filled" color="teal" onClick={open}>Add User</Button>
          </Group>
        </Group>

        <Card shadow="sm" radius="lg" className="glass table-card" padding={0}>
          <div className="table-toolbar">
            <TextInput
              placeholder="Search users..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, maxWidth: 400 }}
            />
            <Tooltip label="Filter list">
              <ActionIcon variant="light" color="gray" size="lg">
                <IconFilter size={18} />
              </ActionIcon>
            </Tooltip>
          </div>

          {/* Desktop Table View */}
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Aadhaar</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <Group gap="sm" justify="flex-start">
                          <Avatar
                            color="blue"
                            radius="xl"
                            src={user.photoUrl ? (user.photoUrl.startsWith("http") ? user.photoUrl : `${BASE_URL}/files/${user.photoUrl}`) : null}
                          >
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Text size="sm" fw={500}>{user.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">{user.email}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={user.role === "ADMIN" ? "red" : "blue"}
                          variant="light"
                        >
                          {user.role}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {user.adharUrl || user.aadhaarNumber ? (
                          <Button
                            leftSection={<IconEye size={14} />}
                            variant="light"
                            color="indigo"
                            size="xs"
                            onClick={() => setAadhaarModal({ opened: true, user })}
                          >
                            View
                          </Button>
                        ) : (
                          <Text size="xs" c="dimmed">Not provided</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" variant="dot">Active</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Group gap="xs" justify="center">
                          <Tooltip label="Delete">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => deleteUser(user.id)}
                              disabled={user.role === "ADMIN"} // Prevent deleting admins for safety
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Center p="xl">
                        <Text c="dimmed">No users found.</Text>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-view">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="mobile-user-card">
                  <div className="mobile-card-header">
                    <Group gap="sm">
                      <Avatar color="blue" radius="xl">{user.name?.charAt(0)}</Avatar>
                      <div>
                        <Text size="sm" fw={500}>{user.name}</Text>
                        <Text size="xs" c="dimmed">{user.email}</Text>
                      </div>
                    </Group>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <Text className="mobile-card-label">Role</Text>
                      <Badge
                        color={user.role === "ADMIN" ? "red" : "blue"}
                        variant="light"
                      >
                        {user.role}
                      </Badge>
                    </div>

                    <div className="mobile-card-row">
                      <Text className="mobile-card-label">Status</Text>
                      <Badge color="green" variant="dot">Active</Badge>
                    </div>
                  </div>

                  <div className="mobile-card-actions" style={{ justifyContent: 'center' }}>
                    <Button
                      leftSection={<IconTrash size={16} />}
                      variant="light"
                      color="red"
                      size="xs"
                      onClick={() => deleteUser(user.id)}
                      disabled={user.role === "ADMIN"}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <Center p="xl">
                <Text c="dimmed">No users found.</Text>
              </Center>
            )}
          </div>
        </Card>
      </Container>

      <Modal opened={opened} onClose={close} title="Add New User" centered>
        <form onSubmit={form.onSubmit(handleAddUser)}>
          <TextInput label="Name" placeholder="Full Name" {...form.getInputProps('name')} mb="sm" />
          <TextInput label="Email" placeholder="user@example.com" {...form.getInputProps('email')} mb="sm" />
          <TextInput label="Phone" placeholder="1234567890" {...form.getInputProps('phone')} mb="sm" />
          <TextInput label="Password" type="password" placeholder="******" {...form.getInputProps('password')} mb="sm" />
          <Select
            label="Role"
            placeholder="Select Role"
            data={['USER', 'ADMIN', 'STUDENT']}
            {...form.getInputProps('role')}
            mb="lg"
          />
          <Button fullWidth type="submit" color="teal">Create User</Button>
        </form>
      </Modal>

      {/* Aadhaar Viewer Modal */}
      <Modal
        opened={aadhaarModal.opened}
        onClose={() => setAadhaarModal({ opened: false, user: null })}
        title={
          <Group gap="xs">
            <IconId size={20} color="#6366f1" />
            <Text fw={600}>Aadhaar Details — {aadhaarModal.user?.name}</Text>
          </Group>
        }
        centered
        size="md"
      >
        {aadhaarModal.user && (
          <div>
            {aadhaarModal.user.aadhaarNumber && (
              <Card withBorder padding="sm" radius="md" mb="md" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Aadhaar Number</Text>
                  <Text fw={600} size="lg" style={{ letterSpacing: '2px' }}>
                    {aadhaarModal.user.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                  </Text>
                </Group>
              </Card>
            )}
            {aadhaarModal.user.adharUrl ? (
              <Image
                src={aadhaarModal.user.adharUrl.startsWith("http") ? aadhaarModal.user.adharUrl : `${BASE_URL}/files/${aadhaarModal.user.adharUrl}`}
                radius="md"
                fit="contain"
                style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                alt="Aadhaar Card"
              />
            ) : (
              <Center p="xl">
                <Text c="dimmed" size="sm">Aadhaar image not uploaded</Text>
              </Center>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;