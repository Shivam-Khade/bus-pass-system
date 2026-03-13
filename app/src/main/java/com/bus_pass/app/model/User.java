package com.bus_pass.app.model;

import lombok.Data;

@Data
public class User {
    private int id;
    private String name;
    private String email;
    private String password;
    private String role;
    private String phone;
    private String adharUrl;
    private String bonafideUrl;
    private String photoUrl;
    private String address;
    private String aadhaarNumber;  // Extracted by OCR during registration

    // required for admin remove (soft delete)
    private boolean active;
}
