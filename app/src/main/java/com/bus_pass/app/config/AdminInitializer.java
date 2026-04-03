package com.bus_pass.app.config;

import com.bus_pass.app.dto.RegisterRequest;
import com.bus_pass.app.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserService userService) {
        return args -> {
            try {
                userService.getUserByEmail("admin@gmail.com");
                System.out.println("Admin user already exists.");
            } catch (Exception e) {
                // If user not found, create one
                RegisterRequest adminReq = new RegisterRequest();
                adminReq.setName("Admin");
                adminReq.setEmail("admin@gmail.com");
                adminReq.setPassword("123456"); // UserService will encode it
                adminReq.setRole("ADMIN");
                adminReq.setPhone("0000000000");

                userService.register(adminReq);
                System.out.println("Admin user created successfully.");
                System.out.println("Email: admin@gmail.com");
                System.out.println("Password: 123456");
            }
        };
    }
}
