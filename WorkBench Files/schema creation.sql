-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM
-- MySQL 8+
-- ============================================================

create database library;
use library;

-- ============================================================
-- 1. PUBLISHER
-- ============================================================

CREATE TABLE PUBLISHER (
    publisher_id INT AUTO_INCREMENT,
    publisher_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address VARCHAR(255) NOT NULL,

    CONSTRAINT pk_publisher
        PRIMARY KEY (publisher_id),

    CONSTRAINT uq_publisher_email
        UNIQUE (email),

    CONSTRAINT uq_publisher_phone
        UNIQUE (phone),

    CONSTRAINT chk_publisher_name
        CHECK (CHAR_LENGTH(publisher_name) >= 2),

    CONSTRAINT chk_publisher_email
        CHECK (email LIKE '%_@_%._%'),

    CONSTRAINT chk_publisher_phone
        CHECK (phone REGEXP '^[0-9]{10,15}$'),

    CONSTRAINT chk_publisher_address
        CHECK (CHAR_LENGTH(address) >= 5)
);


-- ============================================================
-- 2. CATEGORY
-- ============================================================

CREATE TABLE CATEGORY (
    category_id INT AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,

    CONSTRAINT pk_category
        PRIMARY KEY (category_id),

    CONSTRAINT uq_category_name
        UNIQUE (category_name),

    CONSTRAINT chk_category_name
        CHECK (CHAR_LENGTH(category_name) >= 2),

    CONSTRAINT chk_category_description
        CHECK (CHAR_LENGTH(description) >= 5)
);


-- ============================================================
-- 3. AUTHOR
-- ============================================================

CREATE TABLE AUTHOR (
    author_id INT AUTO_INCREMENT,
    author_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,

    CONSTRAINT pk_author
        PRIMARY KEY (author_id),

    CONSTRAINT uq_author_email
        UNIQUE (email),

    CONSTRAINT chk_author_name
        CHECK (CHAR_LENGTH(author_name) >= 2),

    CONSTRAINT chk_author_email
        CHECK (email LIKE '%_@_%._%'),

    CONSTRAINT chk_author_country
        CHECK (CHAR_LENGTH(country) >= 2)
);


-- ============================================================
-- 4. MEMBER
-- ============================================================

CREATE TABLE MEMBER (
    member_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address VARCHAR(255) NOT NULL,
    membership_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT pk_member
        PRIMARY KEY (member_id),

    CONSTRAINT uq_member_email
        UNIQUE (email),

    CONSTRAINT uq_member_phone
        UNIQUE (phone),

    CONSTRAINT chk_member_name
        CHECK (CHAR_LENGTH(name) >= 2),

    CONSTRAINT chk_member_email
        CHECK (email LIKE '%_@_%._%'),

    CONSTRAINT chk_member_phone
        CHECK (phone REGEXP '^[0-9]{10,15}$'),

    CONSTRAINT chk_member_address
        CHECK (CHAR_LENGTH(address) >= 5),

    CONSTRAINT chk_member_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);


-- ============================================================
-- 5. BOOK
-- ============================================================

