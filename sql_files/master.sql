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
