package com.bus_pass.app.service;

import com.bus_pass.app.dao.BusPassDao;
import com.bus_pass.app.dto.BusPassApplyRequest;
import com.bus_pass.app.model.BusPassApplication;
import org.springframework.stereotype.Service;
import com.bus_pass.app.service.OtpService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusPassService {

    private final BusPassDao busPassDao;
    private final com.bus_pass.app.dao.UserDao userDao;
    private final OtpService otpService;

    public BusPassService(BusPassDao busPassDao, com.bus_pass.app.dao.UserDao userDao, OtpService otpService) {
        this.busPassDao = busPassDao;
        this.userDao = userDao;
        this.otpService = otpService;
    }

    public void apply(BusPassApplyRequest request) {
        com.bus_pass.app.model.User user = userDao.findById(request.getUserId());

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Aadhaar is already verified via OCR during registration — no file upload needed

        if (user.getPhotoUrl() == null || user.getPhotoUrl().isEmpty()) {
            throw new RuntimeException("Profile photo is mandatory. Please upload it in your profile.");
        }

        if ("STUDENT".equalsIgnoreCase(user.getRole())) {
            if (user.getBonafideUrl() == null || user.getBonafideUrl().isEmpty()) {
                throw new RuntimeException("Bonafide certificate upload is mandatory for students.");
            }
        }

        BusPassApplication app = new BusPassApplication();
        app.setUserId(request.getUserId());
        app.setPassType(request.getPassType());
        app.setStatus("PENDING");

        busPassDao.apply(app);
    }

    public List<com.bus_pass.app.dto.BusPassApplicationResponse> getAllApplications() {
        return busPassDao.getAllApplicationsWithUserDetails();
    }

    public void updateStatus(int id, String status) {
        busPassDao.updateStatus(id, status);
    }

    public List<BusPassApplication> getUserApplications(int userId) {
        return busPassDao.getAllApplications().stream()
                .filter(app -> app.getUserId() == userId)
                .collect(Collectors.toList());
    }
}