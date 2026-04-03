package com.bus_pass.app.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String phone;
    private String otp;
    private String aadhaarNumber;  // Validated Aadhaar number from OCR
    private String adharFileUrl;   // Stored Aadhaar image filename from OCR scan
}
