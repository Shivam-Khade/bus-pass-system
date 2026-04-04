package com.bus_pass.app.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@Order(1)
public class DatabaseFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking database schema integrity...");

        // 0. Ensure base tables exist before anything else
        String createUsersSql = """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) NOT NULL,
                    phone VARCHAR(15),
                    active BOOLEAN DEFAULT TRUE,
                    photo_url VARCHAR(255) DEFAULT NULL,
                    adhar_url VARCHAR(255) DEFAULT NULL,
                    bonafide_url VARCHAR(255) DEFAULT NULL,
                    address TEXT DEFAULT NULL,
                    aadhaar_number VARCHAR(255) DEFAULT NULL
                );
                """;
        jdbcTemplate.execute(createUsersSql);

        String createAppsSql = """
                CREATE TABLE IF NOT EXISTS bus_pass_applications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    pass_type VARCHAR(20) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );
                """;
        jdbcTemplate.execute(createAppsSql);

        // 1. Check and Fix 'payments' table
        try {
            jdbcTemplate.execute("SELECT 1 FROM payments LIMIT 1");
        } catch (Exception e) {
            System.out.println("'payments' table missing. Creating...");
            String createPaymentsSql = """
                        CREATE TABLE IF NOT EXISTS payments (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            application_id INT NOT NULL,
                            amount DOUBLE NOT NULL,
                            status VARCHAR(20) DEFAULT 'UNPAID',
                            payment_date TIMESTAMP,
                            FOREIGN KEY (application_id) REFERENCES bus_pass_applications(id)
                        );
                    """;
            jdbcTemplate.execute(createPaymentsSql);
            System.out.println("'payments' table created.");
        }

        // 2. Add Razorpay columns to payments table if they don't exist
        try {
            jdbcTemplate.execute("SELECT razorpay_order_id FROM payments LIMIT 1");
            System.out.println("Razorpay columns already exist.");
        } catch (Exception e) {
            System.out.println("Adding Razorpay columns to payments table...");
            try {
                jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN razorpay_order_id VARCHAR(255)");
                jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN razorpay_payment_id VARCHAR(255)");
                jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN razorpay_signature VARCHAR(255)");
                System.out.println("Razorpay columns added successfully.");
            } catch (Exception ex) {
                System.err.println("Failed to add Razorpay columns: " + ex.getMessage());
            }
        }

        // 3. Check and Fix 'user_passes' table
        try {
            // Check if 'user_id' column exists
            List<String> columns = jdbcTemplate.query(
                    "SHOW COLUMNS FROM user_passes LIKE 'user_id'",
                    (rs, rowNum) -> rs.getString(1));

            if (columns.isEmpty()) {
                System.out.println("Schema mismatch detected in 'user_passes': missing 'user_id'. Recreating table...");
                fixUserPassesTable();
            } else {
                System.out.println("'user_passes' schema is correct.");
            }
        } catch (Exception e) {
            // Table likely doesn't exist or other error, try to create/fix
            System.out.println("Error checking 'user_passes' (" + e.getMessage() + "). Recreating table...");
            fixUserPassesTable();
        }

        // 4. Check and Fix 'users' table (Add missing columns)
        String[] columnsToAdd = { "photo_url", "adhar_url", "bonafide_url", "address", "aadhaar_number" };
        for (String col : columnsToAdd) {
            try {
                List<String> columns = jdbcTemplate.query(
                        "SHOW COLUMNS FROM users LIKE '" + col + "'",
                        (rs, rowNum) -> rs.getString(1));

                if (columns.isEmpty()) {
                    System.out.println("Schema update: Adding '" + col + "' to 'users' table...");
                    String sqlType = (col.equals("address")) ? "TEXT DEFAULT NULL" : "VARCHAR(255) DEFAULT NULL";
                    jdbcTemplate.execute("ALTER TABLE users ADD COLUMN " + col + " " + sqlType);
                    System.out.println("'" + col + "' column added.");
                }
            } catch (Exception e) {
                System.err.println("Error checking/updating 'users' table for " + col + ": " + e.getMessage());
            }
        }

        // 6. Check and Fix 'sos_alerts' table
        try {
            jdbcTemplate.execute("SELECT 1 FROM sos_alerts LIMIT 1");
            System.out.println("'sos_alerts' table exists.");
        } catch (Exception e) {
            System.out.println("'sos_alerts' table missing. Creating...");
            String createSosAlertsSql = """
                        CREATE TABLE IF NOT EXISTS sos_alerts (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id INT NOT NULL,
                            latitude DOUBLE NOT NULL,
                            longitude DOUBLE NOT NULL,
                            message VARCHAR(500),
                            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            resolved_at TIMESTAMP NULL,
                            FOREIGN KEY (user_id) REFERENCES users(id)
                        );
                    """;
            jdbcTemplate.execute(createSosAlertsSql);
            System.out.println("'sos_alerts' table created successfully.");
        }
    }

    private void fixUserPassesTable() {
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS user_passes");

            String createUserPassesSql = """
                        CREATE TABLE IF NOT EXISTS user_passes (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id INT NOT NULL,
                            application_id INT NOT NULL,
                            pass_number VARCHAR(50) UNIQUE NOT NULL,
                            pass_type VARCHAR(20) NOT NULL,
                            start_date DATE NOT NULL,
                            end_date DATE NOT NULL,
                            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                            FOREIGN KEY (user_id) REFERENCES users(id),
                            FOREIGN KEY (application_id) REFERENCES bus_pass_applications(id)
                        );
                    """;
            jdbcTemplate.execute(createUserPassesSql);
            System.out.println("'user_passes' table recreated successfully.");
        } catch (Exception e) {
            System.err.println("Failed to recreate 'user_passes' table: " + e.getMessage());
        }
    }
}
