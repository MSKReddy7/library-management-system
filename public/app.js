const API = "/api";
let lookups = {};
let currentResource = null;
let editingId = null;
const resourceConfig = {
    publishers: { title: "Publishers", pk: "publisher_id", fields: [['publisher_name', 'Publisher Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['address', 'Address', 'text']] },
    categories: { title: "Categories", pk: "category_id", fields: [['category_name', 'Category Name', 'text'], ['description', 'Description', 'textarea']] },
    authors: { title: "Authors", pk: "author_id", fields: [['author_name', 'Author Name', 'text'], ['email', 'Email', 'email'], ['country', 'Country', 'text']] },
    members: { title: "Members", pk: "member_id", fields: [['name', 'Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['address', 'Address', 'text'], ['membership_date', 'Membership Date', 'date'], ['status', 'Status', 'select', ['ACTIVE', 'INACTIVE', 'SUSPENDED']]] },
    copies: { title: "Book Copies", pk: "copy_id", fields: [['book_id', 'Book', 'selectLookup', 'books'], ['accession_no', 'Accession No', 'text'], ['purchase_date', 'Purchase Date', 'date'], ['price', 'Price', 'number'], ['status', 'Status', 'select', ['AVAILABLE', 'BORROWED', 'LOST', 'DAMAGED']]] },
    loans: { title: "Loans", pk: "loan_id", fields: [['member_id', 'Member', 'selectLookup', 'members'], ['copy_id', 'Copy', 'selectLookup', 'copies'], ['issue_date', 'Issue Date', 'date'], ['due_date', 'Due Date', 'date'], ['return_date', 'Return Date', 'date'], ['status', 'Status', 'select', ['ISSUED', 'RETURNED', 'OVERDUE']]] },
    fines: { title: "Fines", pk: "fine_id", fields: [['loan_id', 'Loan', 'selectLookup', 'loans'], ['amount', 'Amount', 'number'], ['reason', 'Reason', 'text'], ['fine_date', 'Fine Date', 'date'], ['paid_date', 'Paid Date', 'date'], ['status', 'Status', 'select', ['UNPAID', 'PAID']]] }
};

const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const formatCurrency = value => `₹${Number(value || 0).toFixed(2)}`;

async function api(path, options = {}) {
    const res = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}
function toast(message, bad = false) { const t = $('#toast'); t.textContent = message; t.style.background = bad ? '#b91c1c' : '#172033'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600) }
function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === name));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === name));
    const titles = { dashboard: ['Dashboard', 'Overview of your library'], books: ['Books', 'Manage your book catalogue'], members: ['Members', 'Manage library members'], authors: ['Authors', 'Manage authors'], publishers: ['Publishers', 'Manage publishers'], categories: ['Categories', 'Manage book categories'], copies: ['Book Copies', 'Manage physical copies'], loans: ['Loans', 'Issue and return books'], fines: ['Fines', 'Track library fines'] };
    $('#pageTitle').textContent = titles[name][0]; $('#pageSubtitle').textContent = titles[name][1];
    if (name === 'dashboard') loadDashboard(); else if (name === 'books') loadBooks(); else if (resourceConfig[name]) loadResource(name);
    document.querySelector('.sidebar').classList.remove('open');
}
document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => showSection(b.dataset.section)));
$('#mobileMenu').onclick = () => document.querySelector('.sidebar').classList.toggle('open');
$('#refreshBtn').onclick = () => showSection(document.querySelector('.section.active').id);

