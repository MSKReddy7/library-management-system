-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM
-- COMPLETE SQL QUERY COLLECTION
-- MySQL 8+
-- ============================================================


-- ============================================================
-- SECTION 1 : BASIC SELECT QUERIES
-- ============================================================


-- 1. Display all publishers

SELECT *
FROM PUBLISHER;


-- 2. Display all categories

SELECT *
FROM CATEGORY;


-- 3. Display all authors

SELECT *
FROM AUTHOR;


-- 4. Display all books

SELECT *
FROM BOOK;


-- 5. Display all book copies

SELECT *
FROM BOOK_COPY;


-- 6. Display all members

SELECT *
FROM MEMBER;


-- 7. Display all loans

SELECT *
FROM LOAN;


-- 8. Display all fines

SELECT *
FROM FINE;


-- 9. Display only book titles

SELECT title
FROM BOOK;


-- 10. Display book title and ISBN

SELECT title, isbn
FROM BOOK;


-- 11. Display member names and emails

SELECT name, email
FROM MEMBER;


-- 12. Display author names and countries

SELECT author_name, country
FROM AUTHOR;


-- 13. Display book title, edition and language

SELECT title, edition, language
FROM BOOK;



-- ============================================================
-- SECTION 2 : DISTINCT
-- ============================================================


-- 14. Display all different languages

SELECT DISTINCT language
FROM BOOK;


-- 15. Display all different countries of authors

SELECT DISTINCT country
FROM AUTHOR;


-- 16. Display all different book statuses

SELECT DISTINCT status
FROM BOOK_COPY;



-- ============================================================
-- SECTION 3 : WHERE CONDITIONS
-- ============================================================


-- 17. Find books published after 2010

SELECT *
FROM BOOK
WHERE publication_year > 2010;


-- 18. Find books published before 2015

SELECT *
FROM BOOK
WHERE publication_year < 2015;


-- 19. Find books published in 2010

SELECT *
FROM BOOK
WHERE publication_year = 2010;


-- 20. Find books whose edition is greater than 2

SELECT *
FROM BOOK
WHERE edition > 2;


-- 21. Find books whose price is greater than 700

SELECT *
FROM BOOK_COPY
WHERE price > 700;


-- 22. Find books whose price is less than 800

SELECT *
FROM BOOK_COPY
WHERE price < 800;


-- 23. Find active members

SELECT *
FROM MEMBER
WHERE status = 'ACTIVE';


-- 24. Find inactive members

SELECT *
FROM MEMBER
WHERE status = 'INACTIVE';


-- 25. Find available copies

SELECT *
FROM BOOK_COPY
WHERE status = 'AVAILABLE';


-- 26. Find borrowed copies

SELECT *
FROM BOOK_COPY
WHERE status = 'BORROWED';


-- 27. Find overdue loans

SELECT *
FROM LOAN
WHERE status = 'OVERDUE';


-- 28. Find unpaid fines

SELECT *
FROM FINE
WHERE status = 'UNPAID';



-- ============================================================
-- SECTION 4 : AND / OR / NOT
-- ============================================================


-- 29. Books published after 2010 AND edition >= 2

SELECT *
FROM BOOK
WHERE publication_year > 2010
AND edition >= 2;


-- 30. Books in English AND published after 2010

SELECT *
FROM BOOK
WHERE language = 'English'
AND publication_year > 2010;


-- 31. Members who are ACTIVE or SUSPENDED

SELECT *
FROM MEMBER
WHERE status = 'ACTIVE'
OR status = 'SUSPENDED';


-- 32. Books that are NOT English

SELECT *
FROM BOOK
WHERE language <> 'English';


-- 33. Copies that are NOT available

SELECT *
FROM BOOK_COPY
WHERE status <> 'AVAILABLE';



-- ============================================================
-- SECTION 5 : BETWEEN
-- ============================================================


-- 34. Books published between 2000 and 2020

SELECT *
FROM BOOK
WHERE publication_year BETWEEN 2000 AND 2020;


-- 35. Copies costing between 500 and 1000

SELECT *
FROM BOOK_COPY
WHERE price BETWEEN 500 AND 1000;


-- 36. Fines between 50 and 150

SELECT *
FROM FINE
WHERE amount BETWEEN 50 AND 150;



-- ============================================================
-- SECTION 6 : IN
-- ============================================================


-- 37. Books in English or Hindi

SELECT *
FROM BOOK
WHERE language IN ('English', 'Hindi');


-- 38. Members with selected statuses

SELECT *
FROM MEMBER
WHERE status IN ('ACTIVE', 'SUSPENDED');


-- 39. Copies that are available or borrowed

SELECT *
FROM BOOK_COPY
WHERE status IN ('AVAILABLE', 'BORROWED');


-- 40. Loans that are returned or overdue

SELECT *
FROM LOAN
WHERE status IN ('RETURNED', 'OVERDUE');



-- ============================================================
-- SECTION 7 : LIKE
-- ============================================================


-- 41. Books whose title starts with 'The'

SELECT *
FROM BOOK
WHERE title LIKE 'The%';


-- 42. Books whose title contains 'Code'

SELECT *
FROM BOOK
WHERE title LIKE '%Code%';


-- 43. Authors whose name starts with 'A'

SELECT *
FROM AUTHOR
WHERE author_name LIKE 'A%';


