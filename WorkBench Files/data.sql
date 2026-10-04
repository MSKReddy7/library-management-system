-- ============================================================
-- 1. INSERT PUBLISHERS
-- ============================================================

INSERT INTO PUBLISHER
(publisher_name, email, phone, address)
VALUES
('Penguin Random House', 'contact@penguin.com', '9876543210', 'New Delhi'),
('Oxford University Press', 'info@oup.com', '9876543211', 'Hyderabad'),
('Pearson Education', 'support@pearson.com', '9876543212', 'Bangalore');


-- ============================================================
-- 2. INSERT CATEGORIES
-- ============================================================

INSERT INTO CATEGORY
(category_name, description)
VALUES
('Programming', 'Books related to programming and software development'),
('Database', 'Books related to databases and SQL'),
('Computer Networks', 'Books related to networking and communication');


-- ============================================================
-- 3. INSERT AUTHORS
-- ============================================================

INSERT INTO AUTHOR
(author_name, email, country)
VALUES
('Bjarne Stroustrup', 'bjarne@example.com', 'Denmark'),
('Robert C. Martin', 'robert@example.com', 'USA'),
('Ramez Elmasri', 'ramez@example.com', 'USA'),
('Andrew S. Tanenbaum', 'andrew@example.com', 'Netherlands');


-- ============================================================
-- 4. INSERT MEMBERS
-- ============================================================

INSERT INTO MEMBER
(name, email, phone, address, membership_date, status)
VALUES
('Manoj Reddy', 'manoj@example.com', '9876500001',
 'Kakinada, Andhra Pradesh', '2026-01-10', 'ACTIVE'),

('Rahul Kumar', 'rahul@example.com', '9876500002',
 'Hyderabad, Telangana', '2026-02-15', 'ACTIVE'),

('Priya Sharma', 'priya@example.com', '9876500003',
 'Bangalore, Karnataka', '2026-03-20', 'ACTIVE');


-- ============================================================
-- 5. INSERT BOOKS
-- ============================================================

INSERT INTO BOOK
(title, isbn, publication_year, edition, language,
 publisher_id, category_id)
VALUES
('The C++ Programming Language',
 '9780321563842',
 2013,
 4,
 'English',
 1,
 1),

('Clean Code',
 '9780132350884',
 2008,
 1,
 'English',
 3,
 1),

('Fundamentals of Database Systems',
 '9780133970777',
 2016,
 7,
 'English',
 3,
 2),

('Computer Networks',
 '9780132126953',
 2010,
 5,
 'English',
 2,
 3);


-- ============================================================
-- 6. INSERT BOOK_AUTHOR
-- ============================================================

INSERT INTO BOOK_AUTHOR
(book_id, author_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);


-- ============================================================
-- 7. INSERT BOOK COPIES
-- ============================================================

INSERT INTO BOOK_COPY
(book_id, accession_no, purchase_date, price, status)
VALUES
(1, 'ACC001', '2026-01-05', 850.00, 'AVAILABLE'),

(1, 'ACC002', '2026-01-05', 850.00, 'BORROWED'),

(2, 'ACC003', '2026-01-15', 650.00, 'AVAILABLE'),

(3, 'ACC004', '2026-02-10', 900.00, 'AVAILABLE'),

(4, 'ACC005', '2026-02-20', 750.00, 'BORROWED');


-- ============================================================
-- 8. INSERT LOANS
-- ============================================================

INSERT INTO LOAN
(member_id, copy_id, issue_date, due_date, return_date, status)
VALUES
(1, 2, '2026-08-01', '2026-08-15', NULL, 'OVERDUE'),

(2, 5, '2026-08-05', '2026-08-19', NULL, 'OVERDUE'),

(3, 3, '2026-08-10', '2026-08-24', '2026-08-20', 'RETURNED');


-- ============================================================
-- 9. INSERT FINES
-- ============================================================

INSERT INTO FINE
(loan_id, amount, reason, fine_date, paid_date, status)
VALUES
(1, 100.00, 'Book returned late',
 '2026-08-16', NULL, 'UNPAID'),

(2, 150.00, 'Book returned late',
 '2026-08-20', NULL, 'UNPAID'),

(3, 50.00, 'Late return',
 '2026-08-21', '2026-08-22', 'PAID');