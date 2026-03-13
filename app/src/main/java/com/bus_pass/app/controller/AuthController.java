package com.bus_pass.app.controller;

import com.bus_pass.app.dto.LoginRequest;
import com.bus_pass.app.dto.LoginResponse;
import com.bus_pass.app.dto.RegisterRequest;
import com.bus_pass.app.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final org.springframework.security.authentication.AuthenticationManager authenticationManager;
    private final com.bus_pass.app.util.JwtUtil jwtUtil;

    private final com.bus_pass.app.service.OtpService otpService;

    public AuthController(UserService userService,
            org.springframework.security.authentication.AuthenticationManager authenticationManager,
            com.bus_pass.app.util.JwtUtil jwtUtil,
            com.bus_pass.app.service.OtpService otpService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        // OTP was sent to the user's phone via SMS — validate against phone number
        if (!otpService.validateOtpByPhone(request.getPhone(), request.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
        userService.register(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        final String jwt = jwtUtil.generateToken(request.getEmail());

        var userProfile = userService.getProfile(request.getEmail());

        return ResponseEntity.ok(new LoginResponse(userProfile.getId(), userProfile.getEmail(), userProfile.getRole(),
                userProfile.getName(), jwt, userProfile.getAdharUrl(), userProfile.getBonafideUrl(),
                userProfile.getPhotoUrl(), userProfile.getAddress()));
    }

    @org.springframework.web.bind.annotation.GetMapping("/profile")
    public ResponseEntity<LoginResponse> getProfile(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        var userProfile = userService.getProfile(email);

        // We don't need to generate a new token, usually. match the frontend
        // expectation.
        // Frontend expects LoginResponse-like structure or we can reuse it.
        // Token field: we can pass null or the existing one if we had it, but for
        // profile fetch, token is not needed in response mostly.
        // However, reuse LoginResponse for simplicity.
        return ResponseEntity.ok(new LoginResponse(
                userProfile.getId(),
                userProfile.getEmail(),
                userProfile.getRole(),
                userProfile.getName(),
                null, // token is not refreshed here
                userProfile.getAdharUrl(),
                userProfile.getBonafideUrl(),
                userProfile.getPhotoUrl(),
                userProfile.getAddress()));
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public ResponseEntity<String> updateProfile(org.springframework.security.core.Authentication authentication,
            @RequestBody java.util.Map<String, String> payload) {
        String email = authentication.getName();
        String address = payload.get("address");
        userService.updateAddress(email, address);
        return ResponseEntity.ok("Profile updated successfully");
    }

    /**
     * Public endpoint to upload profile photo and aadhaar image right after registration.
     * No authentication required — called immediately after /auth/register succeeds.
     */
    @PostMapping(value = "/upload-photo", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadPhoto(
            @org.springframework.web.bind.annotation.RequestParam("email") String email,
            @org.springframework.web.bind.annotation.RequestParam(value = "photo", required = false) org.springframework.web.multipart.MultipartFile photo,
            @org.springframework.web.bind.annotation.RequestParam(value = "adhar", required = false) org.springframework.web.multipart.MultipartFile adhar) {
        try {
            userService.uploadDocuments(email, adhar, null, photo);
            return ResponseEntity.ok("Documents uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}