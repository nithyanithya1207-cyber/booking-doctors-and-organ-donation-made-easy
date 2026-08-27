-- =====================================================================
-- MediLink — MySQL schema for XAMPP (phpMyAdmin)
-- Import this file in phpMyAdmin, or run:
--   mysql -u root < medilink.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS medilink
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medilink;

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  phone         VARCHAR(30)  DEFAULT NULL,
  city          VARCHAR(80)  DEFAULT NULL,
  blood_group   VARCHAR(5)   DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- user_roles (roles NEVER stored on users table) ----------
CREATE TABLE IF NOT EXISTS user_roles (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role    ENUM('admin','doctor','patient','donor') NOT NULL,
  UNIQUE KEY uniq_user_role (user_id, role),
  CONSTRAINT fk_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- doctors ----------
CREATE TABLE IF NOT EXISTS doctors (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  specialization VARCHAR(120) NOT NULL,
  hospital       VARCHAR(150) NOT NULL,
  city           VARCHAR(80)  NOT NULL,
  fee            DECIMAL(10,2) NOT NULL DEFAULT 0,
  available_days VARCHAR(60)  NOT NULL DEFAULT 'Mon-Fri',
  contact        VARCHAR(40)  DEFAULT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- donors ----------
CREATE TABLE IF NOT EXISTS donors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  age           INT DEFAULT NULL,
  blood_group   VARCHAR(5)  NOT NULL,
  organs        VARCHAR(255) NOT NULL DEFAULT '',
  city          VARCHAR(80) NOT NULL,
  phone         VARCHAR(30) DEFAULT NULL,
  medical_notes TEXT,
  available     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_donor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- organ_requests ----------
CREATE TABLE IF NOT EXISTS organ_requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  patient_id   INT NOT NULL,
  patient_name VARCHAR(120) NOT NULL,
  organ        VARCHAR(60)  NOT NULL,
  blood_group  VARCHAR(5)   NOT NULL,
  city         VARCHAR(80)  NOT NULL,
  urgency      ENUM('low','normal','high','critical') NOT NULL DEFAULT 'normal',
  status       ENUM('open','matched','closed') NOT NULL DEFAULT 'open',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_req_user FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- appointments ----------
CREATE TABLE IF NOT EXISTS appointments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  patient_id       INT NOT NULL,
  doctor_id        INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  reason           TEXT,
  status           ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_user   FOREIGN KEY (patient_id) REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id)  REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  title      VARCHAR(150) NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- Demo data
-- =====================================================================
INSERT INTO doctors (name, specialization, hospital, city, fee, available_days, contact) VALUES
  ('Dr. Ananya Sharma','Cardiology','Apollo Hospital','Delhi',900,'Mon-Fri','+91 98110 22334'),
  ('Dr. Rajesh Iyer','Nephrology','Fortis Healthcare','Mumbai',1200,'Mon-Sat','+91 98200 44556'),
  ('Dr. Meera Nair','General Medicine','KIMS Hospital','Kochi',500,'Mon-Fri','+91 98470 11223'),
  ('Dr. Vikram Singh','Orthopaedics','AIIMS','Delhi',800,'Tue-Sat','+91 98111 77889'),
  ('Dr. Priya Deshmukh','Dermatology','Ruby Hall Clinic','Pune',700,'Mon-Thu','+91 98230 66778'),
  ('Dr. Arjun Rao','Neurology','Manipal Hospital','Bengaluru',1500,'Wed-Sun','+91 98450 33445'),
  ('Dr. Fatima Khan','Paediatrics','Rainbow Children''s','Hyderabad',600,'Mon-Sat','+91 98490 55667'),
  ('Dr. Sanjay Gupta','Gastroenterology','Medanta','Gurugram',1100,'Mon-Fri','+91 98100 99001');

-- Demo admin account — email: admin@medilink.test  password: admin123
INSERT INTO users (email, password_hash, full_name, phone, city, blood_group)
VALUES ('admin@medilink.test', '$2y$10$e0NRxs5m4V0GaP0R6oQ0y.pP4LhVvRZ0m5R8h4t2yV1n0Q8dq2Rk6',
        'MediLink Admin', '+91 90000 00000', 'Delhi', 'O+');
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM users WHERE email = 'admin@medilink.test';
INSERT INTO user_roles (user_id, role)
SELECT id, 'patient' FROM users WHERE email = 'admin@medilink.test';
