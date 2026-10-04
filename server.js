const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function asyncRoute(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function sendDbError(res, error) {
    console.error(error);
    const duplicate = error.code === "ER_DUP_ENTRY";
    const foreignKey = error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_NO_REFERENCED_ROW_2";
    res.status(400).json({
        error: duplicate ? "A value that must be unique already exists." :
            foreignKey ? "This record is linked to another record and cannot be changed this way." :
                error.sqlMessage || error.message || "Database error"
    });
}

app.get("/api/health", asyncRoute(async (req, res) => {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: rows[0].ok === 1, database: process.env.DB_NAME || "library" });
}));

app.get("/api/dashboard", asyncRoute(async (req, res) => {
    const queries = {
        publishers: "SELECT COUNT(*) AS count FROM PUBLISHER",
        categories: "SELECT COUNT(*) AS count FROM CATEGORY",
        books: "SELECT COUNT(*) AS count FROM BOOK",
        authors: "SELECT COUNT(*) AS count FROM AUTHOR",
        copies: "SELECT COUNT(*) AS count FROM BOOK_COPY",
        members: "SELECT COUNT(*) AS count FROM MEMBER",
        loans: "SELECT COUNT(*) AS count FROM LOAN",
        fines: "SELECT COUNT(*) AS count FROM FINE",
        availableCopies: "SELECT COUNT(*) AS count FROM BOOK_COPY WHERE status = 'AVAILABLE'",
        activeLoans: "SELECT COUNT(*) AS count FROM LOAN WHERE status IN ('ISSUED','OVERDUE')",
        overdueLoans: "SELECT COUNT(*) AS count FROM LOAN WHERE status = 'OVERDUE'",
        returnedLoans: "SELECT COUNT(*) AS count FROM LOAN WHERE status = 'RETURNED'",
        unpaidFines: "SELECT COALESCE(SUM(amount),0) AS amount FROM FINE WHERE status = 'UNPAID'"
    };
    const entries = await Promise.all(Object.entries(queries).map(async ([key, sql]) => {
        const [rows] = await pool.query(sql);
        return [key, rows[0]];
    }));
    const result = {};
    for (const [key, row] of entries) result[key] = key === "unpaidFines" ? Number(row.amount) : Number(row.count);
    const [recentLoans] = await pool.query(`
        SELECT l.loan_id, m.name AS member_name, b.title, bc.accession_no,
               l.issue_date, l.due_date, l.return_date, l.status
        FROM LOAN l
        JOIN MEMBER m ON m.member_id = l.member_id
        JOIN BOOK_COPY bc ON bc.copy_id = l.copy_id
        JOIN BOOK b ON b.book_id = bc.book_id
        ORDER BY l.loan_id DESC LIMIT 8
    `);
    res.json({ ...result, recentLoans });
}));

// Books with publisher/category/author display information.
app.get("/api/books", asyncRoute(async (req, res) => {
    const q = `%${req.query.q || ""}%`;
    const [rows] = await pool.query(`
        SELECT b.*, p.publisher_name, c.category_name,
               GROUP_CONCAT(a.author_name ORDER BY a.author_name SEPARATOR ', ') AS authors,
               (SELECT COUNT(*) FROM BOOK_COPY bc WHERE bc.book_id = b.book_id) AS total_copies,
               (SELECT COUNT(*) FROM BOOK_COPY bc WHERE bc.book_id = b.book_id AND bc.status = 'AVAILABLE') AS available_copies
        FROM BOOK b
        JOIN PUBLISHER p ON p.publisher_id = b.publisher_id
        JOIN CATEGORY c ON c.category_id = b.category_id
        LEFT JOIN BOOK_AUTHOR ba ON ba.book_id = b.book_id
        LEFT JOIN AUTHOR a ON a.author_id = ba.author_id
        WHERE b.title LIKE ? OR b.isbn LIKE ? OR p.publisher_name LIKE ? OR c.category_name LIKE ?
        GROUP BY b.book_id
        ORDER BY b.book_id DESC
    `, [q, q, q, q]);
    res.json(rows);
}));

