package com.bus_pass.app.service;

import com.bus_pass.app.dao.BusPassDao;
import com.bus_pass.app.dao.PaymentDao;
import com.bus_pass.app.dao.UserDao;
import com.bus_pass.app.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.json.JSONObject;
import com.razorpay.RazorpayClient;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentDao paymentDao;
    private final BusPassDao busPassDao;
    private final UserDao userDao;
    private final UserPassService userPassService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentDao paymentDao,
            BusPassDao busPassDao,
            UserDao userDao,
            UserPassService userPassService) {
        this.paymentDao = paymentDao;
        this.busPassDao = busPassDao;
        this.userDao = userDao;
        this.userPassService = userPassService;
    }

    public Map<String, Object> createRazorpayOrder(int applicationId, String userEmail) throws Exception {
        // Validate application is approved
        String status = busPassDao.getStatus(applicationId);
        if (!"APPROVED".equals(status)) {
            throw new RuntimeException("Payment allowed only after approval");
        }

        // Calculate amount
        String passType = busPassDao.getPassType(applicationId);
        User user = userDao.findByEmail(userEmail);
        double amount = calculateAmount(passType, user.getRole());

        // Create Razorpay order
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (amount * 100)); // Amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_rcptid_" + applicationId);

            Order order = razorpay.orders.create(orderRequest);

            // Save payment record if doesn't exist
            if (!paymentDao.existsByApplicationId(applicationId)) {
                paymentDao.create(applicationId, amount);
            }

            // Update with Razorpay order ID
            paymentDao.updateRazorpayOrderId(applicationId, order.get("id"));

            // Return order details
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", amount);
            response.put("currency", "INR");
            response.put("keyId", razorpayKeyId);

            return response;
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    public void verifyAndCompletePayment(int applicationId, String razorpayOrderId,
            String razorpayPaymentId, String razorpaySignature) throws Exception {
        // Verify signature
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                throw new RuntimeException("Invalid payment signature");
            }

            // Mark payment as complete and save Razorpay details
            paymentDao.markPaidWithRazorpayDetails(applicationId, razorpayOrderId,
                    razorpayPaymentId, razorpaySignature);
            userPassService.generatePassIfNotExists(applicationId);

        } catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    // Keep old methods for backward compatibility
    public void initiatePayment(int applicationId, String userEmail) {
        String status = busPassDao.getStatus(applicationId);

        if (!"APPROVED".equals(status)) {
            throw new RuntimeException("Payment allowed only after approval");
        }

        if (paymentDao.existsByApplicationId(applicationId)) {
            return;
        }

        String passType = busPassDao.getPassType(applicationId);
        User user = userDao.findByEmail(userEmail);

        double baseAmount = getBaseAmount(passType);
        double discount = getDiscount(user.getRole());

        double finalAmount = baseAmount - (baseAmount * discount);

        paymentDao.create(applicationId, finalAmount);
    }

    public void completePayment(int applicationId) {
        paymentDao.markPaid(applicationId);
        userPassService.generatePassIfNotExists(applicationId);
    }

    // ---------------- HELPERS ----------------

    private double calculateAmount(String passType, String role) {
        double baseAmount = getBaseAmount(passType);
        double discount = getDiscount(role);
        return baseAmount - (baseAmount * discount);
    }

    private double getBaseAmount(String passType) {
        return switch (passType.toUpperCase()) {
            case "QUARTERLY" -> 1200;
            case "YEARLY" -> 4000;
            default -> 500; // MONTHLY
        };
    }

    private double getDiscount(String role) {
        return switch (role.toUpperCase()) {
            case "STUDENT" -> 0.20; // 20% discount
            default -> 0.0;
        };
    }
}