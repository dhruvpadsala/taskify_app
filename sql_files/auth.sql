Table users {
  id integer [pk]
  firstname varchar
  lastname varchar
  email varchar [unique]
  password_hash varchar
  roleid integer
  com_id integer
  is_active bool [default: true]
  created_at timestamp
  updated_at timestamp
}

CREATE SCHEMA auth;

CREATE TABLE auth.users (
    user_id INTEGER IDENTITY(1,1) PRIMARY KEY,   -- Auto increment user ID
    first_name VARCHAR(50) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,          -- Unique email (no duplicates)
    password_hash VARCHAR(255) NOT NULL,         -- For bcrypt/argon2 hashes
    role_id INTEGER NOT NULL,                    -- FK to master.role
    com_id INTEGER NOT NULL,                     -- FK to info.company
    is_active BIT DEFAULT 0,                     -- 0 = inactive until approved
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    updated_at DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_user_role FOREIGN KEY (role_id) REFERENCES master.role(role_id),
    CONSTRAINT FK_user_com FOREIGN KEY (com_id) REFERENCES info.company(com_id)
);


Table employees {
  emp_id integer [pk]
  user_id integer
  parent_emp_id integer [ref: > employees.emp_id] // recursive for hierarchy
  com_id integer
  created_at timestamp
  updated_at timestamp
}

CREATE TABLE auth.employee (
    emp_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    parent_emp_id INT NULL,                     -- self reference for manager/parent employee
    com_id INT NOT NULL,
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    updated_at DATETIME2 DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_employee_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id),
    CONSTRAINT FK_employee_company FOREIGN KEY (com_id) REFERENCES info.company(com_id),
    CONSTRAINT FK_employee_parent FOREIGN KEY (parent_emp_id) REFERENCES auth.employee(emp_id)
);


create Table auth.login (
  login_id INT IDENTITY(101,1) PRIMARY KEY,     -- starts at 101
  user_id INT NOT NULL,                         -- link to auth.users
  device_type_id INT NOT NULL,                  -- link to master.device_type
  token NVARCHAR(500) NOT NULL,                 -- access token
  refresh_token NVARCHAR(500) NOT NULL,         -- refresh token
  firebase_token NVARCHAR(500) NULL,            -- optional for notifications
  created_at DATETIME2 DEFAULT SYSDATETIME(),

  CONSTRAINT FK_login_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id),
  CONSTRAINT FK_login_device FOREIGN KEY (device_type_id) REFERENCES master.os(device_type_id)

)