-- CREATE db
CREATE DATABASE taskifyDb;
GO

-- USE DB
USE taskifyDb;
GO

-- CREATE SCHEMA
CREATE SCHEMA master;

-- CRETAE TABLE MASTER OS
CREATE TABLE master.os(
    device_type_id INTEGER IDENTITY(1,1) PRIMARY KEY,
    device_name NVARCHAR(50) not null,
    is_active BIT not NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSDATETIME()
)

INSERT INTO master.os (device_name) VALUES
('Android'),
('iOS');

SELECT * from master.os


-- CRETAE TABLE MASTER ROLE

CREATE TABLE master.role(
    role_id INTEGER IDENTITY(1,1) PRIMARY KEY ,
    role_name NVARCHAR(50) not null,
    is_active BIT DEFAULT 1,
)

INSERT INTO master.role (role_name) VALUES
('Owner'),
('Admin'),
('Agile Facilitator'),
('Employee');

SELECT * FROM master.role


CREATE TABLE MASTER.permission(
    perm_id INTEGER IDENTITY(1,1) PRIMARY KEY ,
    perm_key nvarchar(50) NOT NULL,
    perm_name nvarchar(50) NOT NULL ,
    created_at DATETIME2 DEFAULT SYSDATETIME()
)

INSERT INTO MASTER.permission (perm_key, perm_name)
VALUES 
('REG_USER', 'Register User');

SELECT * from MASTER.permission


CREATE TABLE master.role_permision(
    role_id INT NOT NULL,
    perm_id INT NOT NULL,
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT PK_role_permission PRIMARY key (role_id ,perm_id),
    CONSTRAINT FK_role_permission_role FOREIGN KEY (role_id) REFERENCES master.role(role_id),
    CONSTRAINT FK_role_permission_permission FOREIGN KEY (perm_id) REFERENCES master.permission(perm_id),
)

INSERT into master.role_permision (role_id,perm_id) VALUES (1,1)

SELECT * FROM master.role_permision


-- ================= MASTER TABLES (Company-Specific) =================

-- 1. Task Types (per company)
CREATE TABLE master.task_type (
    type_id INT IDENTITY(1,1) PRIMARY KEY,
    com_id INT NOT NULL,
    type_name NVARCHAR(100) NOT NULL, -- e.g. UI, API, QA
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_task_type_company FOREIGN KEY (com_id) REFERENCES info.company(com_id)
);

INSERT INTO master.task_type (com_id, type_name, is_active, created_at) VALUES
(1, 'UI', 1, CURRENT_TIMESTAMP),
(1, 'UI-App', 1, CURRENT_TIMESTAMP),
(1, 'QA', 1, CURRENT_TIMESTAMP);


select * from master.task_type

-- 2. Task Statuses (per company)
CREATE TABLE master.task_status (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    com_id INT NOT NULL,
    status_name NVARCHAR(100) NOT NULL, -- To-do, In-progress, Done, Blocked
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_task_status_company FOREIGN KEY (com_id) REFERENCES info.company(com_id)
);

INSERT INTO master.task_status (com_id, status_name, is_active, created_at) VALUES
(1, 'To-do', 1, CURRENT_TIMESTAMP),
(1, 'In-progress', 1, CURRENT_TIMESTAMP),
(1, 'Done', 1, CURRENT_TIMESTAMP);

select * from master.task_status

-- 3. Task Priorities (per company)
CREATE TABLE master.priority (
    priority_id INT IDENTITY(1,1) PRIMARY KEY,
    com_id INT NOT NULL,
    priority_name NVARCHAR(50) NOT NULL, -- Low, Medium, High, Urgent
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_priority_company FOREIGN KEY (com_id) REFERENCES info.company(com_id)
);

INSERT INTO master.priority (com_id, priority_name, is_active, created_at) VALUES
(1, 'Low', 1, CURRENT_TIMESTAMP),
(1, 'Medium', 1, CURRENT_TIMESTAMP),
(1, 'High', 1, CURRENT_TIMESTAMP),
(1, 'Urgent', 1, CURRENT_TIMESTAMP);

select * from master.priority