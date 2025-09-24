CREATE TABLE project (
    project_id INT IDENTITY(1,1) PRIMARY KEY,
    com_id INT NOT NULL,
    project_name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500),
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_project_company FOREIGN KEY (com_id) REFERENCES info.company(com_id),
    CONSTRAINT FK_project_created_by FOREIGN KEY (created_by) REFERENCES auth.users(user_id)
);

INSERT INTO project (com_id, project_name, description, created_by)
VALUES (1, 'Taskify App', 'Task management app for company employees', 1);

SELECT * from project


CREATE TABLE feature (
    feature_id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT NOT NULL,
    feature_name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500),
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_feature_project FOREIGN KEY (project_id) REFERENCES project(project_id),
    CONSTRAINT FK_feature_created_by FOREIGN KEY (created_by) REFERENCES auth.users(user_id)
);

INSERT INTO feature (project_id, feature_name, description, created_by)
VALUES (1, 'UI-UX creation', 'For mobile UI-UX creation', 1);

SELECT * from feature

CREATE TABLE task (
    task_id INT IDENTITY(1,1) PRIMARY KEY,
    feature_id INT NOT NULL,
    task_name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500),
    type_id INT NOT NULL,
    status_id INT NOT NULL,
    priority_id INT NOT NULL,
    assigned_to INT NOT NULL,
    reporter_id INT NOT NULL,
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_task_feature FOREIGN KEY (feature_id) REFERENCES feature(feature_id),
    CONSTRAINT FK_task_type FOREIGN KEY (type_id) REFERENCES master.task_type(type_id),
    CONSTRAINT FK_task_status FOREIGN KEY (status_id) REFERENCES master.task_status(status_id),
    CONSTRAINT FK_task_priority FOREIGN KEY (priority_id) REFERENCES master.priority(priority_id),
    CONSTRAINT FK_task_assigned_to FOREIGN KEY (assigned_to) REFERENCES  auth.users(user_id),
    CONSTRAINT FK_task_reporter FOREIGN KEY (reporter_id)  REFERENCES auth.users(user_id)
);

select * from 
-- Insert 1 sample record
INSERT INTO task (feature_id, task_name, description, type_id, status_id, priority_id, assigned_to, reporter_id, due_date)
VALUES (1, 'Design Task Form', 'Create UI for task input with type, status, and priority selection', 1, 1, 2, 1, 1, DATEADD(DAY, 7, GETDATE()));




