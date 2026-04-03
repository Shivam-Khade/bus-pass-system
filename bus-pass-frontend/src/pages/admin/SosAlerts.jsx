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
    Modal,
    Pagination
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconMapPin, IconCheck, IconRefresh, IconSearch } from "@tabler/icons-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./SosAlerts.css";

import { getCurrentUser } from "../../api/auth";

// Fix Leaflet marker icon issue
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const SosAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapOpened, setMapOpened] = useState(false);
    const currentUser = getCurrentUser();

    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchAlerts();
        // Poll for new alerts every 30 seconds
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
            const response = await fetch(`${BASE_URL}/api/sos/all`, {
                headers: {
                    "Authorization": `Bearer ${currentUser?.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Sort by createdAt desc (newest first)
                const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAlerts(sortedData);
            }
        } catch (error) {
            console.error("Error fetching alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    const resolveAlert = async (id) => {
        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
            const response = await fetch(`${BASE_URL}/api/sos/resolve/${id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${currentUser?.token}`
                }
            });

            if (response.ok) {
                notifications.show({
                    color: "green",
                    title: "Resolved",
                    message: "Alert marked as resolved",
                });
                fetchAlerts();
            }
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Error",
                message: "Failed to resolve alert",
            });
        }
    };

    const openMap = (lat, lng) => {
        if (lat && lng) {
            setSelectedLocation({ lat, lng });
            setMapOpened(true);
        } else {
            notifications.show({
                color: "orange",
                title: "No Location",
                message: "Location data not available for this alert",
            });
        }
    };

    // Pagination logic
    const paginatedAlerts = alerts.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    if (loading) {
        return (
            <Center style={{ minHeight: "50vh" }}>
                <Loader size="lg" color="red" />
            </Center>
        );
    }

    return (
        <div className="sos-container">
            <Container size="xl" mt="xl">
                <Group justify="space-between" mb="lg">
                    <div>
                        <Title order={2} c="red.4">SOS Emergency Alerts</Title>
                        <Text c="dimmed" size="sm">Real-time emergency notifications from users</Text>
                    </div>
                    <Button
                        leftSection={<IconRefresh size={16} />}
                        onClick={fetchAlerts}
                        variant="light"
                        color="red"
                    >
                        Refresh
                    </Button>
                </Group>

                <Card shadow="sm" radius="lg" className="glass table-card" padding={0}>
                    <div className="table-toolbar" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Group>
                            <IconAlertTriangle color="var(--color-danger)" />
                            <Text fw={700} c="red.4">Active Alerts: {alerts.filter(a => a.status === 'ACTIVE').length}</Text>
                        </Group>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>User</Table.Th>
                                    <Table.Th>Time</Table.Th>
                                    <Table.Th>Location</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {paginatedAlerts.length > 0 ? (
                                    paginatedAlerts.map((alert) => (
                                        <Table.Tr key={alert.id} style={alert.status === 'ACTIVE' ? { background: 'rgba(239, 68, 68, 0.05)' } : {}}>
                                            <Table.Td>
                                                <Text fw={500}>{alert.userName || `User #${alert.userId}`}</Text>
                                                <Text size="xs" c="dimmed">{alert.userEmail}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{alert.createdAt ? new Date(alert.createdAt).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'N/A'}</Text>
                                                <Text size="xs" c="dimmed">{alert.message || "Emergency Alert"}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Button
                                                    leftSection={<IconMapPin size={14} />}
                                                    variant="subtle"
                                                    color="red"
                                                    size="xs"
                                                    onClick={() => openMap(alert.latitude, alert.longitude)}
                                                >
                                                    View Map
                                                </Button>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    color={alert.status === "ACTIVE" ? "red" : "green"}
                                                    variant={alert.status === "ACTIVE" ? "filled" : "outline"}
                                                >
                                                    {alert.status === "ACTIVE" ? "ACTIVE" : "RESOLVED"}
                                                </Badge>
                                                {alert.resolvedAt && (
                                                    <Text size="xs" c="dimmed" mt={4}>
                                                        {new Date(alert.resolvedAt).toLocaleString('en-US', {
                                                            month: 'short', day: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {alert.status === "ACTIVE" ? (
                                                    <Button
                                                        leftSection={<IconCheck size={14} />}
                                                        variant="light"
                                                        color="green"
                                                        size="xs"
                                                        onClick={() => resolveAlert(alert.id)}
                                                    >
                                                        Resolve
                                                    </Button>
                                                ) : (
                                                    <Text size="xs" c="dimmed">—</Text>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={5}>
                                            <Center p="xl">
                                                <Text c="dimmed">No alerts found.</Text>
                                            </Center>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-view">
                        {paginatedAlerts.length > 0 ? (
                            paginatedAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`mobile-sos-card ${alert.status === 'ACTIVE' ? 'active' : ''}`}
                                >
                                    <div className="mobile-card-header">
                                        <div>
                                            <Text fw={500}>{alert.userName || `User #${alert.userId}`}</Text>
                                            <Text size="xs" c="dimmed">{alert.userEmail}</Text>
                                        </div>
                                        <Badge
                                            color={alert.status === "ACTIVE" ? "red" : "green"}
                                            variant={alert.status === "ACTIVE" ? "filled" : "outline"}
                                        >
                                            {alert.status}
                                        </Badge>
                                    </div>

                                    <div className="mobile-card-body">
                                        <div className="mobile-card-row">
                                            <Text className="mobile-card-label">Time</Text>
                                            <Text size="sm">{alert.createdAt ? new Date(alert.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}</Text>
                                        </div>

                                        <div className="mobile-card-row">
                                            <Text className="mobile-card-label">Message</Text>
                                            <Text size="sm">{alert.message || "Emergency Alert"}</Text>
                                        </div>
                                    </div>

                                    <div className="mobile-card-actions">
                                        <Button
                                            leftSection={<IconMapPin size={16} />}
                                            variant="light"
                                            color="red"
                                            size="xs"
                                            onClick={() => openMap(alert.latitude, alert.longitude)}
                                        >
                                            View Location
                                        </Button>
                                        {alert.status === "ACTIVE" && (
                                            <Button
                                                leftSection={<IconCheck size={16} />}
                                                variant="light"
                                                color="green"
                                                size="xs"
                                                onClick={() => resolveAlert(alert.id)}
                                            >
                                                Resolve
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Center p="xl">
                                <Text c="dimmed">No alerts found.</Text>
                            </Center>
                        )}
                    </div>

                    {alerts.length > itemsPerPage && (
                        <Center p="md" style={{ borderTop: '1px solid var(--color-border)' }}>
                            <Pagination
                                total={Math.ceil(alerts.length / itemsPerPage)}
                                value={activePage}
                                onChange={setActivePage}
                                color="red"
                            />
                        </Center>
                    )}
                </Card>
            </Container>

            <Modal
                opened={mapOpened}
                onClose={() => setMapOpened(false)}
                title="Emergency Location"
                size="lg"
                centered
            >
                {selectedLocation && (
                    <div style={{ height: "400px", width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <MapContainer
                            center={[selectedLocation.lat, selectedLocation.lng]}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                                <Popup>
                                    User's specific location at time of alert.
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SosAlerts;