-- 44. Members whose name ends with 'a'

SELECT *
FROM MEMBER
WHERE name LIKE '%a';


-- 45. Emails belonging to Gmail

SELECT *
FROM MEMBER
WHERE email LIKE '%@gmail.com';



-- ============================================================
-- SECTION 8 : NULL OPERATIONS
-- ============================================================


-- 46. Find loans that have not been returned

SELECT *
FROM LOAN
WHERE return_date IS NULL;


-- 47. Find loans that have been returned

SELECT *
FROM LOAN
WHERE return_date IS NOT NULL;


-- 48. Find unpaid fines

SELECT *
FROM FINE
WHERE paid_date IS NULL;


-- 49. Find paid fines

SELECT *
FROM FINE
WHERE paid_date IS NOT NULL;



-- ============================================================
-- SECTION 9 : ORDER BY
-- ============================================================


-- 50. Books in ascending order of title

SELECT *
FROM BOOK
ORDER BY title ASC;


-- 51. Books in descending order of publication year

SELECT *
FROM BOOK
ORDER BY publication_year DESC;


-- 52. Copies from cheapest to most expensive

SELECT *
FROM BOOK_COPY
ORDER BY price ASC;


-- 53. Copies from most expensive to cheapest

SELECT *
FROM BOOK_COPY
ORDER BY price DESC;


-- 54. Members alphabetically

SELECT *
FROM MEMBER
ORDER BY name ASC;


-- 55. Members by newest membership

SELECT *
FROM MEMBER
ORDER BY membership_date DESC;



-- ============================================================
-- SECTION 10 : LIMIT
-- ============================================================


-- 56. Display first 3 books

SELECT *
FROM BOOK
LIMIT 3;


-- 57. Display 5 most expensive copies

SELECT *
FROM BOOK_COPY
ORDER BY price DESC
LIMIT 5;


-- 58. Display 3 newest books

SELECT *
FROM BOOK
ORDER BY publication_year DESC
LIMIT 3;



-- ============================================================
-- SECTION 11 : AGGREGATE FUNCTIONS
-- ============================================================


-- 59. Count total books

SELECT COUNT(*) AS total_books
FROM BOOK;


-- 60. Count total publishers

SELECT COUNT(*) AS total_publishers
FROM PUBLISHER;


-- 61. Count total authors

SELECT COUNT(*) AS total_authors
FROM AUTHOR;


-- 62. Count total categories

SELECT COUNT(*) AS total_categories
FROM CATEGORY;


-- 63. Count total members

SELECT COUNT(*) AS total_members
FROM MEMBER;


-- 64. Count total copies

SELECT COUNT(*) AS total_copies
FROM BOOK_COPY;


-- 65. Count total loans

SELECT COUNT(*) AS total_loans
FROM LOAN;


-- 66. Count total fines

SELECT COUNT(*) AS total_fines
FROM FINE;


-- 67. Count available copies

SELECT COUNT(*) AS available_copies
FROM BOOK_COPY
WHERE status = 'AVAILABLE';


-- 68. Count borrowed copies

SELECT COUNT(*) AS borrowed_copies
FROM BOOK_COPY
WHERE status = 'BORROWED';


-- 69. Count active members

SELECT COUNT(*) AS active_members
FROM MEMBER
WHERE status = 'ACTIVE';


-- 70. Total fine amount

SELECT SUM(amount) AS total_fine_amount
FROM FINE;


-- 71. Average book-copy price

SELECT AVG(price) AS average_price
FROM BOOK_COPY;


-- 72. Highest book-copy price

SELECT MAX(price) AS highest_price
FROM BOOK_COPY;


-- 73. Lowest book-copy price

SELECT MIN(price) AS lowest_price
FROM BOOK_COPY;


-- 74. Average fine amount

SELECT AVG(amount) AS average_fine
FROM FINE;



-- ============================================================
-- SECTION 12 : GROUP BY
-- ============================================================


-- 75. Number of books by language

SELECT language, COUNT(*) AS total_books
FROM BOOK
GROUP BY language;


-- 76. Number of books by publication year

SELECT publication_year, COUNT(*) AS total_books
FROM BOOK
GROUP BY publication_year;


-- 77. Number of copies by status

SELECT status, COUNT(*) AS total_copies
FROM BOOK_COPY
GROUP BY status;


-- 78. Number of members by status

SELECT status, COUNT(*) AS total_members
FROM MEMBER
GROUP BY status;


-- 79. Number of loans by status

SELECT status, COUNT(*) AS total_loans
FROM LOAN
GROUP BY status;


-- 80. Number of fines by status

SELECT status, COUNT(*) AS total_fines
FROM FINE
GROUP BY status;


-- 81. Total fine amount by status

SELECT status, SUM(amount) AS total_amount
FROM FINE
GROUP BY status;


-- 82. Number of authors by country

SELECT country, COUNT(*) AS total_authors
FROM AUTHOR
GROUP BY country;



-- ============================================================
-- SECTION 13 : HAVING
-- ============================================================


-- 83. Languages having more than one book

SELECT language, COUNT(*) AS total_books
FROM BOOK
GROUP BY language
HAVING COUNT(*) > 1;


-- 84. Countries having more than one author

SELECT country, COUNT(*) AS total_authors
FROM AUTHOR
GROUP BY country
HAVING COUNT(*) > 1;


