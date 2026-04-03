package com.bus_pass.app.controller;

import com.bus_pass.app.dto.BusPassApplyRequest;
import com.bus_pass.app.model.BusPassApplication;
import com.bus_pass.app.service.BusPassService;
import com.bus_pass.app.service.UserService;
import com.bus_pass.app.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pass")
public class BusPassController {

    private final BusPassService busPassService;
    private final UserService userService;

    public BusPassController(BusPassService busPassService, UserService userService) {
        this.busPassService = busPassService;
        this.userService = userService;
    }

    @PostMapping(value = "/apply", consumes = "multipart/form-data")
    public ResponseEntity<String> apply(
            @RequestParam("passType") String passType,
            @RequestParam("userEmail") String userEmail,
            @RequestParam(value = "adharCard", required = false) MultipartFile adharCard,
            @RequestParam(value = "bonafideCertificate", required = false) MultipartFile bonafideCertificate,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found: " + userEmail);
        }

        // Update documents
        try {
            userService.uploadDocuments(userEmail, adharCard, bonafideCertificate, photo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Document upload failed: " + e.getMessage());
        }

        BusPassApplyRequest req = new BusPassApplyRequest();
        req.setUserId(user.getId());
        req.setPassType(passType);

        try {
            busPassService.apply(req);
            return ResponseEntity.ok("Bus pass application submitted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-applications/{userId}")
    public ResponseEntity<List<BusPassApplication>> getMyApplications(@PathVariable int userId) {
        List<BusPassApplication> applications = busPassService.getUserApplications(userId);
        return ResponseEntity.ok(applications);
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<List<com.bus_pass.app.dto.BusPassApplicationResponse>> getAllApplications() {
        List<com.bus_pass.app.dto.BusPassApplicationResponse> applications = busPassService.getAllApplications();
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/admin/update-status/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable int id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        busPassService.updateStatus(id, status);
        return ResponseEntity.ok("Status updated successfully");
    }
}