async function loadDashboard() {
    try {
        const d = await api('/dashboard');
        const statCards = [
            { label: 'Books', icon: '📚', accent: '#5b6cff', value: d.books },
            { label: 'Members', icon: '👥', accent: '#10b981', value: d.members },
            { label: 'Available Copies', icon: '✅', accent: '#00b894', value: d.availableCopies },
            { label: 'Active Loans', icon: '🔄', accent: '#f59e0b', value: d.activeLoans },
            { label: 'Authors', icon: '✍️', accent: '#8b5cf6', value: d.authors },
            { label: 'Publishers', icon: '🏢', accent: '#ec4899', value: d.publishers },
            { label: 'Categories', icon: '🗂️', accent: '#14b8a6', value: d.categories },
            { label: 'Unpaid Fines', icon: '₹', accent: '#ef4444', value: formatCurrency(d.unpaidFines) }
        ];

        $('#stats').innerHTML = statCards.map(item => `
            <div class="stat" style="--accent:${item.accent}">
                <div class="stat-icon">${item.icon}</div>
                <div class="stat-label">${item.label}</div>
                <div class="stat-value">${item.value}</div>
            </div>
        `).join('');

        const today = new Date();
        const summary = [
            { label: 'Available', value: d.availableCopies },
            { label: 'Loans', value: d.activeLoans },
            { label: 'Members', value: d.members }
        ];

        $('#dashboardHero').innerHTML = `
            <div class="hero-copy">
                <span class="eyebrow">Library overview</span>
                <h2>Welcome back, Librarian</h2>
                <p>Your library is running smoothly today. ${today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
            <div class="hero-actions">
                <button class="primary" onclick="showSection('books')">Browse catalog</button>
                <button class="secondary" onclick="showSection('loans')">Check loans</button>
            </div>
            <div class="summary-badges">
                ${summary.map(item => `<div class="summary-badge"><span>${item.label}</span><strong>${item.value}</strong></div>`).join('')}
            </div>
        `;

        $('#recentLoans').innerHTML = d.recentLoans.length ? d.recentLoans.map(r => `<tr><td>#${r.loan_id}</td><td>${esc(r.member_name)}</td><td>${esc(r.title)}</td><td>${esc(r.accession_no)}</td><td>${esc(r.due_date)}</td><td>${statusBadge(r.status)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">No loans found</td></tr>';
    } catch (e) { toast(e.message, true); }
}
function statusBadge(s) { const c = s === 'AVAILABLE' || s === 'RETURNED' || s === 'ACTIVE' || s === 'PAID' ? 'success' : s === 'OVERDUE' || s === 'UNPAID' || s === 'BORROWED' ? 'warn' : 'danger'; return `<span class="badge ${c}">${esc(s)}</span>` }

async function loadBooks() { try { const rows = await api('/books?q=' + encodeURIComponent($('#booksSearch').value)); $('#booksBody').innerHTML = rows.length ? rows.map(r => `<tr><td>${r.book_id}</td><td><strong>${esc(r.title)}</strong><br><small>${esc(r.language)} · Ed. ${r.edition} · ${r.publication_year}</small></td><td>${esc(r.isbn)}</td><td>${esc(r.authors || '—')}</td><td>${esc(r.category_name)}</td><td>${esc(r.publisher_name)}</td><td>${r.available_copies}/${r.total_copies}</td><td class="actions"><button class="small-btn" onclick='editBook(${JSON.stringify(r)})'>Edit</button><button class="small-btn delete" onclick="deleteItem('books',${r.book_id},'book')">Delete</button></td></tr>`).join('') : '<tr><td colspan="8" class="empty">No books found</td></tr>' } catch (e) { toast(e.message, true) } }
$('#booksSearch').addEventListener('input', () => loadBooks());

async function loadLookups() { lookups = await api('/lookups'); const books = await api('/books'); lookups.books = books.map(b => ({ id: b.book_id, name: b.title })); }
async function loadResource(name) { try { const rows = await api('/' + name + '?q=' + encodeURIComponent(document.querySelector(`[data-resource-search="${name}"]`)?.value || '')); renderResource(name, rows) } catch (e) { toast(e.message, true) } }
function renderResource(name, rows) { const cfg = resourceConfig[name], table = $('#' + name + 'Table'); const headers = [cfg.pk, ...cfg.fields.map(f => f[0])]; table.innerHTML = `<thead><tr>${headers.map(h => `<th>${h.replaceAll('_', ' ')}</th>`).join('')}<th>Actions</th></tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${headers.map(h => `<td>${h === 'status' ? statusBadge(r[h]) : esc(r[h])}</td>`).join('')}<td class="actions"><button class="small-btn" onclick='editResource(${JSON.stringify(name)},${JSON.stringify(r)})'>Edit</button><button class="small-btn delete" onclick="deleteItem('${name}',${r[cfg.pk]},'${cfg.title.slice(0, -1)}')">Delete</button>${name === 'loans' && r.status !== 'RETURNED' ? `<button class="small-btn" onclick="returnLoan(${r.loan_id})">Return</button>` : ''}</td></tr>`).join('') : `<tr><td colspan="${headers.length + 1}" class="empty">No records found</td></tr>`}</tbody>` }
for (const input of document.querySelectorAll('[data-resource-search]')) input.addEventListener('input', () => loadResource(input.dataset.resourceSearch));

function fieldHtml(field, value = '') { const [key, label, type, extra] = field; let input = ''; if (type === 'select') { input = `<select id="f_${key}" required>${extra.map(v => `<option ${v === value ? 'selected' : ''}>${v}</option>`).join('')}</select>` } else if (type === 'selectLookup') { const opts = lookups[extra] || []; input = `<select id="f_${key}" required><option value="">Select...</option>${opts.map(o => `<option value="${o.id}" ${String(o.id) === String(value) ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>` } else if (type === 'textarea') { input = `<textarea id="f_${key}" required>${esc(value)}</textarea>` } else input = `<input id="f_${key}" type="${type}" value="${esc(value)}" ${type === 'number' ? 'step="0.01"' : ''} required>`; return `<div class="field"><label>${label}</label>${input}</div>` }
function openResourceModal(name, row = null) { currentResource = name; editingId = row ? row[resourceConfig[name].pk] : null; const cfg = resourceConfig[name]; $('#modalTitle').textContent = (row ? 'Edit ' : 'Add ') + cfg.title.slice(0, -1); $('#modalForm').innerHTML = cfg.fields.map(f => fieldHtml(f, row ? row[f[0]] : '')).join('') + `<div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save</button></div>`; $('#modalForm').onsubmit = saveResource; $('#modal').classList.add('open') }
function editResource(name, row) { openResourceModal(name, row) }
function closeModal() { $('#modal').classList.remove('open'); editingId = null; currentResource = null }
async function saveResource(e) { e.preventDefault(); const cfg = resourceConfig[currentResource]; const body = {}; for (const f of cfg.fields) { let v = $('#f_' + f[0]).value; if (f[2] === 'number') v = Number(v); if (v === '') v = null; body[f[0]] = v } try { await api(`/${currentResource}${editingId ? '/' + editingId : ''}`, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(body) }); closeModal(); toast(editingId ? 'Updated successfully' : 'Added successfully'); loadResource(currentResource) } catch (err) { toast(err.message, true) } }

function openBookModal(row = null) { editingId = row?.book_id || null; currentResource = 'books'; const authors = lookups.authors || []; const selected = (row?.authors || '').split(', ').filter(Boolean); $('#modalTitle').textContent = (row ? 'Edit ' : 'Add ') + 'Book'; $('#modalForm').innerHTML = `${fieldHtml(['title', 'Title', 'text'], row?.title)}${fieldHtml(['isbn', 'ISBN', 'text'], row?.isbn)}${fieldHtml(['publication_year', 'Publication Year', 'number'], row?.publication_year)}${fieldHtml(['edition', 'Edition', 'number'], row?.edition || 1)}${fieldHtml(['language', 'Language', 'text'], row?.language || 'English')}${fieldHtml(['publisher_id', 'Publisher', 'selectLookup', 'publishers'], row?.publisher_id)}${fieldHtml(['category_id', 'Category', 'selectLookup', 'categories'], row?.category_id)}<div class="field full"><label>Authors</label><select id="f_author_ids" class="multi" multiple>${authors.map(a => `<option value="${a.id}" ${selected.includes(a.name) ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save</button></div>`; $('#modalForm').onsubmit = saveBook; $('#modal').classList.add('open') }
function editBook(row) { openBookModal(row) }
async function saveBook(e) { e.preventDefault(); const body = { title: $('#f_title').value, isbn: $('#f_isbn').value, publication_year: Number($('#f_publication_year').value), edition: Number($('#f_edition').value), language: $('#f_language').value, publisher_id: Number($('#f_publisher_id').value), category_id: Number($('#f_category_id').value), author_ids: [...$('#f_author_ids').selectedOptions].map(o => Number(o.value)) }; try { await api('/books' + (editingId ? '/' + editingId : ''), { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(body) }); closeModal(); toast(editingId ? 'Book updated' : 'Book added'); loadBooks() } catch (e) { toast(e.message, true) } }

async function deleteItem(resource, id, label) { if (!confirm(`Delete this ${label}? This may cascade to related records.`)) return; try { await api(`/${resource}/${id}`, { method: 'DELETE' }); toast('Deleted successfully'); resource === 'books' ? loadBooks() : loadResource(resource) } catch (e) { toast(e.message, true) } }
async function returnLoan(id) { if (!confirm('Mark this loan as returned?')) return; try { await api('/loans/' + id + '/return', { method: 'POST', body: JSON.stringify({}) }); toast('Book returned'); loadResource('loans'); loadDashboard() } catch (e) { toast(e.message, true) } }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal() });
(async function init() { try { await api('/health'); await loadLookups(); loadDashboard() } catch (e) { toast('Cannot connect to MySQL/backend: ' + e.message, true) } })();
