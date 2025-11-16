-- Kurser
INSERT INTO courses (code, name) VALUES
('D0031N', 'Systemvetenskap – Web Services'),
('T0001N', 'Exempelkurs A')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Moduler
INSERT INTO modules (course_id, code, name, active)
SELECT id, '0005', 'Inlämningsuppgift', 1 FROM courses WHERE code='D0031N';

INSERT INTO modules (course_id, code, name, active)
SELECT id, '0007', 'Tentamen', 1 FROM courses WHERE code='D0031N';

-- Studenter
INSERT INTO students (username, personnummer, first_name, last_name) VALUES
('sveedz-4', '19940613-2345', 'Sara', 'Svensson'),
('olrut-9', '19980202-1122', 'Oliver', 'Rutström'),
('alkij-7', '19970505-5566', 'Albin', 'Johansson')
ON DUPLICATE KEY UPDATE
  personnummer=VALUES(personnummer),
  first_name=VALUES(first_name),
  last_name=VALUES(last_name);

-- Assessment (Canvas-uppgift)
INSERT INTO assessments (course_id, assignment, student_id, remark)
SELECT c.id, 'Inlämningsuppgift 1', s.id, 'Godkänd'
FROM courses c
JOIN students s ON s.username IN ('sveedz-4','olrut-9','alkij-7')
WHERE c.code='D0031N';