CREATE TABLE BOOK (
    book_id INT AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    publication_year INT NOT NULL,
    edition INT NOT NULL,
    language VARCHAR(50) NOT NULL,
    publisher_id INT NOT NULL,
    category_id INT NOT NULL,

    CONSTRAINT pk_book
        PRIMARY KEY (book_id),

    CONSTRAINT uq_book_isbn
        UNIQUE (isbn),

    CONSTRAINT chk_book_title
        CHECK (CHAR_LENGTH(title) >= 1),

    CONSTRAINT chk_book_isbn
        CHECK (CHAR_LENGTH(isbn) BETWEEN 10 AND 20),

    CONSTRAINT chk_book_year
        CHECK (publication_year BETWEEN 1000 AND 2100),

    CONSTRAINT chk_book_edition
        CHECK (edition >= 1),

    CONSTRAINT chk_book_language
        CHECK (CHAR_LENGTH(language) >= 2),

    -- PUBLISHER 1 : N BOOK
    CONSTRAINT fk_book_publisher
        FOREIGN KEY (publisher_id)
        REFERENCES PUBLISHER(publisher_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- CATEGORY 1 : N BOOK
    CONSTRAINT fk_book_category
        FOREIGN KEY (category_id)
        REFERENCES CATEGORY(category_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 6. BOOK_AUTHOR
--    Resolves BOOK N : N AUTHOR
-- ============================================================

CREATE TABLE BOOK_AUTHOR (
    book_id INT NOT NULL,
    author_id INT NOT NULL,

    CONSTRAINT pk_book_author
        PRIMARY KEY (book_id, author_id),

    -- BOOK -> BOOK_AUTHOR
    CONSTRAINT fk_book_author_book
        FOREIGN KEY (book_id)
        REFERENCES BOOK(book_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- AUTHOR -> BOOK_AUTHOR
    CONSTRAINT fk_book_author_author
        FOREIGN KEY (author_id)
        REFERENCES AUTHOR(author_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 7. BOOK_COPY
-- ============================================================

CREATE TABLE BOOK_COPY (
    copy_id INT AUTO_INCREMENT,
    book_id INT NOT NULL,
    accession_no VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT pk_book_copy
        PRIMARY KEY (copy_id),

    CONSTRAINT uq_accession_no
        UNIQUE (accession_no),

    CONSTRAINT chk_accession_no
        CHECK (CHAR_LENGTH(accession_no) >= 1),

    CONSTRAINT chk_copy_price
        CHECK (price >= 0),

    CONSTRAINT chk_copy_status
        CHECK (status IN (
            'AVAILABLE',
            'BORROWED',
            'LOST',
            'DAMAGED'
        )),

    -- BOOK 1 : N BOOK_COPY
    CONSTRAINT fk_copy_book
        FOREIGN KEY (book_id)
        REFERENCES BOOK(book_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 8. LOAN
-- ============================================================

CREATE TABLE LOAN (
    loan_id INT AUTO_INCREMENT,
    member_id INT NOT NULL,
    copy_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT pk_loan
        PRIMARY KEY (loan_id),

    CONSTRAINT chk_loan_due_date
        CHECK (due_date >= issue_date),

    CONSTRAINT chk_loan_return_date
        CHECK (
            return_date IS NULL
            OR return_date >= issue_date
        ),

    CONSTRAINT chk_loan_status
        CHECK (status IN (
            'ISSUED',
            'RETURNED',
            'OVERDUE'
        )),

    -- MEMBER 1 : N LOAN
    CONSTRAINT fk_loan_member
        FOREIGN KEY (member_id)
        REFERENCES MEMBER(member_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- BOOK_COPY 1 : N LOAN
    CONSTRAINT fk_loan_copy
        FOREIGN KEY (copy_id)
        REFERENCES BOOK_COPY(copy_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- 9. FINE
-- ============================================================

CREATE TABLE FINE (
    fine_id INT AUTO_INCREMENT,
    loan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    fine_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT pk_fine
        PRIMARY KEY (fine_id),

    -- One LOAN can have at most one FINE
    CONSTRAINT uq_fine_loan
        UNIQUE (loan_id),

    CONSTRAINT chk_fine_amount
        CHECK (amount > 0),

    CONSTRAINT chk_fine_reason
        CHECK (CHAR_LENGTH(reason) >= 2),

    CONSTRAINT chk_fine_paid_date
        CHECK (
            paid_date IS NULL
            OR paid_date >= fine_date
        ),

    CONSTRAINT chk_fine_status
        CHECK (status IN (
            'UNPAID',
            'PAID'
        )),

    -- LOAN 1 : 1 FINE
    CONSTRAINT fk_fine_loan
        FOREIGN KEY (loan_id)
        REFERENCES LOAN(loan_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- ============================================================
-- END OF DATABASE TABLE CREATION
-- ============================================================

show tables;

