# Library Management System — HTML/CSS/JS + Node.js + Express + mysql2

A complete local web application for the Library Management System database.

## Architecture

```text
Browser
  │
  │ HTML + CSS + JavaScript / fetch()
  ▼
Node.js + Express
  │
  │ mysql2 connection pool
  ▼
MySQL
  │
  └── PUBLISHER, CATEGORY, BOOK, AUTHOR, BOOK_AUTHOR,
      BOOK_COPY, MEMBER, LOAN, FINE
```

The browser never receives MySQL credentials. Only the Node.js server connects to MySQL.

## Requirements

- Node.js 18+ recommended
- MySQL 8+
- MySQL Workbench (recommended for running the included SQL scripts)

## 1. Put the project in a folder

Open a terminal inside this folder.

## 2. Install packages

```bash
npm install
```

## 3. Create and populate the database

Use the scripts in `WorkBench Files` from MySQL Workbench, in this order:

1. Connect to your MySQL server in Workbench and open `WorkBench Files/schema creation.sql`.
2. Execute the script. It creates the `library` database and all nine application tables.
3. Open and execute `WorkBench Files/data.sql` to insert the sample library records.

Run the schema script on a fresh MySQL server/database. It uses `CREATE DATABASE library` without `IF NOT EXISTS`, so do not execute it again over an existing `library` database. Run the data script only once; rerunning it will conflict with the sample records' unique values.

`WorkBench Files/basic queries.sql` contains read-only reporting examples. `WorkBench Files/queries.sql` includes UPDATE and DELETE examples; review and run those statements individually, preferably against a disposable test database, because they modify or remove records.

`library_schema_reference.sql` is a reference note, not the complete schema-creation script. Use `WorkBench Files/schema creation.sql` to create the database and tables.

## 4. Configure MySQL

Copy `.env.example` to `.env` and edit it:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library
```

Keep `DB_NAME=library` to connect the app to the database created by the Workbench script.

## 5. Start

```bash
npm start
```

Open:

```text
http://localhost:3000
```

For development with automatic restart:

```bash
npm run dev
```

## Features

- Dashboard counts for books, members, copies, loans, authors, publishers, categories and fines
- Books CRUD with publisher/category/author relationships
- Publisher CRUD
- Category CRUD
- Author CRUD
- Member CRUD
- Physical book-copy CRUD
- Loan CRUD
- One-click loan return that also changes the physical copy to AVAILABLE
- Fine CRUD
- Search boxes for all main tables
- MySQL connection health check
- Responsive UI
- REST API using Express
- Parameterized SQL queries to avoid SQL injection from normal form/search values
- Transactional book/author updates and loan returns

## API

### Dashboard

`GET /api/health`

`GET /api/dashboard`

### Books

`GET /api/books?q=clean`

`POST /api/books`

`PUT /api/books/:id`

`DELETE /api/books/:id`

### Other resources

The following all support GET, POST, PUT and DELETE:

- `/api/publishers`
- `/api/categories`
- `/api/authors`
- `/api/members`
- `/api/copies`
- `/api/loans`
- `/api/fines`

### Lookups

`GET /api/lookups`

### Return a loan

`POST /api/loans/:id/return`

## Important database assumption

This application expects the schema previously created for the Library Management System, including these exact table/column names:

- `PUBLISHER(publisher_id, publisher_name, email, phone, address)`
- `CATEGORY(category_id, category_name, description)`
- `BOOK(book_id, title, isbn, publication_year, edition, language, publisher_id, category_id)`
- `AUTHOR(author_id, author_name, email, country)`
- `BOOK_AUTHOR(book_id, author_id)`
- `BOOK_COPY(copy_id, book_id, accession_no, purchase_date, price, status)`
- `MEMBER(member_id, name, email, phone, address, membership_date, status)`
- `LOAN(loan_id, member_id, copy_id, issue_date, due_date, return_date, status)`
- `FINE(fine_id, loan_id, amount, reason, fine_date, paid_date, status)`