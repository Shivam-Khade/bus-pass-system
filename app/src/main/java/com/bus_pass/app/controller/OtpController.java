package com.bus_pass.app.controller;

import com.bus_pass.app.service.OtpService;
import com.bus_pass.app.dto.LoginResponse;
import com.bus_pass.app.service.UserService;
import com.bus_pass.app.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class OtpController {

    private final OtpService otpService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public OtpController(OtpService otpService, UserService userService, JwtUtil jwtUtil) {
        this.otpService = otpService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // ─── Email OTP (existing) ─────────────────────────────────────────────────

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestParam String email) {
        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok("OTP sent successfully to " + email);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending OTP: " + e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtpAndLogin(@RequestParam String email, @RequestParam String otp) {
        boolean isValid = otpService.validateOtp(email, otp);

        if (isValid) {
            try {
                var userProfile = userService.getProfile(email);
                final String jwt = jwtUtil.generateToken(email);
                return ResponseEntity.ok(new LoginResponse(
                        userProfile.getId(), userProfile.getEmail(), userProfile.getRole(),
                        userProfile.getName(), jwt, userProfile.getAdharUrl(),
                        userProfile.getBonafideUrl(), userProfile.getPhotoUrl(),
                        userProfile.getAddress()));
            } catch (Exception e) {
                return ResponseEntity.ok("OTP verified successfully.");
            }
        } else {
            return ResponseEntity.status(400).body("Invalid or expired OTP");
        }
    }

    // ─── Phone / SMS OTP (new) ────────────────────────────────────────────────

    /**
     * Generates an OTP and sends it via SMS to the provided phone number.
     * Phone must be in E.164 format, e.g. "+919876543210".
     */
    @PostMapping("/send-otp-phone")
    public ResponseEntity<String> sendOtpToPhone(@RequestParam String phone) {
        try {
            otpService.generateAndSendOtpToPhone(phone);
            return ResponseEntity.ok("OTP sent via SMS to " + phone);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error sending SMS OTP: " + e.getMessage());
        }
    }

    /**
     * Validates the SMS OTP during registration.
     * Called only for the phone-based OTP verification step —
     * final OTP check at /auth/register still uses this too.
     */
    @PostMapping("/verify-otp-phone")
    public ResponseEntity<String> verifyOtpByPhone(
            @RequestParam String phone,
            @RequestParam String otp) {
        boolean valid = otpService.validateOtpByPhone(phone, otp);
        if (valid) {
            return ResponseEntity.ok("Phone OTP verified successfully.");
        }
        return ResponseEntity.status(400).body("Invalid or expired OTP");
    }
}
