package com.bus_pass.app.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BusPassApplicationResponse {
    private int id;
    private int userId;
    private String passType;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    // User Details
    private String userName;
    private String userEmail;
    private String userRole;
    private String adharUrl;
    private String bonafideUrl;
    private String photoUrl;
}
