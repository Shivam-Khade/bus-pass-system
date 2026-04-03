package com.bus_pass.app.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final EmailService emailService;
    private final SmsService smsService;

    // Shared in-memory OTP store: key = email OR phone, value = OTP
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private static final int OTP_VALIDITY_MINUTES = 5;

    public OtpService(EmailService emailService, SmsService smsService) {
        this.emailService = emailService;
        this.smsService = smsService;
    }

    // ─── Email OTP (existing - kept for backward compatibility) ──────────────

    public void generateAndSendOtp(String email) {
        String otp = generateOtp();
        otpStorage.put(email, otp);
        scheduleRemoval(email);

        String subject = "Your OTP for Bus Pass App";
        String body = "Your OTP is: " + otp + "\nIt is valid for " + OTP_VALIDITY_MINUTES + " minutes.";
        emailService.sendEmail(email, subject, body);
    }

    public boolean validateOtp(String email, String otp) {
        return validate(email, otp);
    }

    // ─── Phone (SMS) OTP (new) ────────────────────────────────────────────────

    /**
     * Generates a 6-digit OTP and sends it via SMS to {@code phone}.
     * The OTP is keyed by the phone number in the in-memory store.
     *
     * @param phone E.164-formatted phone number, e.g. "+919876543210"
     */
    public String generateAndSendOtpToPhone(String phone) {
        String otp = generateOtp();
        otpStorage.put(phone, otp);
        scheduleRemoval(phone);

        String message = "Your Bus Pass App OTP is: " + otp
                + ". Valid for " + OTP_VALIDITY_MINUTES + " minutes. Do not share.";
        smsService.sendSms(phone, message);
        return otp;
    }

    /**
     * Validates the OTP received on a phone number.
     *
     * @param phone phone number used as the key
     * @param otp   the OTP entered by the user
     * @return true if OTP matches and has not expired; false otherwise
     */
    public boolean validateOtpByPhone(String phone, String otp) {
        return validate(phone, otp);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private boolean validate(String key, String otp) {
        if (key == null || otp == null)
            return false;
        String stored = otpStorage.get(key);
        if (stored != null && stored.equals(otp)) {
            otpStorage.remove(key); // one-time use
            return true;
        }
        return false;
    }

    private void scheduleRemoval(String key) {
        scheduler.schedule(() -> otpStorage.remove(key), OTP_VALIDITY_MINUTES, TimeUnit.MINUTES);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.valueOf(100000 + random.nextInt(900000));
    }
}