-- 85. Statuses having more than one copy

SELECT status, COUNT(*) AS total_copies
FROM BOOK_COPY
GROUP BY status
HAVING COUNT(*) > 1;



-- ============================================================
-- SECTION 14 : INNER JOIN
-- ============================================================


-- 86. Books with publisher names

SELECT
    b.book_id,
    b.title,
    p.publisher_name
FROM BOOK b
INNER JOIN PUBLISHER p
    ON b.publisher_id = p.publisher_id;


-- 87. Books with category names

SELECT
    b.book_id,
    b.title,
    c.category_name
FROM BOOK b
INNER JOIN CATEGORY c
    ON b.category_id = c.category_id;


-- 88. Books with publisher and category

SELECT
    b.book_id,
    b.title,
    p.publisher_name,
    c.category_name
FROM BOOK b
INNER JOIN PUBLISHER p
    ON b.publisher_id = p.publisher_id
INNER JOIN CATEGORY c
    ON b.category_id = c.category_id;


-- 89. Books with authors

SELECT
    b.title,
    a.author_name
FROM BOOK b
INNER JOIN BOOK_AUTHOR ba
    ON b.book_id = ba.book_id
INNER JOIN AUTHOR a
    ON ba.author_id = a.author_id;


-- 90. Book copies with book names

SELECT
    bc.copy_id,
    bc.accession_no,
    b.title,
    bc.price,
    bc.status
FROM BOOK_COPY bc
INNER JOIN BOOK b
    ON bc.book_id = b.book_id;


-- 91. Loans with member names

SELECT
    l.loan_id,
    m.name AS member_name,
    l.issue_date,
    l.due_date,
    l.status
FROM LOAN l
INNER JOIN MEMBER m
    ON l.member_id = m.member_id;


-- 92. Loans with book titles

SELECT
    l.loan_id,
    m.name AS member_name,
    b.title,
    l.issue_date,
    l.due_date,
    l.return_date,
    l.status
FROM LOAN l
INNER JOIN MEMBER m
    ON l.member_id = m.member_id
INNER JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
INNER JOIN BOOK b
    ON bc.book_id = b.book_id;


-- 93. Complete loan information

SELECT
    l.loan_id,
    m.name AS member_name,
    b.title,
    bc.accession_no,
    l.issue_date,
    l.due_date,
    l.return_date,
    l.status
FROM LOAN l
INNER JOIN MEMBER m
    ON l.member_id = m.member_id
INNER JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
INNER JOIN BOOK b
    ON bc.book_id = b.book_id;



-- ============================================================
-- SECTION 15 : LEFT JOIN
-- ============================================================


-- 94. All publishers and their books

SELECT
    p.publisher_name,
    b.title
FROM PUBLISHER p
LEFT JOIN BOOK b
    ON p.publisher_id = b.publisher_id;


-- 95. All categories and their books

SELECT
    c.category_name,
    b.title
FROM CATEGORY c
LEFT JOIN BOOK b
    ON c.category_id = b.category_id;


-- 96. All books including books without authors

SELECT
    b.title,
    a.author_name
FROM BOOK b
LEFT JOIN BOOK_AUTHOR ba
    ON b.book_id = ba.book_id
LEFT JOIN AUTHOR a
    ON ba.author_id = a.author_id;


-- 97. All members and their loans

SELECT
    m.name,
    l.loan_id,
    l.status
FROM MEMBER m
LEFT JOIN LOAN l
    ON m.member_id = l.member_id;



-- ============================================================
-- SECTION 16 : FIND RECORDS WITH NO RELATED RECORDS
-- ============================================================


-- 98. Publishers having no books

SELECT
    p.publisher_id,
    p.publisher_name
FROM PUBLISHER p
LEFT JOIN BOOK b
    ON p.publisher_id = b.publisher_id
WHERE b.book_id IS NULL;


-- 99. Categories having no books

SELECT
    c.category_id,
    c.category_name
FROM CATEGORY c
LEFT JOIN BOOK b
    ON c.category_id = b.category_id
WHERE b.book_id IS NULL;


-- 100. Authors having no books

SELECT
    a.author_id,
    a.author_name
FROM AUTHOR a
LEFT JOIN BOOK_AUTHOR ba
    ON a.author_id = ba.author_id
WHERE ba.book_id IS NULL;


-- 101. Members having no loans

SELECT
    m.member_id,
    m.name
FROM MEMBER m
LEFT JOIN LOAN l
    ON m.member_id = l.member_id
WHERE l.loan_id IS NULL;



-- ============================================================
-- SECTION 17 : RIGHT JOIN
-- ============================================================


-- 102. All books and their publishers

SELECT
    p.publisher_name,
    b.title
FROM BOOK b
RIGHT JOIN PUBLISHER p
    ON b.publisher_id = p.publisher_id;


-- 103. All authors and books

SELECT
    a.author_name,
    b.title
FROM BOOK_AUTHOR ba
RIGHT JOIN AUTHOR a
    ON ba.author_id = a.author_id
LEFT JOIN BOOK b
    ON ba.book_id = b.book_id;



-- ============================================================
-- SECTION 18 : MULTI-TABLE JOINS
-- ============================================================


-- 104. Book + Author + Publisher + Category

