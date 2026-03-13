package com.bus_pass.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@Service
public class EmailService {

    @Value("${resend.api.key:re_YOUR_KEY_HERE}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String fromEmail;

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            Resend resend = new Resend(resendApiKey);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(toEmail)
                    .subject(subject)
                    .html(body.replace("\n", "<br>"))
                    .build();

            CreateEmailResponse response = resend.emails().send(params);

            System.out.println("✅ Email sent successfully to " + toEmail + " | ID: " + response.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
            // Fallback: print OTP to console for development/testing
            System.out.println("----- SIMULATED EMAIL (FALLBACK) -----");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + body);
            System.out.println("--------------------------------------");
        }
    }
}
