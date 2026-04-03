package com.bus_pass.app.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SosAlert {
    private int id;
    private int userId;
    private double latitude;
    private double longitude;
    private String message;
    private String status; // ACTIVE, RESOLVED
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    // Additional fields for display (joined from users table)
    private String userName;
    private String userEmail;
    private String userPhone;
}
