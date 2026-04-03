package com.bus_pass.app.controller;

import com.bus_pass.app.model.BusPassApplication;
import com.bus_pass.app.model.User;
import com.bus_pass.app.model.UserPass;
import com.bus_pass.app.service.BusPassService;
import com.bus_pass.app.service.UserPassService;
import com.bus_pass.app.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BusPassService busPassService;
    private final UserService userService;
    private final UserPassService userPassService;

    public AdminController(BusPassService busPassService, UserService userService, UserPassService userPassService) {
        this.busPassService = busPassService;
        this.userService = userService;
        this.userPassService = userPassService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers(org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Admin only");
        }
        return userService.getAllUsers();
    }

    @DeleteMapping("/users/{userId}")
    public String removeUser(@PathVariable int userId,
            org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
        userService.removeUser(userId);
        return "User deactivated successfully";
    }

    @GetMapping("/passes")
    public List<UserPass> getAllPasses(org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Admin only");
        }
        return userPassService.getAllPasses();
    }

    @GetMapping("/applications")
    public List<com.bus_pass.app.dto.BusPassApplicationResponse> getAllApplications(
            org.springframework.security.core.Authentication authentication) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Admin only");
        }
        return busPassService.getAllApplications();
    }

    @PostMapping("/update-status")
    public String updateStatus(
            org.springframework.security.core.Authentication authentication,
            @RequestParam int applicationId,
            @RequestParam String status) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Admin only");
        }
        busPassService.updateStatus(applicationId, status);
        return "Status updated to " + status;
    }

    @PostMapping("/users")
    public String createUser(
            org.springframework.security.core.Authentication authentication,
            @RequestBody com.bus_pass.app.dto.RegisterRequest request) {
        if (!userService.isAdmin(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Admin only");
        }
        try {
            userService.register(request);
            return "User created successfully";
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}