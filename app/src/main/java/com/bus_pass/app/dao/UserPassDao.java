package com.bus_pass.app.dao;

import com.bus_pass.app.model.UserPass;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class UserPassDao {

    private final JdbcTemplate jdbcTemplate;

    public UserPassDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsByApplicationId(int applicationId) {
        String sql = "SELECT COUNT(*) FROM user_passes WHERE application_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, applicationId);
        return count != null && count > 0;
    }

    public void create(int userId, int applicationId, String passType, LocalDate endDate) {
        String passNumber = "PASS-" + System.currentTimeMillis();
        LocalDate startDate = LocalDate.now();

        String sql = """
                    INSERT INTO user_passes
                    (user_id, application_id, pass_number, pass_type, start_date, end_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                """;

        jdbcTemplate.update(sql, userId, applicationId, passNumber, passType, startDate, endDate);
    }

    public UserPass findByUserEmail(String email) {
        String sql = """
                    SELECT up.*, u.photo_url, u.name
                    FROM user_passes up
                    JOIN bus_pass_applications ba ON up.application_id = ba.id
                    JOIN users u ON ba.user_id = u.id
                    WHERE u.email = ?
                """;

        return jdbcTemplate.query(sql, rs -> {
            if (!rs.next())
                return null;

            UserPass pass = new UserPass();
            pass.setId(rs.getInt("id"));
            pass.setUserId(rs.getInt("user_id"));
            pass.setApplicationId(rs.getInt("application_id"));
            pass.setPassType(rs.getString("pass_type"));
            pass.setPassNumber(rs.getString("pass_number"));
            pass.setStartDate(rs.getDate("start_date").toLocalDate());
            pass.setEndDate(rs.getDate("end_date").toLocalDate());
            pass.setStatus(rs.getString("status"));
            pass.setPhotoUrl(rs.getString("photo_url"));
            pass.setUserName(rs.getString("name"));
            return pass;
        }, email);
    }

    public List<UserPass> findAll() {
        String sql = """
                    SELECT up.id, up.user_id, up.application_id, up.pass_number, up.pass_type, up.start_date, up.end_date,
                           u.email, u.role
                    FROM user_passes up
                    JOIN bus_pass_applications bpa ON up.application_id = bpa.id
                    JOIN users u ON bpa.user_id = u.id
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            UserPass pass = new UserPass();
            pass.setId(rs.getInt("id"));
            pass.setUserId(rs.getInt("user_id"));
            pass.setApplicationId(rs.getInt("application_id"));
            pass.setPassType(rs.getString("pass_type"));
            pass.setPassNumber(rs.getString("pass_number"));
            pass.setStartDate(rs.getDate("start_date").toLocalDate());
            pass.setEndDate(rs.getDate("end_date").toLocalDate());
            return pass;
        });
    }

    /**
     * Finds the most recent pass for a user (1 user = 1 active pass).
     * Returns the latest pass by end_date so we can check expiry.
     */
    public UserPass findActiveByUserId(int userId) {
        String sql = """
                    SELECT * FROM user_passes
                    WHERE user_id = ?
                    ORDER BY end_date DESC
                    LIMIT 1
                """;

        return jdbcTemplate.query(sql, rs -> {
            if (!rs.next())
                return null;

            UserPass pass = new UserPass();
            pass.setId(rs.getInt("id"));
            pass.setUserId(rs.getInt("user_id"));
            pass.setApplicationId(rs.getInt("application_id"));
            pass.setPassType(rs.getString("pass_type"));
            pass.setPassNumber(rs.getString("pass_number"));
            pass.setStartDate(rs.getDate("start_date").toLocalDate());
            pass.setEndDate(rs.getDate("end_date").toLocalDate());
            pass.setStatus(rs.getString("status"));
            return pass;
        }, userId);
    }

    /**
     * Update the status of a user pass (e.g., mark as EXPIRED).
     */
    public void updateStatus(int passId, String status) {
        String sql = "UPDATE user_passes SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, passId);
    }

}
