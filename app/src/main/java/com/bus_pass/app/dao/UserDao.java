package com.bus_pass.app.dao;

import com.bus_pass.app.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.dao.EmptyResultDataAccessException;

import java.util.List;

@Repository
public class UserDao {

    private final JdbcTemplate jdbcTemplate;

    public UserDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(User user) {
        String sql = """
                    INSERT INTO users (name, email, password, role, phone, aadhaar_number)
                    VALUES (?, ?, ?, ?, ?, ?)
                """;

        jdbcTemplate.update(
                sql,
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getRole(),
                user.getPhone(),
                user.getAadhaarNumber());
    }

    public List<User> findAll() {
        String sql = "SELECT id, name, email, role, active, photo_url, phone, address, adhar_url, bonafide_url, aadhaar_number FROM users WHERE active = true";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            User u = new User();
            u.setId(rs.getInt("id"));
            u.setName(rs.getString("name"));
            u.setEmail(rs.getString("email"));
            u.setRole(rs.getString("role"));
            u.setActive(rs.getBoolean("active"));
            u.setPhotoUrl(rs.getString("photo_url"));
            u.setPhone(rs.getString("phone"));
            u.setAddress(rs.getString("address"));
            u.setAdharUrl(rs.getString("adhar_url"));
            u.setBonafideUrl(rs.getString("bonafide_url"));
            u.setAadhaarNumber(rs.getString("aadhaar_number"));
            return u;
        });
    }

    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            User u = new User();
            u.setId(rs.getInt("id"));
            u.setName(rs.getString("name"));
            u.setEmail(rs.getString("email"));
            u.setPassword(rs.getString("password"));
            u.setRole(rs.getString("role"));
            u.setPhone(rs.getString("phone"));
            u.setActive(rs.getBoolean("active"));
            u.setAdharUrl(rs.getString("adhar_url"));
            u.setBonafideUrl(rs.getString("bonafide_url"));
            u.setPhotoUrl(rs.getString("photo_url"));
            u.setAddress(rs.getString("address"));
            u.setAadhaarNumber(rs.getString("aadhaar_number"));
            return u;
        }, email);
    }

    public User findById(int id) {
        String sql = "SELECT * FROM users WHERE id = ?";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            User u = new User();
            u.setId(rs.getInt("id"));
            u.setName(rs.getString("name"));
            u.setEmail(rs.getString("email"));
            u.setRole(rs.getString("role"));
            u.setPhone(rs.getString("phone"));
            u.setAdharUrl(rs.getString("adhar_url"));
            u.setBonafideUrl(rs.getString("bonafide_url"));
            u.setPhotoUrl(rs.getString("photo_url"));
            u.setAddress(rs.getString("address"));
            u.setAadhaarNumber(rs.getString("aadhaar_number"));
            return u;
        }, id);
    }

    public User getProfileByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            User u = new User();
            u.setId(rs.getInt("id"));
            u.setName(rs.getString("name"));
            u.setEmail(rs.getString("email"));
            u.setRole(rs.getString("role"));
            u.setPhone(rs.getString("phone"));
            u.setAdharUrl(rs.getString("adhar_url"));
            u.setBonafideUrl(rs.getString("bonafide_url"));
            u.setPhotoUrl(rs.getString("photo_url"));
            u.setAddress(rs.getString("address"));
            u.setAadhaarNumber(rs.getString("aadhaar_number"));
            return u;
        }, email);
    }

    public String getRoleByEmail(String email) {
        String sql = "SELECT role FROM users WHERE email = ?";

        try {
            return jdbcTemplate.queryForObject(sql, String.class, email);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public void deactivateUser(int userId) {
        String sql = "UPDATE users SET active = false WHERE id = ?";
        jdbcTemplate.update(sql, userId);
    }

    public void updateDocuments(int userId, String adharUrl, String bonafideUrl, String photoUrl) {
        String sql = "UPDATE users SET adhar_url = ?, bonafide_url = ?, photo_url = ? WHERE id = ?";
        jdbcTemplate.update(sql, adharUrl, bonafideUrl, photoUrl, userId);
    }

    public void updateAddress(int userId, String address) {
        String sql = "UPDATE users SET address = ? WHERE id = ?";
        jdbcTemplate.update(sql, address, userId);
    }

    public void updateRole(String email, String role) {
        String sql = "UPDATE users SET role = ? WHERE email = ?";
        jdbcTemplate.update(sql, role, email);
    }

    public void updateAadhaarNumber(int userId, String aadhaarNumber) {
        String sql = "UPDATE users SET aadhaar_number = ? WHERE id = ?";
        jdbcTemplate.update(sql, aadhaarNumber, userId);
    }
}
