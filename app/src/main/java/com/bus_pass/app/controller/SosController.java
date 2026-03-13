package com.bus_pass.app.controller;

import com.bus_pass.app.dto.SosRequest;
import com.bus_pass.app.model.SosAlert;
import com.bus_pass.app.service.SosService;
import com.bus_pass.app.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/sos")
public class SosController {

    private final SosService sosService;
    private final UserService userService;

    public SosController(SosService sosService, UserService userService) {
        this.sosService = sosService;
        this.userService = userService;
    }

    /**
     * User triggers SOS alert with their location
     */
    @PostMapping("/trigger")
    public String triggerSos(@RequestParam String email, @RequestBody SosRequest request) {
        return sosService.triggerSos(email, request);
    }

    /**
     * Admin: Get all SOS alerts
     */
    @GetMapping("/all")
    public List<SosAlert> getAllAlerts(org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
        return sosService.getAllAlerts();
    }

    /**
     * Admin: Get active (unresolved) SOS alerts
     */
    @GetMapping("/active")
    public List<SosAlert> getActiveAlerts(org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
        return sosService.getActiveAlerts();
    }

    /**
     * Admin: Resolve an SOS alert
     */
    @PostMapping("/resolve/{alertId}")
    public String resolveAlert(@PathVariable int alertId,
            org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
        sosService.resolveAlert(alertId);
        return "SOS alert resolved successfully";
    }

    /**
     * Admin: Get count of active alerts (for badge/notification)
     */
    @GetMapping("/active-count")
    public int getActiveAlertCount(org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
        return sosService.getActiveAlertCount();
    }
}
