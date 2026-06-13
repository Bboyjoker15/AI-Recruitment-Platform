-- Alinear columnas de interviews con la especificación del dominio
ALTER TABLE interviews RENAME COLUMN scheduled_at TO interview_date;
ALTER TABLE interviews RENAME COLUMN feedback TO notes;