SELECT
    b.title,
    a.author_name,
    p.publisher_name,
    c.category_name
FROM BOOK b
JOIN BOOK_AUTHOR ba
    ON b.book_id = ba.book_id
JOIN AUTHOR a
    ON ba.author_id = a.author_id
JOIN PUBLISHER p
    ON b.publisher_id = p.publisher_id
JOIN CATEGORY c
    ON b.category_id = c.category_id;


-- 105. Complete library book information

SELECT
    b.book_id,
    b.title,
    b.isbn,
    b.publication_year,
    b.edition,
    b.language,
    p.publisher_name,
    c.category_name,
    a.author_name
FROM BOOK b
JOIN PUBLISHER p
    ON b.publisher_id = p.publisher_id
JOIN CATEGORY c
    ON b.category_id = c.category_id
JOIN BOOK_AUTHOR ba
    ON b.book_id = ba.book_id
JOIN AUTHOR a
    ON ba.author_id = a.author_id;



-- ============================================================
-- SECTION 19 : BOOK COUNT LOGIC
-- ============================================================


-- 106. How many books are there?

SELECT COUNT(*) AS total_books
FROM BOOK;


-- 107. How many physical copies are there?

SELECT COUNT(*) AS total_copies
FROM BOOK_COPY;


-- 108. How many copies are available?

SELECT COUNT(*) AS available_copies
FROM BOOK_COPY
WHERE status = 'AVAILABLE';


-- 109. How many copies are currently borrowed?

SELECT COUNT(*) AS borrowed_copies
FROM BOOK_COPY
WHERE status = 'BORROWED';


-- 110. How many books does each category contain?

SELECT
    c.category_name,
    COUNT(b.book_id) AS total_books
FROM CATEGORY c
LEFT JOIN BOOK b
    ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name;


-- 111. How many books does each publisher have?

SELECT
    p.publisher_name,
    COUNT(b.book_id) AS total_books
FROM PUBLISHER p
LEFT JOIN BOOK b
    ON p.publisher_id = b.publisher_id
GROUP BY p.publisher_id, p.publisher_name;


-- 112. How many books has each author written?

SELECT
    a.author_name,
    COUNT(ba.book_id) AS total_books
FROM AUTHOR a
LEFT JOIN BOOK_AUTHOR ba
    ON a.author_id = ba.author_id
GROUP BY a.author_id, a.author_name;


-- 113. Authors who wrote more than one book

SELECT
    a.author_name,
    COUNT(ba.book_id) AS total_books
FROM AUTHOR a
JOIN BOOK_AUTHOR ba
    ON a.author_id = ba.author_id
GROUP BY a.author_id, a.author_name
HAVING COUNT(ba.book_id) > 1;



-- ============================================================
-- SECTION 20 : MEMBER / LOAN LOGIC
-- ============================================================


-- 114. How many members are there?

SELECT COUNT(*) AS total_members
FROM MEMBER;


-- 115. How many active members?

SELECT COUNT(*) AS active_members
FROM MEMBER
WHERE status = 'ACTIVE';


-- 116. Number of loans per member

SELECT
    m.name,
    COUNT(l.loan_id) AS total_loans
FROM MEMBER m
LEFT JOIN LOAN l
    ON m.member_id = l.member_id
GROUP BY m.member_id, m.name;


-- 117. Members who borrowed books

SELECT DISTINCT
    m.member_id,
    m.name
FROM MEMBER m
JOIN LOAN l
    ON m.member_id = l.member_id;


-- 118. Members who have overdue books

SELECT DISTINCT
    m.member_id,
    m.name
FROM MEMBER m
JOIN LOAN l
    ON m.member_id = l.member_id
WHERE l.status = 'OVERDUE';


-- 119. Members who have never borrowed a book

SELECT
    m.member_id,
    m.name
FROM MEMBER m
LEFT JOIN LOAN l
    ON m.member_id = l.member_id
WHERE l.loan_id IS NULL;


-- 120. Most active members by number of loans

SELECT
    m.name,
    COUNT(l.loan_id) AS total_loans
FROM MEMBER m
JOIN LOAN l
    ON m.member_id = l.member_id
GROUP BY m.member_id, m.name
ORDER BY total_loans DESC;



-- ============================================================
-- SECTION 21 : LOAN LOGIC
-- ============================================================


-- 121. Total number of loans

SELECT COUNT(*) AS total_loans
FROM LOAN;


-- 122. Number of overdue loans

SELECT COUNT(*) AS overdue_loans
FROM LOAN
WHERE status = 'OVERDUE';


-- 123. Number of returned loans

SELECT COUNT(*) AS returned_loans
FROM LOAN
WHERE status = 'RETURNED';


-- 124. Number of currently issued loans

SELECT COUNT(*) AS issued_loans
FROM LOAN
WHERE status = 'ISSUED';


-- 125. All currently borrowed books

SELECT
    m.name AS member_name,
    b.title,
    l.issue_date,
    l.due_date
FROM LOAN l
JOIN MEMBER m
    ON l.member_id = m.member_id
JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
JOIN BOOK b
    ON bc.book_id = b.book_id
WHERE l.status IN ('ISSUED', 'OVERDUE');


-- 126. All overdue books

SELECT
    m.name AS member_name,
    b.title,
    l.due_date
