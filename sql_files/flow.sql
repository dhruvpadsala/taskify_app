SELECT * FROM master.Role

SELECT * from info.Company

SELECT * FROM auth.users 

SELECT * FROM auth.employee

SELECT * FROM auth.[login]





update info.Company set approved=1 WHERE com_id=1

SELECT * FROM auth.[login] ORDER by created_at DESC

(SELECT COUNT(1) AS companyExists FROM info.company WHERE com_id = 1 and approved=1) 

