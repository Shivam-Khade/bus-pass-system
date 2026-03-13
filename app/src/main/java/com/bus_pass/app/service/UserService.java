package com.bus_pass.app.service;

import com.bus_pass.app.dao.UserDao;
import com.bus_pass.app.dto.RegisterRequest;
import com.bus_pass.app.dto.UserProfileResponse;
import com.bus_pass.app.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserDao userDao;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.bus_pass.app.util.FileStorageUtil fileStorageUtil;

    public UserService(UserDao userDao, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            com.bus_pass.app.util.FileStorageUtil fileStorageUtil) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageUtil = fileStorageUtil;
    }

    public void register(RegisterRequest request) {
        if (userDao.getRoleByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt hashed password
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setAadhaarNumber(request.getAadhaarNumber()); // Aadhaar number extracted by OCR

        userDao.save(user);

        // Link the Aadhaar image file that was stored during OCR scan
        if (request.getAdharFileUrl() != null && !request.getAdharFileUrl().isEmpty()) {
            User savedUser = userDao.findByEmail(request.getEmail());
            userDao.updateDocuments(savedUser.getId(), request.getAdharFileUrl(),
                    savedUser.getBonafideUrl(), savedUser.getPhotoUrl());
        }
    }

    public UserProfileResponse getProfile(String email) {
        User user = userDao.getProfileByEmail(email);

        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole());
        res.setPhone(user.getPhone());
        res.setAdharUrl(user.getAdharUrl());
        res.setBonafideUrl(user.getBonafideUrl());
        res.setPhotoUrl(user.getPhotoUrl());
        res.setAddress(user.getAddress());

        return res;
    }

    public boolean isAdmin(String email) {
        String role = userDao.getRoleByEmail(email);

        if (role == null) {
            return false;
        }

        return "ADMIN".equalsIgnoreCase(role);
    }

    public List<User> getAllUsers() {
        return userDao.findAll();
    }

    public void removeUser(int userId) {
        userDao.deactivateUser(userId);
    }

    public User getUserByEmail(String email) {
        return userDao.findByEmail(email);
    }

    public void uploadDocuments(String email, org.springframework.web.multipart.MultipartFile adhar,
            org.springframework.web.multipart.MultipartFile bonafide,
            org.springframework.web.multipart.MultipartFile photo) {
        User user = userDao.findByEmail(email);

        String adharUrl = user.getAdharUrl();
        String bonafideUrl = user.getBonafideUrl();
        String photoUrl = user.getPhotoUrl();

        if (adhar != null && !adhar.isEmpty()) {
            adharUrl = fileStorageUtil.storeFile(adhar);
        }

        if (bonafide != null && !bonafide.isEmpty()) {
            bonafideUrl = fileStorageUtil.storeFile(bonafide);
        }

        if (photo != null && !photo.isEmpty()) {
            photoUrl = fileStorageUtil.storeFile(photo);
        }

        userDao.updateDocuments(user.getId(), adharUrl, bonafideUrl, photoUrl);
    }

    public void updateAddress(String email, String address) {
        User user = userDao.findByEmail(email);
        userDao.updateAddress(user.getId(), address);
    }
}