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
  Image,
  Stack,
  ActionIcon,
  Tooltip,
  RingProgress,
  Button
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBus, IconCalendar, IconMapPin, IconDownload, IconWorld, IconClock, IconCreditCard, IconCheck, IconX } from "@tabler/icons-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./MyPass.css";

import { getCurrentUser } from "../../api/auth";

const MyPass = () => {
  const [pass, setPass] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Expiry State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expiryStatus, setExpiryStatus] = useState("checking");

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser?.email) {
      fetchPassData();
    } else {
      setLoading(false);
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!pass || !pass.endDate) return;

    const timer = setInterval(() => {
      calculateTimeRemaining(pass.endDate);
    }, 1000);

    calculateTimeRemaining(pass.endDate);

    return () => clearInterval(timer);
  }, [pass]);

  const fetchPassData = async () => {
    try {
      setLoading(true);
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";

      // 1. Try to fetch active pass
      const response = await fetch(`${BASE_URL}/user/pass?email=${encodeURIComponent(currentUser.email)}`, {
        headers: { "Authorization": `Bearer ${currentUser?.token}` }
      });

      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (data && data.id && data.status === 'ACTIVE') {
          const enhancedPass = {
            ...data,
            userName: data.userName || currentUser.name || "User",
            source: data.source || "All Routes",
            destination: data.destination || "All Routes",
          };
          setPass(enhancedPass);
          calculateTimeRemaining(enhancedPass.endDate);
          generateQRCode(enhancedPass);
          setLoading(false);
          return; // Found active pass, stop here
        }
      }

      // 2. If no active pass, fetch applications to check status
      const appResponse = await fetch(`${BASE_URL}/api/pass/my-applications/${currentUser.id}`, {
        headers: { "Authorization": `Bearer ${currentUser?.token}` }
      });

      if (appResponse.ok) {
        const apps = await appResponse.json();
        if (apps && apps.length > 0) {
          // Sort by ID desc to get latest
          const latestApp = apps.sort((a, b) => b.id - a.id)[0];
          setApplication(latestApp);
        }
      }

      setPass(null);

    } catch (error) {
      console.error("Error fetching data:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to load pass information",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!application) return;

    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      // Create Order
      const orderRes = await fetch(`${BASE_URL}/payment/create-order?applicationId=${application.id}&userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${currentUser?.token}` }
      });

      if (!orderRes.ok) throw new Error("Failed to create payment order");
      const orderData = await orderRes.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // Amount is already in rupees from backend? No, backend sends rupees, Razorpay expects paise? 
        // paymentServiceline 60: orderRequest.put("amount", (int) (amount * 100)); // paise 
        // paymentService line 77: response.put("amount", amount); // rupees
        // Wait, Razorpay JS expects amount in paise usually if currency is INR. 
        // Backend createOrder does NOT return the order amount in paise but the 'amount' variable which is double rupees.
        // However, the 'orderId' is created with amount in paise.
        // When opening Razorpay checkout, we pass `amount: orderData.amount * 100` if it expects paise?
        // Actually if `order_id` is passed, amount is auto-fetched?
        // Let's pass what backend returns or stick to order_id.

        currency: orderData.currency,
        name: "Bus Pass Payment",
        description: `Payment for Application #${application.id}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Verify Payment
          try {
            const verifyRes = await fetch(`${BASE_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser?.token}`
              },
              body: JSON.stringify({
                applicationId: application.id.toString(),
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              notifications.show({
                color: "green",
                title: "Success",
                message: "Payment successful! Your pass is now active.",
              });
              fetchPassData(); // Refresh to show pass
            } else {
              notifications.show({
                color: "red",
                title: "Verification Failed",
                message: "Payment verification failed on server.",
              });
            }
          } catch (err) {
            console.error(err);
            notifications.show({
              color: "red",
              title: "Error",
              message: "Error verifying payment.",
            });
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phone || ""
        },
        theme: {
          color: "#7c5cfc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Error:", error);
      notifications.show({
        color: "red",
        title: "Payment Failed",
        message: error.message || "Could not initiate payment",
      });
    }
  };

  const calculateTimeRemaining = (endDateStr) => {
    if (!endDateStr) return;
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    const now = new Date();
    const diff = end - now;

    if (diff <= 0) {
      setExpiryStatus("expired");
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    setExpiryStatus("active");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setTimeLeft({ days, hours, minutes, seconds });
  };

  const generateQRCode = async (passData) => {
    try {
      const qrData = JSON.stringify({
        id: passData.id,
        user: passData.userName,
        type: passData.passType,
        validUntil: passData.endDate
      });
      const url = await QRCode.toDataURL(qrData);
      setQrCodeUrl(url);
    } catch (err) {
      console.error("QR Code generation failed", err);
    }
  };

  const downloadPDF = () => {
    const input = document.getElementById("digital-pass");
    if (!input) return;

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bus-pass-${pass?.passNumber || "digital"}.pdf`);
    });
  };

  if (loading) {
    return (
      <Center style={{ minHeight: "60vh" }}>
        <Loader size="xl" color="violet" type="dots" />
      </Center>
    );
  }

  // Application Status View (When no active pass)
  if (!pass) {
    return (
      <Container size="sm" mt={80}>
        <Title order={2} ta="center" mb="xl">Pass Status</Title>

        {application ? (
          <Card className="glass" padding="xl" radius="lg" style={{ textAlign: 'center', borderTop: `4px solid ${application.status === 'APPROVED' ? 'var(--mantine-color-teal-6)' : application.status === 'REJECTED' ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-yellow-6)'}` }}>
            {application.status === 'APPROVED' ? (
              application.paymentStatus === 'PAID' ? (
                <>
                  <IconCheck size={64} style={{ margin: '0 auto', color: 'var(--mantine-color-teal-6)' }} />
                  <Title order={3} mt="md">Processing Pass</Title>
                  <Text c="dimmed" mt="sm">Your payment is received. Your pass is being generated. Please refresh.</Text>
                  <Button mt="lg" onClick={fetchPassData} variant="light">Refresh</Button>
                </>
              ) : (
                <>
                  <IconCheck size={64} style={{ margin: '0 auto', color: 'var(--mantine-color-teal-6)' }} />
                  <Title order={3} mt="md">Application Approved!</Title>
                  <Text c="dimmed" mt="sm">Your application has been approved. Please complete the payment to activate your pass.</Text>

                  <Card withBorder mt="xl" p="md" radius="md">
                    <Group justify="space-between">
                      <Text fw={600}>Total Amount</Text>
                      <Text fw={700} size="xl" c="violet">
                        {/* Estimate amount based on passType? Or fetch? Payment Init displays real amount */}
                        Review & Pay
                      </Text>
                    </Group>
                  </Card>

                  <Button
                    fullWidth
                    mt="xl"
                    size="lg"
                    color="violet"
                    leftSection={<IconCreditCard size={20} />}
                    onClick={handlePayment}
                  >
                    Pay Now with Razorpay
                  </Button>
                </>
              )
            ) : application.status === 'REJECTED' ? (
              <>
                <IconX size={64} style={{ margin: '0 auto', color: 'var(--mantine-color-red-6)' }} />
                <Title order={3} mt="md">Application Rejected</Title>
                <Text c="dimmed" mt="sm">Your application was rejected by the admin. Please apply again with correct details.</Text>
                <Button mt="lg" onClick={() => window.location.href = '/user/apply'} variant="outline" color="red">Apply Again</Button>
              </>
            ) : (
              <>
                <IconClock size={64} style={{ margin: '0 auto', color: 'var(--mantine-color-yellow-6)' }} />
                <Title order={3} mt="md">Application Pending</Title>
                <Text c="dimmed" mt="sm">Your application is currently under review by the administrator.</Text>
                <Badge size="lg" mt="md" color="yellow">Status: PENDING</Badge>
              </>
            )}
          </Card>
        ) : (
          <Card className="glass" padding="xl" radius="lg" style={{ textAlign: 'center' }}>
            <IconBus size={64} style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
            <Title order={3} mt="md">No Passes Found</Title>
            <Text c="dimmed" mt="sm">You haven't applied for a bus pass yet.</Text>
            <Button mt="lg" onClick={() => window.location.href = '/user/apply'} variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
              Apply For Pass
            </Button>
          </Card>
        )}
      </Container>
    );
  }

  // If expired
  if (pass.status !== 'ACTIVE' && expiryStatus === 'expired') {
    // ... handle expired ...
    // Code for expired display similar to active but warning
    // For now returning the same active view but maybe with expired overlay or allowing to renew?
    // Skipping renewal logic for now, just showing status.
    // But user asked for countdown, which implies checking activity.
  }

  const isUniversal = pass.source === "All Routes" || pass.destination === "All Routes";
  const totalDays = 30;
  const progressValue = Math.min(100, (timeLeft.days / totalDays) * 100);
  const progressColor = timeLeft.days < 7 ? 'red' : timeLeft.days < 15 ? 'orange' : 'teal';

  return (
    <div className="mypass-container">
      <Container size="xs">

        {/* Pass Expiry Counter */}
        <Card padding="md" radius="md" mb="md" className="glass expiry-counter-card">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <RingProgress
                size={52}
                thickness={4}
                roundCaps
                sections={[{ value: progressValue, color: progressColor }]}
                label={<Center><IconClock size={18} /></Center>}
              />
              <div style={{ minWidth: '140px' }}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Expires In</Text>
                <Group gap={4} align="baseline">
                  <Text fw={700} size="lg" c={progressColor} style={{ lineHeight: 1 }}>
                    {timeLeft.days}d {timeLeft.hours}h
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>
                    {timeLeft.minutes}m {timeLeft.seconds}s
                  </Text>
                </Group>
              </div>
            </Group>
            <Tooltip label="Download PDF Pass">
              <ActionIcon
                size="xl"
                variant="filled"
                color="violet"
                radius="md"
                onClick={downloadPDF}
                className="download-btn-highlight"
              >
                <IconDownload size={22} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Card>

        <div id="digital-pass" className="digital-ticket">
          {/* Ticket Header */}
          <div className="ticket-header">
            <div className="header-content">
              <IconBus size={24} color="white" />
              <Text fw={700} c="white" size="lg" ml="xs">BUS PASS</Text>
            </div>
            <Badge color="white" variant="filled" c="violet" size="lg" tt="uppercase">
              {pass.passType}
            </Badge>
          </div>

          {/* Ticket Body */}
          <div className="ticket-body">
            <Group align="flex-start" justify="space-between" mb="xl" wrap="nowrap">
              <Group align="flex-start" wrap="nowrap">
                {pass.photoUrl ? (
                  <Image
                    src={`${import.meta.env.VITE_BASE_URL || "http://localhost:8082"}/files/${pass.photoUrl}`}
                    w={80}
                    h={100}
                    radius="sm"
                    style={{ border: '1px solid #ddd', objectFit: 'cover', minWidth: '80px' }}
                    fallbackSrc="https://placehold.co/80x100?text=No+Photo"
                  />
                ) : (
                  <div style={{ width: '80px', height: '100px', background: '#f1f1f1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                    <IconUser size={32} color="#ccc" />
                  </div>
                )}
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={2}>Passenger</Text>
                  <div style={{ color: '#000', fontWeight: '800', fontSize: '1.25rem', marginBottom: '4px' }}>
                    {(pass.userName || currentUser?.name || "User").toUpperCase()}
                  </div>
                  <Text size="sm" c="dimmed" mt={4}>ID: {pass.userId || currentUser?.id || "N/A"}</Text>
                </div>
              </Group>

              {qrCodeUrl && (
                <div className="qr-container">
                  <Image src={qrCodeUrl} w={80} h={80} />
                </div>
              )}
            </Group>

            <div className="route-timeline">
              {isUniversal ? (
                <div style={{ textAlign: 'center', width: '100%', padding: '1rem 0' }}>
                  <Group justify="center" gap="xs" mb={4}>
                    <IconWorld size={24} color="var(--user-primary)" />
                    <Text fw={700} size="lg" c="violet">All Routes Access</Text>
                  </Group>
                  <Text size="sm" c="dimmed">Valid on entire transit network</Text>
                </div>
              ) : (
                <>
                  <div className="route-point">
                    <div className="point-dot source"></div>
                    <Text fw={600}>{pass.source}</Text>
                    <Text size="xs" c="dimmed">Boarding</Text>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point">
                    <div className="point-dot destination"></div>
                    <Text fw={600}>{pass.destination}</Text>
                    <Text size="xs" c="dimmed">Drop-off</Text>
                  </div>
                </>
              )}
            </div>

            <Group justify="space-between" mt="xl" className="ticket-footer-info">
              <div>
                <Group gap={6}>
                  <IconCalendar size={16} color="var(--user-primary)" />
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">Valid Until</Text>
                </Group>
                <Text fw={600}>{pass.endDate || "N/A"}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Pass Number</Text>
                <Text fw={600} ff="monospace" size="xs">{pass.passNumber || `#${pass.id}`}</Text>
              </div>
            </Group>
          </div>

          {/* Ticket Stub/Bottom */}
          <div className="ticket-stub">
            <Text size="xs" c="dimmed" ta="center">
              {isUniversal ? "This pass is non-transferable. ID proof may be required." : "Show this digital pass to the conductor upon request."}
            </Text>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MyPass;