FROM LOAN l
JOIN MEMBER m
    ON l.member_id = m.member_id
JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
JOIN BOOK b
    ON bc.book_id = b.book_id
WHERE l.status = 'OVERDUE';



-- ============================================================
-- SECTION 22 : FINE LOGIC
-- ============================================================


-- 127. Total fines

SELECT COUNT(*) AS total_fines
FROM FINE;


-- 128. Total fine amount

SELECT SUM(amount) AS total_fine_amount
FROM FINE;


-- 129. Total unpaid fine amount

SELECT SUM(amount) AS unpaid_amount
FROM FINE
WHERE status = 'UNPAID';


-- 130. Total paid fine amount

SELECT SUM(amount) AS paid_amount
FROM FINE
WHERE status = 'PAID';


-- 131. All unpaid fines

SELECT *
FROM FINE
WHERE status = 'UNPAID';


-- 132. Members who have unpaid fines

SELECT
    m.name,
    f.amount,
    f.reason,
    f.status
FROM FINE f
JOIN LOAN l
    ON f.loan_id = l.loan_id
JOIN MEMBER m
    ON l.member_id = m.member_id
WHERE f.status = 'UNPAID';


-- 133. Complete fine information

SELECT
    f.fine_id,
    m.name AS member_name,
    b.title,
    f.amount,
    f.reason,
    f.fine_date,
    f.paid_date,
    f.status
FROM FINE f
JOIN LOAN l
    ON f.loan_id = l.loan_id
JOIN MEMBER m
    ON l.member_id = m.member_id
JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
JOIN BOOK b
    ON bc.book_id = b.book_id;



-- ============================================================
-- SECTION 23 : SUBQUERIES
-- ============================================================


-- 134. Find the most expensive copy

SELECT *
FROM BOOK_COPY
WHERE price = (
    SELECT MAX(price)
    FROM BOOK_COPY
);


-- 135. Find the cheapest copy

SELECT *
FROM BOOK_COPY
WHERE price = (
    SELECT MIN(price)
    FROM BOOK_COPY
);


-- 136. Books published in the latest publication year

SELECT *
FROM BOOK
WHERE publication_year = (
    SELECT MAX(publication_year)
    FROM BOOK
);


-- 137. Books published in the earliest publication year

SELECT *
FROM BOOK
WHERE publication_year = (
    SELECT MIN(publication_year)
    FROM BOOK
);


-- 138. Copies costing more than average price

SELECT *
FROM BOOK_COPY
WHERE price > (
    SELECT AVG(price)
    FROM BOOK_COPY
);


-- 139. Fines greater than average fine

SELECT *
FROM FINE
WHERE amount > (
    SELECT AVG(amount)
    FROM FINE
);


-- 140. Members who have at least one loan

SELECT *
FROM MEMBER
WHERE member_id IN (
    SELECT member_id
    FROM LOAN
);


-- 141. Members who have never borrowed

SELECT *
FROM MEMBER
WHERE member_id NOT IN (
    SELECT member_id
    FROM LOAN
);



-- ============================================================
-- SECTION 24 : EXISTS
-- ============================================================


-- 142. Publishers that have at least one book

SELECT *
FROM PUBLISHER p
WHERE EXISTS (
    SELECT 1
    FROM BOOK b
    WHERE b.publisher_id = p.publisher_id
);


-- 143. Categories having books

SELECT *
FROM CATEGORY c
WHERE EXISTS (
    SELECT 1
    FROM BOOK b
    WHERE b.category_id = c.category_id
);


-- 144. Authors who have written at least one book

SELECT *
FROM AUTHOR a
WHERE EXISTS (
    SELECT 1
    FROM BOOK_AUTHOR ba
    WHERE ba.author_id = a.author_id
);


-- 145. Members who have borrowed at least one book

SELECT *
FROM MEMBER m
WHERE EXISTS (
    SELECT 1
    FROM LOAN l
    WHERE l.member_id = m.member_id
);



-- ============================================================
-- SECTION 25 : CASE
-- ============================================================


-- 146. Display readable copy status

SELECT
    accession_no,
    CASE
        WHEN status = 'AVAILABLE'
            THEN 'Book is available'
        WHEN status = 'BORROWED'
            THEN 'Book is borrowed'
        WHEN status = 'LOST'
            THEN 'Book is lost'
        WHEN status = 'DAMAGED'
            THEN 'Book is damaged'
        ELSE 'Unknown'
    END AS availability
FROM BOOK_COPY;


-- 147. Display fine payment status

SELECT
    fine_id,
    amount,
    CASE
        WHEN status = 'PAID'
            THEN 'Fine Paid'
        WHEN status = 'UNPAID'
            THEN 'Fine Pending'
        ELSE 'Unknown'
    END AS payment_status
FROM FINE;


-- 148. Classify book publication year

SELECT
    title,
    publication_year,
    CASE
        WHEN publication_year < 2000
            THEN 'Old'
        WHEN publication_year BETWEEN 2000 AND 2019
            THEN 'Modern'
        ELSE 'Recent'
    END AS book_age
FROM BOOK;



-- ============================================================
-- SECTION 26 : UPDATE OPERATIONS
-- ============================================================


-- 149. Update publisher address

UPDATE PUBLISHER
SET address = 'Chennai, Tamil Nadu'
WHERE publisher_id = 1;


