package com.bus_pass.app.controller;

import com.bus_pass.app.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/doc")
public class DocumentController {

    private final UserService userService;

    public DocumentController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocuments(
            Authentication authentication,
            @RequestParam(value = "adhar", required = false) MultipartFile adhar,
            @RequestParam(value = "bonafide", required = false) MultipartFile bonafide,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        String email = authentication.getName();
        userService.uploadDocuments(email, adhar, bonafide, photo);

        return ResponseEntity.ok("Documents uploaded successfully");
    }
}
