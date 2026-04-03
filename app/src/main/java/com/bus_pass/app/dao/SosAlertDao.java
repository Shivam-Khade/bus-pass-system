package com.bus_pass.app.dao;

import com.bus_pass.app.model.SosAlert;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class SosAlertDao {

    private final JdbcTemplate jdbcTemplate;

    public SosAlertDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(SosAlert alert) {
        String sql = """
                INSERT INTO sos_alerts (user_id, latitude, longitude, message, status)
                VALUES (?, ?, ?, ?, 'ACTIVE')
                """;

        jdbcTemplate.update(sql,
                alert.getUserId(),
                alert.getLatitude(),
                alert.getLongitude(),
                alert.getMessage());
    }

    public List<SosAlert> findAll() {
        String sql = """
                SELECT s.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
                FROM sos_alerts s
                JOIN users u ON s.user_id = u.id
                ORDER BY s.created_at DESC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            SosAlert alert = new SosAlert();
            alert.setId(rs.getInt("id"));
            alert.setUserId(rs.getInt("user_id"));
            alert.setLatitude(rs.getDouble("latitude"));
            alert.setLongitude(rs.getDouble("longitude"));
            alert.setMessage(rs.getString("message"));
            alert.setStatus(rs.getString("status"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                alert.setCreatedAt(createdAt.toLocalDateTime());
            }

            Timestamp resolvedAt = rs.getTimestamp("resolved_at");
            if (resolvedAt != null) {
                alert.setResolvedAt(resolvedAt.toLocalDateTime());
            }

            alert.setUserName(rs.getString("user_name"));
            alert.setUserEmail(rs.getString("user_email"));
            alert.setUserPhone(rs.getString("user_phone"));
            return alert;
        });
    }

    public List<SosAlert> findActiveAlerts() {
        String sql = """
                SELECT s.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
                FROM sos_alerts s
                JOIN users u ON s.user_id = u.id
                WHERE s.status = 'ACTIVE'
                ORDER BY s.created_at DESC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            SosAlert alert = new SosAlert();
            alert.setId(rs.getInt("id"));
            alert.setUserId(rs.getInt("user_id"));
            alert.setLatitude(rs.getDouble("latitude"));
            alert.setLongitude(rs.getDouble("longitude"));
            alert.setMessage(rs.getString("message"));
            alert.setStatus(rs.getString("status"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                alert.setCreatedAt(createdAt.toLocalDateTime());
            }

            alert.setUserName(rs.getString("user_name"));
            alert.setUserEmail(rs.getString("user_email"));
            alert.setUserPhone(rs.getString("user_phone"));
            return alert;
        });
    }

    public void resolveAlert(int alertId) {
        String sql = "UPDATE sos_alerts SET status = 'RESOLVED', resolved_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, alertId);
    }

    public int countActiveAlerts() {
        String sql = "SELECT COUNT(*) FROM sos_alerts WHERE status = 'ACTIVE'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }
}
