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
  Avatar,
  Menu,
  rem
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconEye,
  IconCheck,
  IconX,
  IconRefresh,
  IconSearch,
  IconFilter,
  IconDownload,
  IconDotsVertical,
  IconFileText
} from "@tabler/icons-react";
import "./Applications.css";

import { getCurrentUser } from "../../api/auth";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      const response = await fetch(`${BASE_URL}/api/pass/admin/all`, {
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch applications",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      const response = await fetch(`${BASE_URL}/api/pass/admin/update-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        notifications.show({
          color: "green",
          title: "Success",
          message: `Application ${newStatus.toLowerCase()} successfully`,
        });
        fetchApplications();
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to update status",
      });
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      const response = await fetch(`${BASE_URL}/api/pass/admin/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        notifications.show({
          color: "green",
          title: "Success",
          message: "Application deleted successfully",
        });
        fetchApplications();
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to delete application",
      });
    }
  };

  const handleExport = () => {
    if (!applications.length) return;
    const headers = ["ID", "Applicant", "Email", "Pass Type", "Status"];
    const rows = applications.map(app => [app.id, `"${app.userName || ''}"`, app.userEmail, app.passType, app.status]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `applications_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewDocument = (url) => {
    if (!url) {
      notifications.show({
        title: "Error",
        message: "Document not available",
        color: "red",
      });
      return;
    }
    const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}/files/${url}`;
    window.open(fullUrl, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "teal";
      case "PENDING": return "yellow";
      case "REJECTED": return "red";
      default: return "gray";
    }
  };

  const filteredApps = applications.filter(app =>
    app.userName?.toLowerCase().includes(search.toLowerCase()) ||
    app.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    String(app.id).includes(search)
  );

  if (loading) {
    return (
      <Center style={{ minHeight: "50vh" }}>
        <Loader size="lg" color="teal" />
      </Center>
    );
  }

  return (
    <div className="applications-container">
      <Container size="xl" mt="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>Manage Applications</Title>
            <Text c="dimmed" size="sm">Review and process student bus pass requests</Text>
          </div>
          <Group>
            <Button leftSection={<IconDownload size={16} />} variant="default" onClick={handleExport}>Export</Button>
            <Button leftSection={<IconRefresh size={16} />} onClick={fetchApplications} color="teal">Refresh</Button>
          </Group>
        </Group>

        <Card shadow="sm" radius="lg" className="glass table-card" padding={0}>
          <div className="table-toolbar">
            <TextInput
              placeholder="Search by name, email or ID..."
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
                  <Table.Th>Applicant</Table.Th>
                  <Table.Th>Pass Details</Table.Th>
                  <Table.Th>Documents</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <Table.Tr key={app.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar color="teal" radius="xl">{app.userName?.charAt(0)}</Avatar>
                          <div>
                            <Text size="sm" fw={500}>{app.userName || `User #${app.userId}`}</Text>
                            <Text size="xs" c="dimmed">{app.userEmail}</Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue" tt="capitalize">
                          {app.passType} Pass
                        </Badge>
                        <Text size="xs" c="dimmed" mt={4}>ID: #{app.id}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6}>
                          <Tooltip label="Adhar Card">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="blue"
                              onClick={() => viewDocument(app.adharUrl)}
                              disabled={!app.adharUrl}
                            >
                              <IconFileText size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Bonafide Certificate">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="cyan"
                              onClick={() => viewDocument(app.bonafideUrl)}
                              disabled={!app.bonafideUrl}
                            >
                              <IconFileText size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Photo">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="indigo"
                              onClick={() => viewDocument(app.photoUrl)}
                              disabled={!app.photoUrl}
                            >
                              <IconEye size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(app.status)} variant="dot" size="lg">
                          {app.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Group gap="xs" justify="flex-end">
                          {app.status === "PENDING" ? (
                            <>
                              <Tooltip label="Approve">
                                <ActionIcon
                                  color="teal"
                                  variant="filled"
                                  size="md"
                                  radius="md"
                                  onClick={() => updateStatus(app.id, "APPROVED")}
                                >
                                  <IconCheck size={18} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Reject">
                                <ActionIcon
                                  color="red"
                                  variant="filled"
                                  size="md"
                                  radius="md"
                                  onClick={() => updateStatus(app.id, "REJECTED")}
                                >
                                  <IconX size={18} />
                                </ActionIcon>
                              </Tooltip>
                            </>
                          ) : (
                            <Menu position="bottom-end" shadow="md">
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                  <IconDotsVertical size={18} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Label>Manage</Menu.Label>
                                <Menu.Item
                                  leftSection={<IconRefresh size={14} />}
                                  onClick={() => updateStatus(app.id, "PENDING")}
                                >
                                  Reset Status
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconX size={14} />} onClick={() => deleteApplication(app.id)}>
                                  Delete Application
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Center p="xl">
                        <Text c="dimmed">No applications found matching your search</Text>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-view">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <div key={app.id} className="mobile-application-card">
                  <div className="mobile-card-header">
                    <Group gap="sm">
                      <Avatar color="teal" radius="xl">{app.userName?.charAt(0)}</Avatar>
                      <div>
                        <Text size="sm" fw={500}>{app.userName || `User #${app.userId}`}</Text>
                        <Text size="xs" c="dimmed">{app.userEmail}</Text>
                      </div>
                    </Group>
                    <Badge color={getStatusColor(app.status)} variant="dot" size="lg">
                      {app.status}
                    </Badge>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <Text className="mobile-card-label">Pass Type</Text>
                      <Badge variant="light" color="blue" tt="capitalize">
                        {app.passType} Pass
                      </Badge>
                    </div>

                    <div className="mobile-card-row">
                      <Text className="mobile-card-label">ID</Text>
                      <Text size="sm">#{app.id}</Text>
                    </div>

                    <div className="mobile-card-row">
                      <Text className="mobile-card-label">Documents</Text>
                      <Group gap={6}>
                        <Tooltip label="Adhar Card">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="blue"
                            onClick={() => viewDocument(app.adharUrl)}
                            disabled={!app.adharUrl}
                          >
                            <IconFileText size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Bonafide Certificate">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="cyan"
                            onClick={() => viewDocument(app.bonafideUrl)}
                            disabled={!app.bonafideUrl}
                          >
                            <IconFileText size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Photo">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="indigo"
                            onClick={() => viewDocument(app.photoUrl)}
                            disabled={!app.photoUrl}
                          >
                            <IconEye size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    {app.status === "PENDING" ? (
                      <>
                        <Button
                          leftSection={<IconCheck size={16} />}
                          color="teal"
                          variant="filled"
                          size="xs"
                          onClick={() => updateStatus(app.id, "APPROVED")}
                        >
                          Approve
                        </Button>
                        <Button
                          leftSection={<IconX size={16} />}
                          color="red"
                          variant="filled"
                          size="xs"
                          onClick={() => updateStatus(app.id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button
                        leftSection={<IconRefresh size={16} />}
                        variant="light"
                        size="xs"
                        onClick={() => updateStatus(app.id, "PENDING")}
                      >
                        Reset Status
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Center p="xl">
                <Text c="dimmed">No applications found matching your search</Text>
              </Center>
            )}
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Applications;