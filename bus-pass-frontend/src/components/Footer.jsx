import { Container, Text, Group, TextInput, Button, SimpleGrid, ThemeIcon, ActionIcon } from "@mantine/core";
import { IconBus, IconBrandTwitter, IconBrandInstagram, IconBrandLinkedin, IconBrandYoutube, IconMail, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email) {
      notifications.show({
        title: 'Error',
        message: 'Please enter your email address',
        color: 'red',
        position: 'bottom-center'
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      notifications.show({
        title: 'Subscribed!',
        message: 'You have successfully subscribed to our newsletter.',
        color: 'green',
        icon: <IconCheck size={16} />,
        position: 'bottom-center',
        autoClose: 3000,
        radius: "md",
        styles: (theme) => ({
          root: {
            backgroundColor: 'var(--color-bg-card-solid)',
            borderColor: 'var(--color-border)',
            '&::before': { backgroundColor: 'var(--user-primary)' },
          },
          title: { color: 'white' },
          description: { color: 'var(--text-secondary)' },
        }),
      });
      setEmail("");
    }, 500);
  };

  const footerLinks = [
    {
      title: "Pass Services",
      links: [
        { label: "New Application", link: "#" },
        { label: "Renew Pass", link: "#" },
      ]
    },
    {
      title: "Transit Info",
      links: [
        { label: "Check Status", link: "#" },
        { label: "Route Maps", link: "#" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", link: "#" },
      ]
    }
  ];

  return (
    <footer className="footer-wrapper">
      <Container size="xl" className="footer-container">

        {/* Top Section: Newsletter Only */}
        <div className="footer-top">
          <Group justify="flex-end" align="flex-end" className="footer-header" style={{ width: '100%' }}>
            <div className="newsletter-box">
              <Text size="xs" fw={700} c="dimmed" mb={8} tt="uppercase" style={{ letterSpacing: '1px' }}>
                Subscribe to Updates
              </Text>
              <Group gap="xs">
                <TextInput
                  placeholder="admin@buspass.com"
                  size="sm"
                  classNames={{ input: 'footer-input' }}
                  style={{ width: 240 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <Button size="sm" variant="filled" color="violet" onClick={handleSubscribe}>Subscribe</Button>
              </Group>
            </div>
          </Group>
        </div>

        {/* Middle Section: Links & Visual */}
        <div className="footer-main">
          <div className="footer-grid">
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xl" verticalSpacing="xl">
              {footerLinks.map((group) => (
                <div key={group.title} className="footer-column">
                  <Text className="footer-col-title">{group.title}</Text>
                  <div className="footer-links-group">
                    {group.links.map((link) => (
                      <a key={link.label} href={link.link} className="footer-link-item">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </SimpleGrid>

            <div className="footer-visual">
              <div className="visual-glow"></div>
              <IconBus size={120} className="visual-icon-3d" stroke={0.8} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <Text size="xs" c="dimmed">© 2026 Bus Pass System inc.</Text>
            <a href="#" className="legal-link">Privacy</a>
            <a href="#" className="legal-link">Terms</a>
            <a href="#" className="legal-link">Sitemap</a>
          </div>

          <Group gap="sm" className="footer-socials">
            <ActionIcon size="sm" variant="subtle" color="gray"><IconBrandTwitter size={16} /></ActionIcon>
            <ActionIcon size="sm" variant="subtle" color="gray"><IconBrandInstagram size={16} /></ActionIcon>
            <ActionIcon size="sm" variant="subtle" color="gray"><IconBrandLinkedin size={16} /></ActionIcon>
            <ActionIcon size="sm" variant="subtle" color="gray"><IconBrandYoutube size={16} /></ActionIcon>
          </Group>
        </div>

      </Container>
    </footer>
  );
};

export default Footer;
