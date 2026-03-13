package com.bus_pass.app.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private int id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String adharUrl;
    private String bonafideUrl;
    private String photoUrl;
    private String address;
}
