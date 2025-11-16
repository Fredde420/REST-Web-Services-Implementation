DROP TABLE IF EXISTS ladok_results;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS courses;

-- ----------------------------------------------
-- Kurser (t.ex. D0031N)
-- ----------------------------------------------
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- Moduler i kurs (t.ex. 0005 Inlämningsuppgift)
-- ----------------------------------------------
CREATE TABLE modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_modules_course FOREIGN KEY(course_id)
    REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT uq_module_per_course UNIQUE(course_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- Studenter
-- ----------------------------------------------
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  personnummer VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- Canvas-koppling (uppgift ↔ student ↔ kurs)
-- ----------------------------------------------
CREATE TABLE assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  assignment VARCHAR(255) NOT NULL,
  student_id INT NOT NULL,
  remark VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assess_course FOREIGN KEY(course_id)
    REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_assess_student FOREIGN KEY(student_id)
    REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- Ladok-resultat (U/G/VG)
-- ----------------------------------------------
CREATE TABLE ladok_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personnummer VARCHAR(20) NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  modul_code VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  grade ENUM('U','G','VG') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_result UNIQUE(personnummer, course_code, modul_code, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
