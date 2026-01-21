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

-- 2. Task Statuses (per company)
CREATE TABLE master.task_status (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    com_id INT NOT NULL,
    status_name NVARCHAR(100) NOT NULL, -- To-do, In-progress, Done, Blocked
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_task_status_company FOREIGN KEY (com_id) REFERENCES info.company(com_id)
);

-- 3. Task Priorities (per company)
CREATE TABLE master.priority (
    priority_id INT IDENTITY(1,1) PRIMARY KEY,
    com_id INT NOT NULL,
    priority_name NVARCHAR(50) NOT NULL, -- Low, Medium, High, Urgent
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_priority_company FOREIGN KEY (com_id) REFERENCES info.company(com_id)
);
