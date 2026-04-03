import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Badge,
  Group,
  SimpleGrid,
  Text,
  Button,
  Loader,
  Center,
  ActionIcon,
  Modal,
  Image,
  ScrollArea
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconMapPin, IconCalendar, IconEye, IconRefresh, IconSearch, IconFilter, IconDownload } from "@tabler/icons-react";
import "./Passes.css";

import { getCurrentUser } from "../../api/auth";

const Passes = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      const response = await fetch(`${BASE_URL}/api/pass/admin/all`, {
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only approved passes
        const approvedPasses = data.filter(p => p.status === "APPROVED");
        setPasses(approvedPasses);
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch passes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (pass) => {
    setSelectedPass(pass);
    open();
  };

  const handleExport = () => {
    if (!passes.length) {
      notifications.show({ title: "No Data", message: "Nothing to export", color: "yellow" });
      return;
    }
    const headers = ["ID", "User Name", "Email", "Pass Type", "Status", "Valid From", "Valid Until"];
    const rows = passes.map(p => [
      p.id,
      `"${p.userName}"`, // Quote to handle commas in names
      p.userEmail,
      p.passType,
      p.endDate ? "PAID" : "UNPAID",
      p.startDate || "",
      p.endDate || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `passes_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Center style={{ minHeight: "50vh" }}>
        <Loader size="lg" color="teal" />
      </Center>
    );
  }

  return (
    <div className="passes-container">
      <Container size="xl" mt="xl">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>Active Bus Passes</Title>
            <Text c="dimmed" size="sm">Manage all issued student passes</Text>
          </div>
          <Group>
            <Button leftSection={<IconDownload size={16} />} variant="default" onClick={handleExport}>Export Report</Button>
            <Button leftSection={<IconRefresh size={16} />} onClick={fetchPasses} color="teal">Refresh</Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {passes.map((pass) => (
            <Card key={pass.id} padding="lg" radius="md" className="pass-card glass">
              <Group justify="space-between" mb="xs">
                <Badge color="violet" size="lg" variant="light" tt="uppercase">
                  {pass.passType} Pass
                </Badge>
                {pass.endDate ? (
                  <Badge color="teal" variant="filled">PAID</Badge>
                ) : (
                  <Badge color="yellow" variant="outline">Payment Pending</Badge>
                )}
              </Group>

              <Group gap="md" mt="md">
                <div className="pass-avatar">
                  {pass.userName?.charAt(0)}
                </div>
                <div>
                  <Text fw={600} size="lg">{pass.userName}</Text>
                  <Text size="xs" c="dimmed">ID: #{pass.id}</Text>
                </div>
              </Group>

              <div className="pass-details">
                <Group gap="xs" mt="md">
                  <IconCalendar size={16} className="detail-icon" />
                  <Text size="sm" c="dimmed">Valid until: {pass.endDate || "N/A"}</Text>
                </Group>
              </div>

              <Button
                variant="light"
                color="blue"
                fullWidth
                mt="lg"
                radius="md"
                leftSection={<IconEye size={16} />}
                onClick={() => handleViewDetails(pass)}
              >
                View Details
              </Button>
            </Card>
          ))}

          {passes.length === 0 && (
            <Center style={{ gridColumn: '1 / -1', minHeight: '200px' }}>
              <Text c="dimmed">No active passes found.</Text>
            </Center>
          )}
        </SimpleGrid>
      </Container>

      <Modal
        opened={opened}
        onClose={close}
        title="Pass Details"
        centered
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        {selectedPass && (
          <div className="pass-modal-content">
            <Group align="flex-start">
              <div className="modal-avatar">
                {selectedPass.userName?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <Title order={3}>{selectedPass.userName}</Title>
                <Text c="dimmed" size="sm">{selectedPass.userEmail}</Text>
                <Badge color="violet" mt="xs">{selectedPass.passType}</Badge>
              </div>
            </Group>

            <SimpleGrid cols={2} mt="xl" spacing="lg">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pass Information</Text>
                <Text fw={600} mt={4}>Universal Pass</Text>
                <Text size="sm" c="dimmed">All Routes Access</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Validity</Text>
                <Text fw={600} mt={4}>{selectedPass.startDate || "Start"} - {selectedPass.endDate || "End"}</Text>
                <Text size="sm" c="dimmed">Academic Year 2026</Text>
              </div>
            </SimpleGrid>


            {/* Document preview section could go here */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Passes;