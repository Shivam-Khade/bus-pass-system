package com.bus_pass.app.controller;

import com.bus_pass.app.dto.PassExpiryResponse;
import com.bus_pass.app.service.UserPassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserPassController {

    private final UserPassService userPassService;

    public UserPassController(UserPassService userPassService) {
        this.userPassService = userPassService;
    }

    @GetMapping("/pass")
    public Object getPass(@RequestParam String email) {
        return userPassService.getUserPass(email);
    }

    /**
     * 🔥 Pass Expiry Countdown Timer API
     * Returns days remaining, status, and a human-friendly message.
     */
    @GetMapping("/pass/expiry")
    public ResponseEntity<PassExpiryResponse> getPassExpiry(@RequestParam int userId) {
        PassExpiryResponse expiry = userPassService.getPassExpiry(userId);
        return ResponseEntity.ok(expiry);
    }

    /**
     * 🔥 Expire pass when countdown reaches zero.
     * Called automatically by the frontend real-time timer.
     */
    @PutMapping("/pass/expire")
    public ResponseEntity<String> expirePass(@RequestParam int passId) {
        userPassService.expirePass(passId);
        return ResponseEntity.ok("Pass marked as EXPIRED");
    }
}
