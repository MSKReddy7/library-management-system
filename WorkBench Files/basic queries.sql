-- 1. Total books
SELECT COUNT(*) FROM BOOK;

-- 2. Total copies
SELECT COUNT(*) FROM BOOK_COPY;

-- 3. Available copies
SELECT COUNT(*) FROM BOOK_COPY
WHERE status = 'AVAILABLE';

-- 4. Books by category
SELECT c.category_name, COUNT(b.book_id)
FROM CATEGORY c
LEFT JOIN BOOK b
ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name;

-- 5. Books by author
SELECT a.author_name, COUNT(ba.book_id)
FROM AUTHOR a
LEFT JOIN BOOK_AUTHOR ba
ON a.author_id = ba.author_id
GROUP BY a.author_id, a.author_name;

-- 6. Currently borrowed books
SELECT b.title, m.name
FROM LOAN l
JOIN MEMBER m ON l.member_id = m.member_id
JOIN BOOK_COPY bc ON l.copy_id = bc.copy_id
JOIN BOOK b ON bc.book_id = b.book_id
WHERE l.return_date IS NULL;

-- 7. Overdue books
SELECT b.title, m.name, l.due_date
FROM LOAN l
JOIN MEMBER m ON l.member_id = m.member_id
JOIN BOOK_COPY bc ON l.copy_id = bc.copy_id
JOIN BOOK b ON bc.book_id = b.book_id
WHERE l.status = 'OVERDUE';

-- 8. Unpaid fines
SELECT m.name, f.amount
FROM FINE f
JOIN LOAN l ON f.loan_id = l.loan_id
JOIN MEMBER m ON l.member_id = m.member_id
WHERE f.status = 'UNPAID';

-- 9. Most expensive book copy
SELECT b.title, bc.price
FROM BOOK_COPY bc
JOIN BOOK b ON bc.book_id = b.book_id
ORDER BY bc.price DESC
LIMIT 1;

-- 10. Most borrowed book
SELECT b.title, COUNT(l.loan_id) AS total_loans
FROM BOOK b
JOIN BOOK_COPY bc ON b.book_id = bc.book_id
JOIN LOAN l ON bc.copy_id = l.copy_id
GROUP BY b.book_id, b.title
ORDER BY total_loans DESC
LIMIT 1;