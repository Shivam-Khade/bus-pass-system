package com.bus_pass.app.dao;

import com.bus_pass.app.model.BusPassApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BusPassDao {

    private final JdbcTemplate jdbcTemplate;

    public BusPassDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void apply(BusPassApplication app) {
        String sql = """
                    INSERT INTO bus_pass_applications (user_id, pass_type, status)
                    VALUES (?, ?, ?)
                """;

        jdbcTemplate.update(
                sql,
                app.getUserId(),
                app.getPassType(),
                app.getStatus());
    }

    public List<BusPassApplication> getAllApplications() {
        String sql = """
                    SELECT b.*, p.status AS payment_status,
                           up.start_date, up.end_date,
                           u.photo_url
                    FROM bus_pass_applications b
                    LEFT JOIN payments p ON b.id = p.application_id
                    LEFT JOIN user_passes up ON b.id = up.application_id
                    LEFT JOIN users u ON b.user_id = u.id
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            BusPassApplication app = new BusPassApplication();
            app.setId(rs.getInt("id"));
            app.setUserId(rs.getInt("user_id"));
            app.setPassType(rs.getString("pass_type"));
            app.setStatus(rs.getString("status"));
            app.setPaymentStatus(rs.getString("payment_status"));
            app.setPhotoUrl(rs.getString("photo_url"));

            java.sql.Date startDate = rs.getDate("start_date");
            if (startDate != null) {
                app.setStartDate(startDate.toLocalDate());
            }

            java.sql.Date endDate = rs.getDate("end_date");
            if (endDate != null) {
                app.setEndDate(endDate.toLocalDate());
            }

            return app;
        });
    }

    public void updateStatus(int id, String status) {
        String sql = "UPDATE bus_pass_applications SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, id);
    }

    public String getStatus(int applicationId) {
        String sql = """
                    SELECT status
                    FROM bus_pass_applications
                    WHERE id = ?
                """;

        return jdbcTemplate.queryForObject(sql, String.class, applicationId);
    }

    public String getPassType(int applicationId) {
        String sql = """
                    SELECT pass_type
                    FROM bus_pass_applications
                    WHERE id = ?
                """;

        return jdbcTemplate.query(
                sql,
                rs -> rs.next() ? rs.getString("pass_type") : null,
                applicationId);
    }

    public Integer getUserId(int applicationId) {
        String sql = "SELECT user_id FROM bus_pass_applications WHERE id = ?";
        return jdbcTemplate.query(sql, rs -> rs.next() ? rs.getInt("user_id") : null, applicationId);
    }

    public java.util.List<com.bus_pass.app.dto.BusPassApplicationResponse> getAllApplicationsWithUserDetails() {
        String sql = """
                    SELECT b.id AS application_id, b.user_id, b.pass_type, b.status,
                           u.name, u.email, u.role, u.adhar_url, u.bonafide_url, u.photo_url,
                           up.start_date, up.end_date
                    FROM bus_pass_applications b
                    JOIN users u ON b.user_id = u.id
                    LEFT JOIN user_passes up ON b.id = up.application_id
                    ORDER BY b.id DESC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            com.bus_pass.app.dto.BusPassApplicationResponse app = new com.bus_pass.app.dto.BusPassApplicationResponse();
            app.setId(rs.getInt("application_id"));
            app.setUserId(rs.getInt("user_id"));
            app.setPassType(rs.getString("pass_type"));
            app.setStatus(rs.getString("status"));

            app.setUserName(rs.getString("name"));
            app.setUserEmail(rs.getString("email"));
            app.setUserRole(rs.getString("role"));
            app.setAdharUrl(rs.getString("adhar_url"));
            app.setBonafideUrl(rs.getString("bonafide_url"));
            app.setPhotoUrl(rs.getString("photo_url"));

            java.sql.Date startDate = rs.getDate("start_date");
            if (startDate != null) {
                app.setStartDate(startDate.toLocalDate());
            }

            java.sql.Date endDate = rs.getDate("end_date");
            if (endDate != null) {
                app.setEndDate(endDate.toLocalDate());
            }

            return app;
        });
    }
}