-- 150. Update publisher phone

UPDATE PUBLISHER
SET phone = '9000000001'
WHERE publisher_id = 1;


-- 151. Update book price

UPDATE BOOK_COPY
SET price = 950.00
WHERE copy_id = 1;


-- 152. Change copy status to borrowed

UPDATE BOOK_COPY
SET status = 'BORROWED'
WHERE copy_id = 1;


-- 153. Change copy status to available

UPDATE BOOK_COPY
SET status = 'AVAILABLE'
WHERE copy_id = 1;


-- 154. Update member address

UPDATE MEMBER
SET address = 'Vijayawada, Andhra Pradesh'
WHERE member_id = 1;


-- 155. Suspend a member

UPDATE MEMBER
SET status = 'SUSPENDED'
WHERE member_id = 1;


-- 156. Activate a member

UPDATE MEMBER
SET status = 'ACTIVE'
WHERE member_id = 1;


-- 157. Update book edition

UPDATE BOOK
SET edition = 5
WHERE book_id = 1;


-- 158. Update book language

UPDATE BOOK
SET language = 'English'
WHERE book_id = 1;


-- 159. Mark a loan as returned

UPDATE LOAN
SET
    return_date = '2026-08-20',
    status = 'RETURNED'
WHERE loan_id = 3;


-- 160. Mark a fine as paid

UPDATE FINE
SET
    paid_date = '2026-08-25',
    status = 'PAID'
WHERE fine_id = 1;


-- 161. Increase all book prices by 10%

UPDATE BOOK_COPY
SET price = price * 1.10;


-- 162. Increase prices by 5% for copies below 500

UPDATE BOOK_COPY
SET price = price * 1.05
WHERE price < 500;



-- ============================================================
-- SECTION 27 : DELETE OPERATIONS
-- ============================================================


-- IMPORTANT:
-- Always use WHERE unless you intentionally want to
-- delete EVERY record.


-- 163. Delete a fine

DELETE FROM FINE
WHERE fine_id = 3;


-- 164. Delete a loan

DELETE FROM LOAN
WHERE loan_id = 3;


-- 165. Delete a book copy

DELETE FROM BOOK_COPY
WHERE copy_id = 5;


-- 166. Delete book-author relationship

DELETE FROM BOOK_AUTHOR
WHERE book_id = 1
AND author_id = 1;


-- 167. Delete an author

DELETE FROM AUTHOR
WHERE author_id = 4;


-- 168. Delete a member

DELETE FROM MEMBER
WHERE member_id = 3;


-- 169. Delete a book

DELETE FROM BOOK
WHERE book_id = 4;


-- 170. Delete a category

DELETE FROM CATEGORY
WHERE category_id = 3;


-- 171. Delete a publisher

DELETE FROM PUBLISHER
WHERE publisher_id = 2;



-- ============================================================
-- SECTION 28 : MANY-TO-MANY AUTHOR QUERIES
-- ============================================================


-- 172. Show every book with its author

SELECT
    b.title,
    a.author_name
FROM BOOK b
JOIN BOOK_AUTHOR ba
    ON b.book_id = ba.book_id
JOIN AUTHOR a
    ON ba.author_id = a.author_id
ORDER BY b.title;


-- 173. Find books written by a particular author

SELECT
    b.title
FROM BOOK b
JOIN BOOK_AUTHOR ba
    ON b.book_id = ba.book_id
JOIN AUTHOR a
    ON ba.author_id = a.author_id
WHERE a.author_name = 'Bjarne Stroustrup';


-- 174. Find authors of a particular book

SELECT
    a.author_name
FROM AUTHOR a
JOIN BOOK_AUTHOR ba
    ON a.author_id = ba.author_id
JOIN BOOK b
    ON ba.book_id = b.book_id
WHERE b.title = 'Clean Code';


-- 175. Count books written by each author

SELECT
    a.author_name,
    COUNT(ba.book_id) AS book_count
FROM AUTHOR a
LEFT JOIN BOOK_AUTHOR ba
    ON a.author_id = ba.author_id
GROUP BY a.author_id, a.author_name;



-- ============================================================
-- SECTION 29 : CATEGORY QUERIES
-- ============================================================


-- 176. Books in Programming category

SELECT
    b.title
FROM BOOK b
JOIN CATEGORY c
    ON b.category_id = c.category_id
WHERE c.category_name = 'Programming';


-- 177. Count books in each category

SELECT
    c.category_name,
    COUNT(b.book_id) AS total_books
FROM CATEGORY c
LEFT JOIN BOOK b
    ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name;


-- 178. Category having maximum books

SELECT
    c.category_name,
    COUNT(b.book_id) AS total_books
FROM CATEGORY c
JOIN BOOK b
    ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_books DESC
LIMIT 1;



-- ============================================================
-- SECTION 30 : PUBLISHER QUERIES
-- ============================================================


-- 179. Publisher with most books

SELECT
    p.publisher_name,
    COUNT(b.book_id) AS total_books
FROM PUBLISHER p
JOIN BOOK b
    ON p.publisher_id = b.publisher_id
GROUP BY p.publisher_id, p.publisher_name
ORDER BY total_books DESC
LIMIT 1;


-- 180. Publisher with least books

SELECT
    p.publisher_name,
    COUNT(b.book_id) AS total_books
