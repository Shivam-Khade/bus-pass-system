import { useState, useEffect } from "react";
import {
  Container,
  Select,
  Button,
  Title,
  FileInput,
  Card,
  Group,
  Stepper,
  Text,
  Box,
  rem
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconUpload, IconCheck, IconUser, IconMapPin, IconFileText, IconCalendar } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import "./ApplyPass.css";

import { getCurrentUser } from "../../api/auth";

const ApplyPass = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const currentUser = getCurrentUser();

  const form = useForm({
    initialValues: {
      source: "All Routes",
      destination: "All Routes",
      passType: "",
      duration: 1,
      bonafideCertificate: null,
      photo: null,
    },
    validate: (values) => {
      if (active === 0) {
        return {
          passType: !values.passType ? "Please select a pass duration" : null,
        };
      }
      if (active === 1) {
        return {
          bonafideCertificate: currentUser?.role === 'STUDENT' && !values.bonafideCertificate ? "Bonafide certificate is required" : null,
          photo: !values.photo ? "Passport size photo is required" : null,
        };
      }
      return {};
    },
  });

  useEffect(() => {
    checkActivePass();
  }, []);

  const checkActivePass = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      const response = await fetch(`${BASE_URL}/user/pass?email=${encodeURIComponent(currentUser.email)}`, {
        headers: { "Authorization": `Bearer ${currentUser?.token}` }
      });
      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (data && data.status === 'ACTIVE') {
          notifications.show({
            id: 'active-pass-found',
            title: 'Active Pass Found',
            message: 'You already have an active bus pass.',
            color: 'blue',
          });
          navigate('/user/my-pass');
        }
      }
    } catch (error) {
      console.error("Error checking active pass:", error);
    }
  };

  const nextStep = () => setActive((current) => (form.validate().hasErrors ? current : current + 1));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    if (form.validate().hasErrors) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("source", "All Routes");
    formData.append("destination", "All Routes");
    formData.append("passType", form.values.passType); // "monthly", "quarterly", "yearly"
    formData.append("duration", form.values.duration); // 1, 3, 12
    formData.append("userEmail", currentUser.email);
    formData.append("userName", currentUser.name);

    // Aadhaar already collected during registration — no need to upload again
    formData.append("bonafideCertificate", form.values.bonafideCertificate);
    formData.append("photo", form.values.photo);

    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
      const response = await fetch(`${BASE_URL}/api/pass/apply`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentUser?.token}`
        },
        body: formData,
      });

      if (response.ok) {
        notifications.show({
          color: "green",
          title: "Success",
          message: "Application submitted successfully! Redirecting...",
        });
        setTimeout(() => navigate("/user/my-pass"), 1500);
      } else {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to submit application");
      }
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Submission Failed",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-pass-container">
      <Container size="sm" mt="xl">
        <Title order={2} ta="center" mb="xl" className="apply-title">
          New All-Route Pass
        </Title>

        <Card shadow="md" padding="xl" radius="lg" className="glass form-card">
          <Stepper active={active} color="violet" mb="xl">
            <Stepper.Step label="Duration" description="Select Validity" icon={<IconCalendar size={18} />} />
            <Stepper.Step label="Documents" description="Upload Proofs" icon={<IconUpload size={18} />} />
            <Stepper.Step label="Review" description="Confirm & Submit" icon={<IconCheck size={18} />} />
          </Stepper>

          <Box mt="lg">
            {active === 0 && (
              <div className="step-content">
                <Text size="sm" c="dimmed" mb="lg">
                  This pass grants access to all routes within the network. Select a duration plan that suits you.
                </Text>

                <Select
                  label="Select Pass Duration"
                  placeholder="Choose a plan"
                  data={[
                    { value: "monthly", label: "Monthly (1 Month)" },
                    { value: "quarterly", label: "Quarterly (3 Months)" },
                    { value: "yearly", label: "Yearly (12 Months)" },
                  ]}
                  {...form.getInputProps("passType")}
                  onChange={(value) => {
                    form.setFieldValue('passType', value);
                    if (value === 'monthly') form.setFieldValue('duration', 1);
                    if (value === 'quarterly') form.setFieldValue('duration', 3);
                    if (value === 'yearly') form.setFieldValue('duration', 12);
                  }}
                  mb="xl"
                  variant="filled"
                  size="md"
                  checkIconPosition="right"
                />
              </div>
            )}

            {active === 1 && (
              <div className="step-content">
                {currentUser?.role === 'STUDENT' && (
                  <FileInput
                    label="Bonafide Certificate"
                    placeholder="Upload College ID/Bonafide"
                    leftSection={<IconFileText size={14} />}
                    accept="image/png,image/jpeg,application/pdf"
                    {...form.getInputProps("bonafideCertificate")}
                    mb="md"
                    variant="filled"
                    clearable
                  />
                )}
                <FileInput
                  label="Passport Size Photo"
                  placeholder="Upload Photo"
                  leftSection={<IconUser size={14} />}
                  accept="image/png,image/jpeg"
                  {...form.getInputProps("photo")}
                  mb="md"
                  variant="filled"
                  clearable
                />
              </div>
            )}

            {active === 2 && (
              <div className="step-content review-step">
                <Title order={4} mb="md">Review Application</Title>
                <Card withBorder padding="md" radius="md" mb="md" className="review-card">
                  <Group justify="space-between" mb={10}>
                    <Text c="dimmed" size="sm">Pass Access:</Text>
                    <Text fw={600} c="violet">All Routes (Universal)</Text>
                  </Group>

                  <Group justify="space-between" mb={5}>
                    <Text c="dimmed" size="sm">Validity:</Text>
                    <Text fw={500}>{form.values.duration} Months</Text>
                  </Group>
                </Card>
                <Text size="sm" c="dimmed" mt="md">
                  By submitting, you confirm that all provided documents are authentic and valid.
                </Text>
              </div>
            )}

            <Group justify="space-between" mt="xl">
              {active !== 0 && (
                <Button variant="default" onClick={prevStep}>
                  Back
                </Button>
              )}
              {active !== 2 ? (
                <Button onClick={nextStep} color="violet">
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'indigo' }}
                >
                  Submit Application
                </Button>
              )}
            </Group>
          </Box>
        </Card>
      </Container>
    </div>
  );
};

export default ApplyPass;