app.post("/api/books", asyncRoute(async (req, res) => {
    const { title, isbn, publication_year, edition, language, publisher_id, category_id, author_ids = [] } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(`INSERT INTO BOOK (title,isbn,publication_year,edition,language,publisher_id,category_id) VALUES (?,?,?,?,?,?,?)`, [title, isbn, publication_year, edition, language, publisher_id, category_id]);
        for (const authorId of author_ids) await conn.query("INSERT INTO BOOK_AUTHOR (book_id,author_id) VALUES (?,?)", [result.insertId, authorId]);
        await conn.commit();
        res.status(201).json({ book_id: result.insertId });
    } catch (e) { await conn.rollback(); sendDbError(res, e); } finally { conn.release(); }
}));

app.put("/api/books/:id", asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const { title, isbn, publication_year, edition, language, publisher_id, category_id, author_ids = [] } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(`UPDATE BOOK SET title=?,isbn=?,publication_year=?,edition=?,language=?,publisher_id=?,category_id=? WHERE book_id=?`, [title, isbn, publication_year, edition, language, publisher_id, category_id, id]);
        await conn.query("DELETE FROM BOOK_AUTHOR WHERE book_id=?", [id]);
        for (const authorId of author_ids) await conn.query("INSERT INTO BOOK_AUTHOR (book_id,author_id) VALUES (?,?)", [id, authorId]);
        await conn.commit(); res.json({ message: "Book updated" });
    } catch (e) { await conn.rollback(); sendDbError(res, e); } finally { conn.release(); }
}));

app.delete("/api/books/:id", asyncRoute(async (req, res) => {
    try { await pool.query("DELETE FROM BOOK WHERE book_id=?", [req.params.id]); res.json({ message: "Book deleted" }); }
    catch (e) { sendDbError(res, e); }
}));

// Simple CRUD resources.
const resources = {
    publishers: {
        table: "PUBLISHER", pk: "publisher_id",
        columns: ["publisher_name", "email", "phone", "address"]
    },
    categories: {
        table: "CATEGORY", pk: "category_id",
        columns: ["category_name", "description"]
    },
    authors: {
        table: "AUTHOR", pk: "author_id",
        columns: ["author_name", "email", "country"]
    },
    members: {
        table: "MEMBER", pk: "member_id",
        columns: ["name", "email", "phone", "address", "membership_date", "status"]
    },
    copies: {
        table: "BOOK_COPY", pk: "copy_id",
        columns: ["book_id", "accession_no", "purchase_date", "price", "status"]
    },
    loans: {
        table: "LOAN", pk: "loan_id",
        columns: ["member_id", "copy_id", "issue_date", "due_date", "return_date", "status"]
    },
    fines: {
        table: "FINE", pk: "fine_id",
        columns: ["loan_id", "amount", "reason", "fine_date", "paid_date", "status"]
    }
};

