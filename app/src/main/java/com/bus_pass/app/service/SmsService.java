package com.bus_pass.app.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account.sid:YOUR_TWILIO_SID}")
    private String accountSid;

    @Value("${twilio.auth.token:YOUR_TWILIO_TOKEN}")
    private String authToken;

    @Value("${twilio.phone.number:+1234567890}")
    private String twilioPhoneNumber;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        if (!"YOUR_TWILIO_SID".equals(accountSid) && !"YOUR_TWILIO_TOKEN".equals(authToken)) {
            try {
                Twilio.init(accountSid, authToken);
                initialized = true;
            } catch (Exception e) {
                System.err.println("❌ Failed to initialize Twilio: " + e.getMessage());
            }
        }
    }

    public void sendSms(String toPhone, String messageBody) {
        try {
            if (!initialized) {
                System.out.println("----- SIMULATED SMS (FALLBACK) -----");
                System.out.println("To: " + toPhone);
                System.out.println("Message: " + messageBody);
                System.out.println("------------------------------------");
                return;
            }

            Message message = Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(twilioPhoneNumber),
                    messageBody
            ).create();

            System.out.println("✅ SMS sent successfully to " + toPhone + " | SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS to " + toPhone + ": " + e.getMessage());
            System.out.println("----- SIMULATED SMS (FALLBACK) -----");
            System.out.println("To: " + toPhone);
            System.out.println("Message: " + messageBody);
            System.out.println("------------------------------------");
        }
    }
}