FROM PUBLISHER p
LEFT JOIN BOOK b
    ON p.publisher_id = b.publisher_id
GROUP BY p.publisher_id, p.publisher_name
ORDER BY total_books ASC
LIMIT 1;



-- ============================================================
-- SECTION 31 : MOST / LEAST QUERIES
-- ============================================================


-- 181. Most expensive book copy

SELECT
    b.title,
    bc.price
FROM BOOK_COPY bc
JOIN BOOK b
    ON bc.book_id = b.book_id
ORDER BY bc.price DESC
LIMIT 1;


-- 182. Cheapest book copy

SELECT
    b.title,
    bc.price
FROM BOOK_COPY bc
JOIN BOOK b
    ON bc.book_id = b.book_id
ORDER BY bc.price ASC
LIMIT 1;


-- 183. Member with most loans

SELECT
    m.name,
    COUNT(l.loan_id) AS total_loans
FROM MEMBER m
JOIN LOAN l
    ON m.member_id = l.member_id
GROUP BY m.member_id, m.name
ORDER BY total_loans DESC
LIMIT 1;


-- 184. Member with least loans

SELECT
    m.name,
    COUNT(l.loan_id) AS total_loans
FROM MEMBER m
LEFT JOIN LOAN l
    ON m.member_id = l.member_id
GROUP BY m.member_id, m.name
ORDER BY total_loans ASC
LIMIT 1;


-- 185. Largest fine

SELECT *
FROM FINE
ORDER BY amount DESC
LIMIT 1;



-- ============================================================
-- SECTION 32 : DATE QUERIES
-- ============================================================


-- 186. Loans issued after a particular date

SELECT *
FROM LOAN
WHERE issue_date > '2026-08-01';


-- 187. Loans issued between two dates

SELECT *
FROM LOAN
WHERE issue_date BETWEEN '2026-08-01' AND '2026-08-31';


-- 188. Members who joined after a date

SELECT *
FROM MEMBER
WHERE membership_date > '2026-01-01';


-- 189. Fines created in August 2026

SELECT *
FROM FINE
WHERE fine_date BETWEEN '2026-08-01' AND '2026-08-31';



-- ============================================================
-- SECTION 33 : ADVANCED LOAN LOGIC
-- ============================================================


-- 190. Books currently with members

SELECT
    b.title,
    m.name AS borrowed_by
FROM LOAN l
JOIN MEMBER m
    ON l.member_id = m.member_id
JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
JOIN BOOK b
    ON bc.book_id = b.book_id
WHERE l.return_date IS NULL;


-- 191. Books that have been returned

SELECT
    b.title,
    m.name AS member_name,
    l.return_date
FROM LOAN l
JOIN MEMBER m
    ON l.member_id = m.member_id
JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
JOIN BOOK b
    ON bc.book_id = b.book_id
WHERE l.return_date IS NOT NULL;


-- 192. Books that were borrowed but are overdue

SELECT
    b.title,
    m.name,
    l.due_date
FROM LOAN l
JOIN MEMBER m
    ON l.member_id = m.member_id
JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
JOIN BOOK b
    ON bc.book_id = b.book_id
WHERE l.due_date < CURRENT_DATE
AND l.return_date IS NULL;


-- 193. Number of loans for each book

SELECT
    b.title,
    COUNT(l.loan_id) AS total_loans
FROM BOOK b
LEFT JOIN BOOK_COPY bc
    ON b.book_id = bc.book_id
LEFT JOIN LOAN l
    ON bc.copy_id = l.copy_id
GROUP BY b.book_id, b.title
ORDER BY total_loans DESC;


-- 194. Most borrowed book

SELECT
    b.title,
    COUNT(l.loan_id) AS total_loans
FROM BOOK b
JOIN BOOK_COPY bc
    ON b.book_id = bc.book_id
JOIN LOAN l
    ON bc.copy_id = l.copy_id
GROUP BY b.book_id, b.title
ORDER BY total_loans DESC
LIMIT 1;



-- ============================================================
-- SECTION 34 : BOOK AVAILABILITY
-- ============================================================


-- 195. Show every book and number of copies

SELECT
    b.title,
    COUNT(bc.copy_id) AS total_copies
FROM BOOK b
LEFT JOIN BOOK_COPY bc
    ON b.book_id = bc.book_id
GROUP BY b.book_id, b.title;


-- 196. Show every book and available copies

SELECT
    b.title,
    COUNT(
        CASE
            WHEN bc.status = 'AVAILABLE'
            THEN bc.copy_id
        END
    ) AS available_copies
FROM BOOK b
LEFT JOIN BOOK_COPY bc
    ON b.book_id = bc.book_id
GROUP BY b.book_id, b.title;


-- 197. Books with at least one available copy

SELECT DISTINCT
    b.title
FROM BOOK b
JOIN BOOK_COPY bc
    ON b.book_id = bc.book_id
WHERE bc.status = 'AVAILABLE';


-- 198. Books with no available copy

SELECT
    b.title
FROM BOOK b
LEFT JOIN BOOK_COPY bc
    ON b.book_id = bc.book_id
GROUP BY b.book_id, b.title
HAVING SUM(
    CASE
        WHEN bc.status = 'AVAILABLE'
        THEN 1
        ELSE 0
    END
) = 0;



