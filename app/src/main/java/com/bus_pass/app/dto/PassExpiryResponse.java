package com.bus_pass.app.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PassExpiryResponse {
    private int passId;
    private String passNumber;
    private String passType;
    private String status; // ACTIVE, EXPIRED, NO_PASS
    private LocalDate startDate;
    private LocalDate endDate;
    private long daysRemaining; // negative if expired
    private String message; // "Your pass expires in 5 days ⏳"
}
