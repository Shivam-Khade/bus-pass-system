import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  SimpleGrid,
  Loader,
  Center,
  RingProgress,
  ThemeIcon,
  rem
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconClock,
  IconX,
  IconChartBar,
  IconUsers,
  IconTicket,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons-react";
import "./Dashboard.css";
import { getCurrentUser } from "../../api/auth";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      const response = await fetch(`${BASE_URL}/api/pass/admin/all`, {
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        calculateStats(data);
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter((app) => app.status === "PENDING").length,
      approved: data.filter((app) => app.status === "APPROVED").length,
      rejected: data.filter((app) => app.status === "REJECTED").length,
    });
  };

  if (loading) {
    return (
      <Center style={{ minHeight: "60vh" }}>
        <Loader size="lg" color="teal" />
      </Center>
    );
  }

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div className="admin-dashboard-container">
      <Container size="xl" className="admin-dashboard-content">
        <div className="dashboard-header">
          <Group justify="space-between" align="flex-start" mb="xl">
            <div>
              <Title order={2} mb={4}>
                Dashboard Overview
              </Title>
              <Text c="dimmed" size="sm">
                Welcome back, {currentUser?.name}. Here's what's happening today.
              </Text>
            </div>
            <Text size="sm" c="dimmed" className="current-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </Group>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
          <Card className="stat-card glass-strong" padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="md">
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.5px' }}>Total Applications</Text>
              <ThemeIcon variant="light" color="blue" radius="md" size="lg">
                <IconChartBar size={20} />
              </ThemeIcon>
            </Group>
            <Text className="stat-value" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{stats.total}</Text>
            <Text size="xs" c="dimmed" mt="sm">All submissions received</Text>
          </Card>

          <Card className="stat-card glass-strong" padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="md">
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.5px' }}>Pending Review</Text>
              <ThemeIcon variant="light" color="yellow" radius="md" size="lg">
                <IconClock size={20} />
              </ThemeIcon>
            </Group>
            <Text className="stat-value" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: 'var(--mantine-color-yellow-6)' }}>{stats.pending}</Text>
            <Text size="xs" c="dimmed" mt="sm">Awaiting admin action</Text>
          </Card>

          <Card className="stat-card glass-strong" padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="md">
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.5px' }}>Approved</Text>
              <ThemeIcon variant="light" color="teal" radius="md" size="lg">
                <IconCheck size={20} />
              </ThemeIcon>
            </Group>
            <Text className="stat-value" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: 'var(--mantine-color-teal-6)' }}>{stats.approved}</Text>
            <Text size="xs" c="dimmed" mt="sm">Successfully approved</Text>
          </Card>

          <Card className="stat-card glass-strong" padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="md">
              <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.5px' }}>Rejected</Text>
              <ThemeIcon variant="light" color="red" radius="md" size="lg">
                <IconX size={20} />
              </ThemeIcon>
            </Group>
            <Text className="stat-value" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: 'var(--mantine-color-red-6)' }}>{stats.rejected}</Text>
            <Text size="xs" c="dimmed" mt="sm">Declined applications</Text>
          </Card>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="xl">
          <Card className="glass content-card" radius="lg" padding="xl" pb="xl">
            <Title order={3} mb="lg">Application Status Distribution</Title>
            <Center>
              <RingProgress
                size={240}
                thickness={20}
                roundCaps
                sections={[
                  { value: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0, color: 'teal', tooltip: `Approved: ${stats.approved}` },
                  { value: stats.total > 0 ? (stats.pending / stats.total) * 100 : 0, color: 'yellow', tooltip: `Pending: ${stats.pending}` },
                  { value: stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0, color: 'red', tooltip: `Rejected: ${stats.rejected}` }
                ]}
                label={
                  <Center>
                    <div style={{ textAlign: 'center' }}>
                      <Text fz={36} fw={700} lh={1}>
                        {stats.total}
                      </Text>
                      <Text size="xs" c="dimmed" mt={8} tt="uppercase" fw={700}>
                        Total
                      </Text>
                    </div>
                  </Center>
                }
              />
            </Center>
            <SimpleGrid cols={3} mt="xl" spacing="xs">
              <div style={{ textAlign: 'center' }}>
                <Group justify="center" gap={4} mb={4}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mantine-color-teal-6)' }}></div>
                  <Text size="xs" c="dimmed" fw={600}>Approved</Text>
                </Group>
                <Text size="lg" fw={700} c="teal">{stats.approved}</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Group justify="center" gap={4} mb={4}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mantine-color-yellow-6)' }}></div>
                  <Text size="xs" c="dimmed" fw={600}>Pending</Text>
                </Group>
                <Text size="lg" fw={700} c="yellow">{stats.pending}</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Group justify="center" gap={4} mb={4}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mantine-color-red-6)' }}></div>
                  <Text size="xs" c="dimmed" fw={600}>Rejected</Text>
                </Group>
                <Text size="lg" fw={700} c="red">{stats.rejected}</Text>
              </div>
            </SimpleGrid>
          </Card>

          <Card className="glass content-card" radius="lg" padding="xl" pb="xl">
            <Title order={3} mb="lg">Approval Rate</Title>
            <Center>
              <RingProgress
                size={240}
                thickness={20}
                roundCaps
                sections={[{ value: approvalRate, color: 'teal' }]}
                label={
                  <Center>
                    <div style={{ textAlign: 'center' }}>
                      <Text fz={48} fw={700} lh={1} c="teal">
                        {approvalRate}%
                      </Text>
                      <Text size="xs" c="dimmed" mt={8} tt="uppercase" fw={700}>
                        Success Rate
                      </Text>
                    </div>
                  </Center>
                }
              />
            </Center>
            <Text size="sm" c="dimmed" ta="center" mt="xl">
              Based on {stats.total} total applications processed
            </Text>
            {stats.total > 0 && (
              <Group justify="center" gap="xl" mt="lg">
                <div style={{ textAlign: 'center' }}>
                  <Text size="xs" c="dimmed" mb={4}>Approved</Text>
                  <Text size="md" fw={600}>{stats.approved}</Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text size="xs" c="dimmed" mb={4}>Total</Text>
                  <Text size="md" fw={600}>{stats.total}</Text>
                </div>
              </Group>
            )}
          </Card>
        </SimpleGrid>
      </Container>
    </div>
  );
};

export default AdminDashboard;