for (const [name, cfg] of Object.entries(resources)) {
    app.get(`/api/${name}`, asyncRoute(async (req, res) => {
        if (name === "loans") {
            const search = `%${req.query.q || ""}%`;
            const [rows] = await pool.query(`
                SELECT l.*, m.name AS member_name, b.title AS book_title, bc.accession_no
                FROM LOAN l
                JOIN MEMBER m ON m.member_id = l.member_id
                JOIN BOOK_COPY bc ON bc.copy_id = l.copy_id
                JOIN BOOK b ON b.book_id = bc.book_id
                WHERE CAST(l.loan_id AS CHAR) LIKE ? OR CAST(l.member_id AS CHAR) LIKE ?
                   OR CAST(l.copy_id AS CHAR) LIKE ? OR CAST(l.issue_date AS CHAR) LIKE ?
                   OR CAST(l.due_date AS CHAR) LIKE ? OR CAST(l.return_date AS CHAR) LIKE ?
                   OR l.status LIKE ? OR m.name LIKE ? OR b.title LIKE ? OR bc.accession_no LIKE ?
                ORDER BY l.loan_id DESC
            `, Array(10).fill(search));
            return res.json(rows);
        }
        const search = req.query.q || "";
        let sql = `SELECT * FROM ${cfg.table}`;
        const values = [];
        if (search && cfg.columns.length) {
            sql += " WHERE " + cfg.columns.map(c => `CAST(${c} AS CHAR) LIKE ?`).join(" OR ");
            for (let i = 0; i < cfg.columns.length; i++) values.push(`%${search}%`);
        }
        sql += ` ORDER BY ${cfg.pk} DESC`;
        const [rows] = await pool.query(sql, values);
        res.json(rows);
    }));

    app.post(`/api/${name}`, asyncRoute(async (req, res) => {
        if (name === "loans") {
            const memberId = Number(req.body.member_id);
            const copyId = Number(req.body.copy_id);
            const { issue_date: issueDate, due_date: dueDate } = req.body;
            if (!Number.isInteger(memberId) || !Number.isInteger(copyId) || !issueDate || !dueDate || issueDate > dueDate) {
                return res.status(400).json({ error: "Choose a member, an available copy, and valid loan dates." });
            }
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();
                const [copyRows] = await conn.query("SELECT status FROM BOOK_COPY WHERE copy_id=? FOR UPDATE", [copyId]);
                if (!copyRows.length) { await conn.rollback(); return res.status(404).json({ error: "Book copy not found." }); }
                if (copyRows[0].status !== "AVAILABLE") { await conn.rollback(); return res.status(409).json({ error: "This book copy is no longer available." }); }
                const [memberRows] = await conn.query("SELECT status FROM MEMBER WHERE member_id=?", [memberId]);
                if (!memberRows.length || memberRows[0].status !== "ACTIVE") { await conn.rollback(); return res.status(400).json({ error: "Loans can only be issued to active members." }); }
                const today = new Date().toISOString().slice(0, 10);
                const status = dueDate < today ? "OVERDUE" : "ISSUED";
                const [result] = await conn.query("INSERT INTO LOAN (member_id,copy_id,issue_date,due_date,return_date,status) VALUES (?,?,?,?,NULL,?)", [memberId, copyId, issueDate, dueDate, status]);
                await conn.query("UPDATE BOOK_COPY SET status='BORROWED' WHERE copy_id=?", [copyId]);
                await conn.commit();
                return res.status(201).json({ loan_id: result.insertId });
            } catch (e) { await conn.rollback(); sendDbError(res, e); } finally { conn.release(); }
            return;
        }
        const values = cfg.columns.map(c => req.body[c]);
        const placeholders = cfg.columns.map(() => "?").join(",");
        try {
            const [result] = await pool.query(`INSERT INTO ${cfg.table} (${cfg.columns.join(",")}) VALUES (${placeholders})`, values);
            res.status(201).json({ id: result.insertId });
        } catch (e) { sendDbError(res, e); }
    }));

    app.put(`/api/${name}/:id`, asyncRoute(async (req, res) => {
        if (name === "loans") {
            const loanId = Number(req.params.id);
            const memberId = Number(req.body.member_id);
            const copyId = Number(req.body.copy_id);
            const { issue_date: issueDate, due_date: dueDate } = req.body;
            if (!Number.isInteger(memberId) || !Number.isInteger(copyId) || !issueDate || !dueDate || issueDate > dueDate) {
                return res.status(400).json({ error: "Choose a member and copy, and enter valid loan dates." });
            }
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();
                const [loanRows] = await conn.query("SELECT copy_id,return_date,status FROM LOAN WHERE loan_id=? FOR UPDATE", [loanId]);
                if (!loanRows.length) { await conn.rollback(); return res.status(404).json({ error: "Loan not found." }); }
                const loan = loanRows[0];
                const previousCopyId = Number(loan.copy_id);
                const isReturned = Boolean(loan.return_date) || loan.status === "RETURNED";
                if (isReturned && copyId !== previousCopyId) {
                    await conn.rollback();
                    return res.status(400).json({ error: "A returned loan cannot be moved to another copy." });
                }
                if (copyId !== previousCopyId) {
                    const [copyRows] = await conn.query("SELECT copy_id,status FROM BOOK_COPY WHERE copy_id IN (?,?) ORDER BY copy_id FOR UPDATE", [previousCopyId, copyId]);
                    const nextCopy = copyRows.find(copy => Number(copy.copy_id) === copyId);
                    if (!nextCopy) { await conn.rollback(); return res.status(404).json({ error: "Book copy not found." }); }
                    if (!isReturned && nextCopy.status !== "AVAILABLE") {
                        await conn.rollback();
                        return res.status(409).json({ error: "This book copy is no longer available." });
                    }
                    if (!isReturned) {
                        await conn.query("UPDATE BOOK_COPY SET status='AVAILABLE' WHERE copy_id=?", [previousCopyId]);
                        await conn.query("UPDATE BOOK_COPY SET status='BORROWED' WHERE copy_id=?", [copyId]);
                    }
                }
                const today = new Date().toISOString().slice(0, 10);
                const status = isReturned ? "RETURNED" : dueDate < today ? "OVERDUE" : "ISSUED";
                await conn.query("UPDATE LOAN SET member_id=?,copy_id=?,issue_date=?,due_date=?,status=? WHERE loan_id=?", [memberId, copyId, issueDate, dueDate, status, loanId]);
                await conn.commit();
                return res.json({ message: "Loan updated" });
            } catch (e) { await conn.rollback(); sendDbError(res, e); } finally { conn.release(); }
            return;
        }
        const sets = cfg.columns.map(c => `${c}=?`).join(",");
        const values = cfg.columns.map(c => req.body[c]);
        values.push(req.params.id);
        try {
            await pool.query(`UPDATE ${cfg.table} SET ${sets} WHERE ${cfg.pk}=?`, values);
            res.json({ message: `${name} updated` });
        } catch (e) { sendDbError(res, e); }
    }));

    app.delete(`/api/${name}/:id`, asyncRoute(async (req, res) => {
        if (name === "loans") {
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();
                const [loanRows] = await conn.query("SELECT copy_id,return_date,status FROM LOAN WHERE loan_id=? FOR UPDATE", [req.params.id]);
                if (!loanRows.length) { await conn.rollback(); return res.status(404).json({ error: "Loan not found." }); }
                if (!loanRows[0].return_date && loanRows[0].status !== "RETURNED") {
                    await conn.query("UPDATE BOOK_COPY SET status='AVAILABLE' WHERE copy_id=?", [loanRows[0].copy_id]);
                }
                await conn.query("DELETE FROM LOAN WHERE loan_id=?", [req.params.id]);
                await conn.commit();
                return res.json({ message: "Loan deleted" });
            } catch (e) { await conn.rollback(); sendDbError(res, e); } finally { conn.release(); }
            return;
        }
        try {
            await pool.query(`DELETE FROM ${cfg.table} WHERE ${cfg.pk}=?`, [req.params.id]);
            res.json({ message: `${name} deleted` });
        } catch (e) { sendDbError(res, e); }
    }));
}

