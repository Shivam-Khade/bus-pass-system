package com.bus_pass.app.service;

import com.bus_pass.app.dao.SosAlertDao;
import com.bus_pass.app.dao.UserDao;
import com.bus_pass.app.dto.SosRequest;
import com.bus_pass.app.model.SosAlert;
import com.bus_pass.app.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SosService {

    private final SosAlertDao sosAlertDao;
    private final UserDao userDao;
    private final EmailService emailService;

    public SosService(SosAlertDao sosAlertDao, UserDao userDao, EmailService emailService) {
        this.sosAlertDao = sosAlertDao;
        this.userDao = userDao;
        this.emailService = emailService;
    }

    public String triggerSos(String userEmail, SosRequest request) {
        User user = userDao.findByEmail(userEmail);

        // Save SOS alert to database
        SosAlert alert = new SosAlert();
        alert.setUserId(user.getId());
        alert.setLatitude(request.getLatitude());
        alert.setLongitude(request.getLongitude());
        alert.setMessage(request.getMessage() != null ? request.getMessage() : "Emergency SOS triggered!");
        sosAlertDao.save(alert);

        // Build Google Maps link
        String mapsLink = "https://www.google.com/maps?q=" + request.getLatitude() + "," + request.getLongitude();

        // Send email alert to admin
        String subject = "🚨 SOS ALERT - " + user.getName() + " needs help!";
        String body = """
                ⚠️ EMERGENCY SOS ALERT ⚠️

                Passenger: %s
                Email: %s
                Phone: %s

                📍 Location: %s

                📝 Message: %s

                ⏰ Time: %s

                Please take immediate action!

                — Bus Pass Safety System
                """.formatted(
                user.getName(),
                user.getEmail(),
                user.getPhone() != null ? user.getPhone() : "N/A",
                mapsLink,
                alert.getMessage(),
                java.time.LocalDateTime.now().toString());

        // Send to admin email
        try {
            emailService.sendEmail("admin@gmail.com", subject, body);
            System.out.println("🚨 SOS Alert sent to admin for user: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send SOS email: " + e.getMessage());
        }

        return "SOS alert sent successfully! Help is on the way.";
    }

    public List<SosAlert> getAllAlerts() {
        return sosAlertDao.findAll();
    }

    public List<SosAlert> getActiveAlerts() {
        return sosAlertDao.findActiveAlerts();
    }

    public void resolveAlert(int alertId) {
        sosAlertDao.resolveAlert(alertId);
    }

    public int getActiveAlertCount() {
        return sosAlertDao.countActiveAlerts();
    }
}
