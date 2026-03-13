package com.bus_pass.app.service;

import com.bus_pass.app.dao.BusPassDao;
import com.bus_pass.app.dao.UserPassDao;
import com.bus_pass.app.dto.PassExpiryResponse;
import com.bus_pass.app.model.UserPass;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class UserPassService {

    private final UserPassDao userPassDao;
    private final BusPassDao busPassDao;

    public UserPassService(UserPassDao userPassDao, BusPassDao busPassDao) {
        this.userPassDao = userPassDao;
        this.busPassDao = busPassDao;
    }

    public void generatePassIfNotExists(int applicationId) {

        // Do not generate duplicate pass
        if (userPassDao.existsByApplicationId(applicationId)) {
            return;
        }

        // Check application status
        String status = busPassDao.getStatus(applicationId);
        if (!"APPROVED".equalsIgnoreCase(status)) {
            return;
        }

        // Get pass type and user ID
        String passType = busPassDao.getPassType(applicationId);
        Integer userId = busPassDao.getUserId(applicationId);

        if (userId == null) {
            throw new RuntimeException("User ID not found for application: " + applicationId);
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = switch (passType.toUpperCase()) {
            case "QUARTERLY" -> startDate.plusMonths(3);
            case "YEARLY" -> startDate.plusYears(1);
            default -> // MONTHLY
                startDate.plusMonths(1);
        };

        // Duration logic

        // Create pass
        userPassDao.create(userId, applicationId, passType, endDate);
    }

    /**
     * Returns the user's pass with dynamic EXPIRY check
     */
    public UserPass getUserPass(String email) {

        UserPass pass = userPassDao.findByUserEmail(email);

        if (pass == null) {
            return null;
        }

        // 🔥 Dynamic expiry logic
        if (LocalDate.now().isAfter(pass.getEndDate())) {
            pass.setStatus("EXPIRED");
        } else {
            pass.setStatus("ACTIVE");
        }

        return pass;
    }

    public List<UserPass> getAllPasses() {

        List<UserPass> passes = userPassDao.findAll();

        LocalDate today = LocalDate.now();

        for (UserPass pass : passes) {
            if (today.isAfter(pass.getEndDate())) {
                pass.setStatus("EXPIRED");
            } else {
                pass.setStatus("ACTIVE");
            }
        }

        return passes;
    }

    /**
     * 🔥 Pass Expiry Countdown Timer
     * Calculates days remaining until the user's active pass expires.
     * Ensures 1 user = 1 active pass logic.
     */
    public PassExpiryResponse getPassExpiry(int userId) {
        UserPass pass = userPassDao.findActiveByUserId(userId);

        PassExpiryResponse response = new PassExpiryResponse();

        if (pass == null) {
            response.setStatus("NO_PASS");
            response.setDaysRemaining(0);
            response.setMessage("You don't have an active pass. Apply for one now! 🎫");
            return response;
        }

        LocalDate today = LocalDate.now();
        long daysRemaining = ChronoUnit.DAYS.between(today, pass.getEndDate());

        response.setPassId(pass.getId());
        response.setPassNumber(pass.getPassNumber());
        response.setPassType(pass.getPassType());
        response.setStartDate(pass.getStartDate());
        response.setEndDate(pass.getEndDate());
        response.setDaysRemaining(daysRemaining);

        if (daysRemaining < 0) {
            response.setStatus("EXPIRED");
            response.setMessage("Your pass has expired " + Math.abs(daysRemaining) + " days ago ❌");
        } else if (daysRemaining == 0) {
            response.setStatus("ACTIVE");
            response.setMessage("Your pass expires today! ⚠️");
        } else if (daysRemaining <= 7) {
            response.setStatus("ACTIVE");
            response.setMessage(
                    "Your pass expires in " + daysRemaining + " day" + (daysRemaining > 1 ? "s" : "") + " ⏳");
        } else if (daysRemaining <= 30) {
            response.setStatus("ACTIVE");
            response.setMessage("Your pass expires in " + daysRemaining + " days 📅");
        } else {
            response.setStatus("ACTIVE");
            response.setMessage("Your pass is valid for " + daysRemaining + " more days ✅");
        }

        return response;
    }

    /**
     * 🔥 Mark a pass as EXPIRED in the database.
     * Called by frontend when the real-time countdown reaches zero.
     */
    public void expirePass(int passId) {
        userPassDao.updateStatus(passId, "EXPIRED");
    }
}