app.get("/api/lookups", asyncRoute(async (req, res) => {
    const [[publishers], [categories], [authors], [members], [copies], [loans]] = await Promise.all([
        pool.query("SELECT publisher_id AS id,publisher_name AS name FROM PUBLISHER ORDER BY publisher_name"),
        pool.query("SELECT category_id AS id,category_name AS name FROM CATEGORY ORDER BY category_name"),
        pool.query("SELECT author_id AS id,author_name AS name FROM AUTHOR ORDER BY author_name"),
        pool.query("SELECT member_id AS id,name FROM MEMBER WHERE status='ACTIVE' ORDER BY name"),
        pool.query(`SELECT bc.copy_id AS id, CONCAT(b.title,' — ',bc.accession_no) AS name FROM BOOK_COPY bc JOIN BOOK b ON b.book_id=bc.book_id WHERE bc.status='AVAILABLE' ORDER BY b.title`),
        pool.query(`SELECT l.loan_id AS id, CONCAT('Loan #',l.loan_id,' — ',m.name,' / ',bc.accession_no) AS name
                FROM LOAN l
                JOIN MEMBER m ON m.member_id=l.member_id
                JOIN BOOK_COPY bc ON bc.copy_id=l.copy_id
                LEFT JOIN FINE f ON f.loan_id=l.loan_id
                WHERE f.fine_id IS NULL
                ORDER BY l.loan_id DESC`)
    ]);
    res.json({ publishers, categories, authors, members, copies, loans });
}));

app.post("/api/loans/:id/return", asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [loanRows] = await conn.query("SELECT copy_id, return_date FROM LOAN WHERE loan_id=? FOR UPDATE", [id]);
        if (!loanRows.length) { await conn.rollback(); return res.status(404).json({ error: "Loan not found" }); }
        if (loanRows[0].return_date) { await conn.rollback(); return res.status(400).json({ error: "Loan already returned" }); }
        const returnDate = req.body.return_date || new Date().toISOString().slice(0, 10);
        await conn.query("UPDATE LOAN SET return_date=?, status='RETURNED' WHERE loan_id=?", [returnDate, id]);
        await conn.query("UPDATE BOOK_COPY SET status='AVAILABLE' WHERE copy_id=?", [loanRows[0].copy_id]);
        await conn.commit();
        res.json({ message: "Book returned successfully" });
    } catch (e) { await conn.rollback(); sendDbError(res, e); } finally { conn.release(); }
}));

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: "Internal server error" }); });

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Library UI running at http://localhost:${PORT}`));
