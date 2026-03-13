package com.bus_pass.app.controller;

import com.bus_pass.app.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Razorpay: Create order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestParam int applicationId,
            @RequestParam String userEmail) {
        try {
            Map<String, Object> order = paymentService.createRazorpayOrder(applicationId, userEmail);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Razorpay: Verify payment
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> payload) {
        try {
            int applicationId = Integer.parseInt(payload.get("applicationId"));
            String razorpayOrderId = payload.get("razorpay_order_id");
            String razorpayPaymentId = payload.get("razorpay_payment_id");
            String razorpaySignature = payload.get("razorpay_signature");

            paymentService.verifyAndCompletePayment(
                    applicationId, razorpayOrderId, razorpayPaymentId, razorpaySignature);

            return ResponseEntity.ok("Payment verified successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment verification failed: " + e.getMessage());
        }
    }

    // Old endpoints (for backward compatibility)
    @PostMapping("/initiate")
    public String initiatePayment(
            @RequestParam int applicationId,
            @RequestParam String userEmail) {
        paymentService.initiatePayment(applicationId, userEmail);
        return "Payment initiated successfully (UNPAID)";
    }

    @PostMapping("/pay")
    public String completePayment(
            @RequestParam int applicationId) {
        paymentService.completePayment(applicationId);
        return "Payment successful (PAID)";
    }
}