USE taskifyDb;

CREATE SCHEMA info;


CREATE TABLE info.Company (
    com_id INT IDENTITY(1,1) PRIMARY KEY,
    com_name VARCHAR(100) NOT NULL,
    mob_number VARCHAR(15),            -- better than INT for phone (handles +91, leading 0, etc.)
    com_size INT NOT NULL,             -- number of employees in company
    approved BIT DEFAULT 0,            -- 0 = not approved, 1 = approved
    max_users INT DEFAULT 5,           -- free tier limit
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    updated_at DATETIME2 DEFAULT SYSDATETIME()
);


    