-- ============================================================
-- SECTION 35 : UNION
-- ============================================================


-- 199. Combine author countries and publisher addresses

SELECT country AS location
FROM AUTHOR

UNION

SELECT address AS location
FROM PUBLISHER;


-- 200. Combine member emails and author emails

SELECT email
FROM MEMBER

UNION

SELECT email
FROM AUTHOR;



-- ============================================================
-- SECTION 36 : SELF-CONTAINED BUSINESS QUESTIONS
-- ============================================================


-- 201. How many books are published after 2015?

SELECT COUNT(*) AS total_books
FROM BOOK
WHERE publication_year > 2015;


-- 202. How many Programming books are there?

SELECT COUNT(*) AS total_books
FROM BOOK b
JOIN CATEGORY c
    ON b.category_id = c.category_id
WHERE c.category_name = 'Programming';


-- 203. How many books does each publisher publish?

SELECT
    p.publisher_name,
    COUNT(b.book_id) AS total_books
FROM PUBLISHER p
LEFT JOIN BOOK b
    ON p.publisher_id = b.publisher_id
GROUP BY p.publisher_id, p.publisher_name;


-- 204. How many copies are currently available?

SELECT COUNT(*) AS available_copies
FROM BOOK_COPY
WHERE status = 'AVAILABLE';


-- 205. How many members currently have borrowed books?

SELECT COUNT(DISTINCT member_id) AS members_with_books
FROM LOAN
WHERE return_date IS NULL;


-- 206. How much unpaid fine exists?

SELECT COALESCE(SUM(amount), 0) AS unpaid_fine
FROM FINE
WHERE status = 'UNPAID';


-- 207. Which member has the highest number of loans?

SELECT
    m.name,
    COUNT(l.loan_id) AS total_loans
FROM MEMBER m
JOIN LOAN l
    ON m.member_id = l.member_id
GROUP BY m.member_id, m.name
ORDER BY total_loans DESC
LIMIT 1;


-- 208. Which author has written the most books?

SELECT
    a.author_name,
    COUNT(ba.book_id) AS total_books
FROM AUTHOR a
JOIN BOOK_AUTHOR ba
    ON a.author_id = ba.author_id
GROUP BY a.author_id, a.author_name
ORDER BY total_books DESC
LIMIT 1;


-- 209. Which category has the most books?

SELECT
    c.category_name,
    COUNT(b.book_id) AS total_books
FROM CATEGORY c
JOIN BOOK b
    ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_books DESC
LIMIT 1;


-- 210. Which publisher has the most books?

SELECT
    p.publisher_name,
    COUNT(b.book_id) AS total_books
FROM PUBLISHER p
JOIN BOOK b
    ON p.publisher_id = b.publisher_id
GROUP BY p.publisher_id, p.publisher_name
ORDER BY total_books DESC
LIMIT 1;



-- ============================================================
-- SECTION 37 : COMPLETE REPORT QUERIES
-- ============================================================


-- 211. Complete book report

SELECT
    b.book_id,
    b.title,
    b.isbn,
    b.publication_year,
    b.edition,
    b.language,
    p.publisher_name,
    c.category_name,
    a.author_name,
    bc.accession_no,
    bc.price,
    bc.status AS copy_status
FROM BOOK b
JOIN PUBLISHER p
    ON b.publisher_id = p.publisher_id
JOIN CATEGORY c
    ON b.category_id = c.category_id
LEFT JOIN BOOK_AUTHOR ba
    ON b.book_id = ba.book_id
LEFT JOIN AUTHOR a
    ON ba.author_id = a.author_id
LEFT JOIN BOOK_COPY bc
    ON b.book_id = bc.book_id
ORDER BY b.title;


-- 212. Complete member borrowing report

SELECT
    m.member_id,
    m.name,
    m.email,
    b.title,
    bc.accession_no,
    l.issue_date,
    l.due_date,
    l.return_date,
    l.status
FROM MEMBER m
LEFT JOIN LOAN l
    ON m.member_id = l.member_id
LEFT JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
LEFT JOIN BOOK b
    ON bc.book_id = b.book_id
ORDER BY m.name;


-- 213. Complete fine report

SELECT
    f.fine_id,
    m.name AS member_name,
    b.title,
    f.amount,
    f.reason,
    f.fine_date,
    f.paid_date,
    f.status
FROM FINE f
JOIN LOAN l
    ON f.loan_id = l.loan_id
JOIN MEMBER m
    ON l.member_id = m.member_id
JOIN BOOK_COPY bc
    ON l.copy_id = bc.copy_id
JOIN BOOK b
    ON bc.book_id = b.book_id
ORDER BY f.fine_date DESC;



-- ============================================================
-- SECTION 38 : USEFUL DATABASE INFORMATION
-- ============================================================


-- 214. Show all tables

SHOW TABLES;


-- 215. Describe BOOK

DESCRIBE BOOK;


-- 216. Describe MEMBER

DESCRIBE MEMBER;


-- 217. Describe LOAN

DESCRIBE LOAN;


-- 218. Show CREATE TABLE statement

SHOW CREATE TABLE BOOK;


-- 219. Show CREATE TABLE for LOAN

SHOW CREATE TABLE LOAN;



-- ============================================================
-- END OF LIBRARY MANAGEMENT SQL QUERY FILE
-- ============================================================