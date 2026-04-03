import { Container, Text, Group } from "@mantine/core";
import { IconBus } from "@tabler/icons-react";
import "./AdminFooter.css";

const AdminFooter = () => {
  return (
    <footer className="admin-footer glass">
      <Container size="xl">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Group gap="xs">
            <IconBus size={20} color="var(--admin-primary-light)" />
            <Text size="sm" fw={600} c="dimmed">
              Bus Pass Admin
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            © 2026 Admin Panel. Secure & Encrypted.
          </Text>
        </div>
      </Container>
    </footer>
  );
};

export default AdminFooter;