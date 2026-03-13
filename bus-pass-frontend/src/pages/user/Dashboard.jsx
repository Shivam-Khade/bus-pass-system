import { Container, Title, Text, SimpleGrid, Card, Group } from "@mantine/core";
import { IconTicket, IconClock, IconShieldCheck, IconArrowRight, IconBus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import img1 from '../../assets/img1.avif';
import img2 from '../../assets/img2.avif';

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section glass-strong">
        <div className="hero-content">
          <div className="hero-badge">
            <IconBus size={16} /> Beta v2.0 Live
          </div>
          <Title order={1} className="hero-title">
            Digital <span className="gradient-text">Bus Pass</span> Management
          </Title>
          <Text size="xl" className="hero-subtitle">
            Experience the next generation of campus transit. Secure, fast, and completely paperless.
          </Text>
          <button className="hero-cta" onClick={() => navigate('/user/apply')}>
            Apply Now <IconArrowRight size={18} />
          </button>
        </div>
        <div className="hero-visual">
          <div className="visual-circle-1"></div>
          <div className="visual-circle-2"></div>
          <IconTicket size={180} className="visual-icon" stroke={0.5} />
        </div>
      </div>

      {/* Features Section */}
      <Container size="xl" mt={60}>
        <div className="section-header">
          <Text className="section-eyebrow">FEATURES</Text>
          <Title order={2} className="section-title">Why Choose Digital?</Title>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="xl">
          <Card padding="xl" radius="lg" className="feature-card glass">
            <div className="icon-wrapper">
              <IconTicket size={32} stroke={1.5} />
            </div>
            <Title order={3} mt="md" mb="xs">
              Easy Application
            </Title>
            <Text size="sm" c="dimmed">
              Skip the queues. Apply for your bus pass in under 2 minutes with our streamlined process.
            </Text>
          </Card>

          <Card padding="xl" radius="lg" className="feature-card glass">
            <div className="icon-wrapper color-2">
              <IconClock size={32} stroke={1.5} />
            </div>
            <Title order={3} mt="md" mb="xs">
              Instant Status
            </Title>
            <Text size="sm" c="dimmed">
              Real-time tracking of your application. Get notified instantly upon approval.
            </Text>
          </Card>

          <Card padding="xl" radius="lg" className="feature-card glass">
            <div className="icon-wrapper color-3">
              <IconShieldCheck size={32} stroke={1.5} />
            </div>
            <Title order={3} mt="md" mb="xs">
              Secure Verification
            </Title>
            <Text size="sm" c="dimmed">
              QR-based digital passes ensure security and easy verification on transit.
            </Text>
          </Card>
        </SimpleGrid>
      </Container>

      {/* How It Works Section */}
      <Container size="xl" mt={100} mb={60}>
        <div className="section-header">
          <Text className="section-eyebrow">WORKFLOW</Text>
          <Title order={2} className="section-title">How It Works</Title>
        </div>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50} mt="xl">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-content">
              <Title order={3} mb="sm">Fill Application</Title>
              <Text c="dimmed" mb="lg">
                Complete the simple form with your details and upload necessary documents.
              </Text>
              <div className="step-image-wrapper">
                <img src={img1} alt="Application Form" className="step-image" />
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-content">
              <Title order={3} mb="sm">Get Approved</Title>
              <Text c="dimmed" mb="lg">
                Admin reviews your request. Once approved, download your digital pass instantly.
              </Text>
              <div className="step-image-wrapper">
                <img src={img2} alt="Approval Process" className="step-image" />
              </div>
            </div>
          </div>
        </SimpleGrid>
      </Container>
    </div>
  );
};

export default UserDashboard;