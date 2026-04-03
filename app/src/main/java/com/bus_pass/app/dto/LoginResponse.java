package com.bus_pass.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private int id;
    private String email;
    private String role;
    private String name;
    private String token;
    private String adharUrl;
    private String bonafideUrl;
    private String photoUrl;
    private String address;
}
