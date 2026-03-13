package com.bus_pass.app.dto;

import lombok.Data;

@Data
public class BusPassApplyRequest {
    private int userId;
    private String passType; // MONTHLY / QUARTERLY
    private String otp;
}