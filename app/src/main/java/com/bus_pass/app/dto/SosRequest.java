package com.bus_pass.app.dto;

import lombok.Data;

@Data
public class SosRequest {
    private double latitude;
    private double longitude;
    private String message;
}
