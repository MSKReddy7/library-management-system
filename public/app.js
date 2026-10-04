const API = "/api";
let lookups = {};
let currentResource = null;
let editingId = null;
const bookRows = new Map();
const resourceRows = new Map();
let activeMemberStatus = 'ALL';
let activeAuthorCountry = '__all__';
let activePublisherAddress = '__all__';
let activeCopyStatus = 'ALL';
let activeLoanStatus = 'ALL';
let activeFineStatus = 'ALL';
const resourceConfig = {
    publishers: { title: "Publishers", pk: "publisher_id", fields: [['publisher_name', 'Publisher Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['address', 'Address', 'text']] },
    categories: { title: "Categories", pk: "category_id", fields: [['category_name', 'Category Name', 'text'], ['description', 'Description', 'textarea']] },
    authors: { title: "Authors", pk: "author_id", fields: [['author_name', 'Author Name', 'text'], ['email', 'Email', 'email'], ['country', 'Country', 'text']] },
    members: { title: "Members", pk: "member_id", fields: [['name', 'Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['address', 'Address', 'text'], ['membership_date', 'Membership Date', 'date'], ['status', 'Status', 'select', ['ACTIVE', 'INACTIVE', 'SUSPENDED']]] },
    copies: { title: "Book Copies", pk: "copy_id", fields: [['book_id', 'Book', 'selectLookup', 'books'], ['accession_no', 'Accession No', 'text'], ['purchase_date', 'Purchase Date', 'date'], ['price', 'Price', 'number'], ['status', 'Status', 'select', ['AVAILABLE', 'BORROWED', 'LOST', 'DAMAGED']]] },
    loans: { title: "Loans", pk: "loan_id", fields: [['member_id', 'Member', 'selectLookup', 'members'], ['copy_id', 'Copy', 'selectLookup', 'copies'], ['issue_date', 'Issue Date', 'date'], ['due_date', 'Due Date', 'date'], ['return_date', 'Return Date', 'date'], ['status', 'Status', 'select', ['ISSUED', 'RETURNED', 'OVERDUE']]] },
    fines: { title: "Fines", pk: "fine_id", fields: [['loan_id', 'Loan', 'selectLookup', 'loans'], ['amount', 'Amount', 'number'], ['reason', 'Reason', 'text'], ['fine_date', 'Fine Date', 'date'], ['paid_date', 'Paid Date', 'date'], ['status', 'Status', 'select', ['UNPAID', 'PAID']]] }
};
const resourceLabels = { publishers: 'publisher', categories: 'category', authors: 'author', members: 'member', copies: 'book copy', loans: 'loan', fines: 'fine' };

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
let activeDashboardFilter = 'ALL';

function renderRecentLoans(rows) {
    const filtered = activeDashboardFilter === 'ALL' ? rows : rows.filter(row => row.status === activeDashboardFilter || (activeDashboardFilter === 'ISSUED' && row.status === 'RETURNED' ? false : row.status === activeDashboardFilter));
    $('#recentLoans').innerHTML = filtered.length ? filtered.map(r => `<tr><td>#${r.loan_id}</td><td>${esc(r.member_name)}</td><td>${esc(r.title)}</td><td>${esc(r.accession_no)}</td><td>${esc(r.due_date)}</td><td>${statusBadge(r.status)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">No loans found for this filter</td></tr>';
}

function bindDashboardFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeDashboardFilter = button.dataset.filter;
            filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            const currentData = window.dashboardLoanRows || [];
            renderRecentLoans(currentData);
        });
    });
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('theme-dark', isDark);
    const toggle = $('#themeToggle');
    if (toggle) {
        toggle.innerHTML = isDark ? '☀️ Light' : '🌙 Dark';
        toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    localStorage.setItem('library-theme', theme);
}

$('#themeToggle')?.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
});

function initTheme() {
    const savedTheme = localStorage.getItem('library-theme') || 'light';
    applyTheme(savedTheme);
}

function exportResource(resource) {
    const action = async () => {
        try {
            const searchInput = resource === 'books' ? $('#booksSearch') : document.querySelector(`[data-resource-search="${resource}"]`);
            const rows = await api('/' + resource + '?q=' + encodeURIComponent(searchInput?.value || ''));
            if (!rows.length) {
                toast('No records to export', true);
                return;
            }

            const headers = Object.keys(rows[0]);
            const csv = [headers.join(','), ...rows.map(row => headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resource}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast(`${resource} exported successfully`);
        } catch (e) {
            toast(e.message, true);
        }
    };
    action();
}

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

        const overdueCount = d.overdueLoans ?? (d.recentLoans || []).filter(r => r.status === 'OVERDUE').length;
        const returnedCount = d.returnedLoans ?? (d.recentLoans || []).filter(r => r.status === 'RETURNED').length;
        const availabilityPercent = d.copies ? Math.round((d.availableCopies / d.copies) * 100) : 0;

        $('#insightsGrid').innerHTML = `
            <div class="insight-card">
                <div class="insight-top"><span>Availability</span><strong>${availabilityPercent}%</strong></div>
                <div class="progress-bar"><span style="width:${availabilityPercent}%"></span></div>
                <small>${d.availableCopies} of ${d.copies} copies ready to borrow</small>
            </div>
            <div class="insight-card">
                <div class="insight-top"><span>Overdue</span><strong>${overdueCount}</strong></div>
                <div class="progress-bar warn"><span style="width:${Math.min(overdueCount * 30, 100)}%"></span></div>
                <small>${overdueCount} active overdue items need attention</small>
            </div>
            <div class="insight-card">
                <div class="insight-top"><span>Returns</span><strong>${returnedCount}</strong></div>
                <div class="progress-bar success"><span style="width:${Math.min(returnedCount * 35, 100)}%"></span></div>
                <small>${returnedCount} loans have been checked back in</small>
            </div>
        `;

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

        const filters = [
            { key: 'ALL', label: 'All' },
            { key: 'ISSUED', label: 'Issued' },
            { key: 'OVERDUE', label: 'Overdue' },
            { key: 'RETURNED', label: 'Returned' }
        ];
        $('#dashboardFilters').innerHTML = filters.map(filter => `<button class="filter-btn ${activeDashboardFilter === filter.key ? 'active' : ''}" data-filter="${filter.key}">${filter.label}</button>`).join('');
        bindDashboardFilters();
        window.dashboardLoanRows = d.recentLoans || [];
        renderRecentLoans(window.dashboardLoanRows);
    } catch (e) { toast(e.message, true); }
}
function statusBadge(s) { const c = s === 'AVAILABLE' || s === 'RETURNED' || s === 'ACTIVE' || s === 'PAID' ? 'success' : s === 'OVERDUE' || s === 'UNPAID' || s === 'BORROWED' ? 'warn' : 'danger'; return `<span class="badge ${c}">${esc(s)}</span>` }

async function loadBooks() {
    try {
        const rows = await api('/books?q=' + encodeURIComponent($('#booksSearch').value));
        const query = $('#booksSearch').value.trim();
        $('#booksCount').textContent = query ? `${rows.length} result${rows.length === 1 ? '' : 's'}` : `${rows.length} book${rows.length === 1 ? '' : 's'}`;
        bookRows.clear();
        rows.forEach(row => bookRows.set(Number(row.book_id), row));
        $('#booksBody').innerHTML = rows.length ? rows.map(r => `<tr><td>${r.book_id}</td><td><strong>${esc(r.title)}</strong><br><small>${esc(r.language)} · Ed. ${r.edition} · ${r.publication_year}</small></td><td>${esc(r.isbn)}</td><td>${esc(r.authors || '—')}</td><td>${esc(r.category_name)}</td><td>${esc(r.publisher_name)}</td><td>${r.available_copies}/${r.total_copies}</td><td class="actions"><button class="small-btn" onclick="editBookById(${r.book_id})">Edit</button><button class="small-btn delete" onclick="deleteItem('books',${r.book_id},'book')">Delete</button></td></tr>`).join('') : '<tr><td colspan="8" class="empty">No books found</td></tr>';
    } catch (e) { toast(e.message, true); }
}
function editBookById(id) {
    const row = bookRows.get(Number(id));
    if (row) openBookModal(row);
}
$('#booksSearch').addEventListener('input', () => loadBooks());

async function loadLookups() { lookups = await api('/lookups'); const books = await api('/books'); lookups.books = books.map(b => ({ id: b.book_id, name: b.title })); }
async function loadResource(name) {
    try {
        const query = document.querySelector(`[data-resource-search="${name}"]`)?.value || '';
        const rows = await api('/' + name + '?q=' + encodeURIComponent(query));
        if (name === 'categories') {
            const noun = rows.length === 1 ? 'category' : 'categories';
            $('#categoriesCount').textContent = query.trim() ? `${rows.length} result${rows.length === 1 ? '' : 's'}` : `${rows.length} ${noun}`;
        }
        if (name === 'members') {
            const filterButtons = document.querySelectorAll('#memberFilters [data-member-status]');
            filterButtons.forEach(button => {
                const status = button.dataset.memberStatus;
                const count = status === 'ALL' ? rows.length : rows.filter(row => row.status === status).length;
                button.textContent = `${button.dataset.label} ${count}`;
            });
        }
        if (name === 'copies') {
            const filterButtons = document.querySelectorAll('#copyFilters [data-copy-status]');
            filterButtons.forEach(button => {
                const status = button.dataset.copyStatus;
                const count = status === 'ALL' ? rows.length : rows.filter(row => row.status === status).length;
                button.textContent = `${button.dataset.label} ${count}`;
                const isActive = status === activeCopyStatus;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
        }
        if (name === 'loans') {
            const filterButtons = document.querySelectorAll('#loanFilters [data-loan-status]');
            filterButtons.forEach(button => {
                const status = button.dataset.loanStatus;
                const count = status === 'ALL' ? rows.length : rows.filter(row => row.status === status).length;
                button.textContent = `${button.dataset.label} ${count}`;
                const isActive = status === activeLoanStatus;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
        }
        if (name === 'fines') {
            const filterButtons = document.querySelectorAll('#fineFilters [data-fine-status]');
            filterButtons.forEach(button => {
                const status = button.dataset.fineStatus;
                const count = status === 'ALL' ? rows.length : rows.filter(row => row.status === status).length;
                button.textContent = `${button.dataset.label} ${count}`;
                const isActive = status === activeFineStatus;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
            const unpaid = rows.filter(row => row.status === 'UNPAID');
            const paid = rows.filter(row => row.status === 'PAID');
            const unpaidTotal = unpaid.reduce((sum, row) => sum + Number(row.amount || 0), 0);
            const paidTotal = paid.reduce((sum, row) => sum + Number(row.amount || 0), 0);
            $('#fineSummary').innerHTML = `
                <div class="fine-metric"><span>Outstanding</span><strong>${formatCurrency(unpaidTotal)}</strong><small>${unpaid.length} unpaid ${unpaid.length === 1 ? 'fine' : 'fines'}</small></div>
                <div class="fine-metric"><span>Collected</span><strong>${formatCurrency(paidTotal)}</strong><small>${paid.length} paid ${paid.length === 1 ? 'fine' : 'fines'}</small></div>
                <div class="fine-metric"><span>Total fines</span><strong>${formatCurrency(unpaidTotal + paidTotal)}</strong><small>${rows.length} ${rows.length === 1 ? 'record' : 'records'} in results</small></div>
            `;
        }
        if (name === 'authors') {
            const countryCounts = new Map();
            rows.forEach(row => {
                const country = row.country?.trim() || 'Unspecified';
                countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
            });
            if (activeAuthorCountry !== '__all__' && !countryCounts.has(activeAuthorCountry)) activeAuthorCountry = '__all__';
            const filters = [{ country: '__all__', label: 'All', count: rows.length }, ...[...countryCounts].sort(([a], [b]) => a.localeCompare(b)).map(([country, count]) => ({ country, label: country, count }))];
            $('#authorCountryFilters').innerHTML = filters.map(filter => `<button class="filter-btn ${activeAuthorCountry === filter.country ? 'active' : ''}" type="button" data-author-country="${esc(filter.country)}" aria-pressed="${activeAuthorCountry === filter.country}">${esc(filter.label)} ${filter.count}</button>`).join('');
            document.querySelectorAll('#authorCountryFilters [data-author-country]').forEach(button => {
                button.addEventListener('click', () => {
                    activeAuthorCountry = button.dataset.authorCountry;
                    loadResource('authors');
                });
            });
        }
        if (name === 'publishers') {
            const addressCounts = new Map();
            rows.forEach(row => {
                const address = row.address?.trim() || 'Unspecified';
                addressCounts.set(address, (addressCounts.get(address) || 0) + 1);
            });
            if (activePublisherAddress !== '__all__' && !addressCounts.has(activePublisherAddress)) activePublisherAddress = '__all__';
            const filters = [{ address: '__all__', label: 'All', count: rows.length }, ...[...addressCounts].sort(([a], [b]) => a.localeCompare(b)).map(([address, count]) => ({ address, label: address, count }))];
            $('#publisherAddressFilters').innerHTML = filters.map(filter => `<button class="filter-btn ${activePublisherAddress === filter.address ? 'active' : ''}" type="button" data-publisher-address="${esc(filter.address)}" aria-pressed="${activePublisherAddress === filter.address}">${esc(filter.label)} ${filter.count}</button>`).join('');
            document.querySelectorAll('#publisherAddressFilters [data-publisher-address]').forEach(button => {
                button.addEventListener('click', () => {
                    activePublisherAddress = button.dataset.publisherAddress;
                    loadResource('publishers');
                });
            });
        }
        const visibleRows = name === 'members' && activeMemberStatus !== 'ALL'
            ? rows.filter(row => row.status === activeMemberStatus)
            : name === 'authors' && activeAuthorCountry !== '__all__'
                ? rows.filter(row => (row.country?.trim() || 'Unspecified') === activeAuthorCountry)
                : name === 'publishers' && activePublisherAddress !== '__all__'
                    ? rows.filter(row => (row.address?.trim() || 'Unspecified') === activePublisherAddress)
                    : name === 'copies' && activeCopyStatus !== 'ALL'
                        ? rows.filter(row => row.status === activeCopyStatus)
                        : name === 'loans' && activeLoanStatus !== 'ALL'
                            ? rows.filter(row => row.status === activeLoanStatus)
                            : name === 'fines' && activeFineStatus !== 'ALL'
                                ? rows.filter(row => row.status === activeFineStatus)
                                : rows;
        renderResource(name, visibleRows);
    } catch (e) { toast(e.message, true); }
}
function renderResource(name, rows) {
    const cfg = resourceConfig[name], table = $('#' + name + 'Table');
    const headers = [cfg.pk, ...cfg.fields.map(f => f[0])];
    resourceRows.set(name, new Map(rows.map(row => [Number(row[cfg.pk]), row])));
    table.innerHTML = `<thead><tr>${headers.map(h => `<th>${name === 'loans' && h === 'member_id' ? 'Member' : name === 'loans' && h === 'copy_id' ? 'Book Copy' : h.replaceAll('_', ' ')}</th>`).join('')}<th>Actions</th></tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${headers.map(h => `<td>${resourceCell(name, r, h)}</td>`).join('')}<td class="actions"><button class="small-btn" onclick="editResourceById('${name}',${r[cfg.pk]})">Edit</button><button class="small-btn delete" onclick="deleteItem('${name}',${r[cfg.pk]},'${resourceLabels[name]}')">Delete</button>${name === 'loans' && r.status !== 'RETURNED' ? `<button class="small-btn" onclick="returnLoan(${r.loan_id})">Return</button>` : ''}</td></tr>`).join('') : `<tr><td colspan="${headers.length + 1}" class="empty">No records found</td></tr>`}</tbody>`;
}
function resourceCell(name, row, key) {
    if (name === 'loans' && key === 'member_id') return `${esc(row.member_name)} (#${row.member_id})`;
    if (name === 'loans' && key === 'copy_id') return `${esc(row.book_title)} · ${esc(row.accession_no)}`;
    return key === 'status' ? statusBadge(row[key]) : esc(row[key]);
}
for (const input of document.querySelectorAll('[data-resource-search]')) input.addEventListener('input', () => loadResource(input.dataset.resourceSearch));
for (const button of document.querySelectorAll('#memberFilters [data-member-status]')) {
    button.addEventListener('click', () => {
        activeMemberStatus = button.dataset.memberStatus;
        document.querySelectorAll('#memberFilters [data-member-status]').forEach(filter => {
            const isActive = filter === button;
            filter.classList.toggle('active', isActive);
            filter.setAttribute('aria-pressed', String(isActive));
        });
        loadResource('members');
    });
}
for (const button of document.querySelectorAll('#copyFilters [data-copy-status]')) {
    button.addEventListener('click', () => {
        activeCopyStatus = button.dataset.copyStatus;
        loadResource('copies');
    });
}
for (const button of document.querySelectorAll('#loanFilters [data-loan-status]')) {
    button.addEventListener('click', () => {
        activeLoanStatus = button.dataset.loanStatus;
        loadResource('loans');
    });
}
for (const button of document.querySelectorAll('#fineFilters [data-fine-status]')) {
    button.addEventListener('click', () => {
        activeFineStatus = button.dataset.fineStatus;
        loadResource('fines');
    });
}

function fieldHtml(field, value = '') { const [key, label, type, extra] = field; const required = key === 'paid_date' ? '' : ' required'; let input = ''; if (type === 'select') { input = `<select id="f_${key}"${required}>${extra.map(v => `<option ${v === value ? 'selected' : ''}>${v}</option>`).join('')}</select>` } else if (type === 'selectLookup') { const opts = lookups[extra] || []; input = `<select id="f_${key}"${required}><option value="">Select...</option>${opts.map(o => `<option value="${o.id}" ${String(o.id) === String(value) ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>` } else if (type === 'textarea') { input = `<textarea id="f_${key}"${required}>${esc(value)}</textarea>` } else input = `<input id="f_${key}" type="${type}" value="${esc(value)}" ${type === 'number' ? 'step="0.01"' : ''}${required}>`; return `<div class="field"><label>${label}</label>${input}</div>` }
function openResourceModal(name, row = null) {
    currentResource = name;
    editingId = row ? row[resourceConfig[name].pk] : null;
    const cfg = resourceConfig[name];
    const fields = name === 'loans' ? cfg.fields.filter(field => !['return_date', 'status'].includes(field[0])) : cfg.fields;
    const title = name === 'categories' ? 'Category' : name === 'copies' ? 'Book Copy' : resourceLabels[name] || cfg.title.slice(0, -1);
    $('#modalTitle').textContent = (row ? 'Edit ' : 'Add ') + title.replace(/\b\w/g, letter => letter.toUpperCase());
    $('#modalForm').innerHTML = fields.map(field => fieldHtml(field, row ? row[field[0]] : '')).join('') + `<div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save</button></div>`;
    if (name === 'loans' && row) {
        for (const key of ['member_id', 'copy_id']) {
            const select = $('#f_' + key);
            const value = String(row[key]);
            if (![...select.options].some(option => option.value === value)) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = key === 'copy_id' ? `Current loan copy #${value}` : `Current member #${value}`;
                option.selected = true;
                select.append(option);
            }
        }
    }
    if (name === 'fines' && row) {
        const select = $('#f_loan_id');
        const value = String(row.loan_id);
        if (![...select.options].some(option => option.value === value)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = `Current fine loan #${value}`;
            option.selected = true;
            select.append(option);
        }
    }
    $('#modalForm').onsubmit = saveResource;
    $('#modal').classList.add('open');
}
function editResource(name, row) { openResourceModal(name, row) }
function editResourceById(name, id) {
    const row = resourceRows.get(name)?.get(Number(id));
    if (row) editResource(name, row);
}
function closeModal() { $('#modal').classList.remove('open'); editingId = null; currentResource = null }
async function saveResource(e) {
    e.preventDefault();
    const resource = currentResource;
    const id = editingId;
    const wasEditing = id !== null;
    const cfg = resourceConfig[resource];
    const body = {};
    const fields = resource === 'loans' ? cfg.fields.filter(field => !['return_date', 'status'].includes(field[0])) : cfg.fields;
    for (const f of fields) {
        let value = $('#f_' + f[0]).value;
        if (f[2] === 'number') value = Number(value);
        if (value === '') value = null;
        body[f[0]] = value;
    }
    try {
        await api(`/${resource}${wasEditing ? '/' + id : ''}`, { method: wasEditing ? 'PUT' : 'POST', body: JSON.stringify(body) });
        closeModal();
        toast(wasEditing ? 'Updated successfully' : 'Added successfully');
        loadResource(resource);
    } catch (err) { toast(err.message, true); }
}

function openBookModal(row = null) { editingId = row?.book_id || null; currentResource = 'books'; const authors = lookups.authors || []; const selected = (row?.authors || '').split(', ').filter(Boolean); $('#modalTitle').textContent = (row ? 'Edit ' : 'Add ') + 'Book'; $('#modalForm').innerHTML = `${fieldHtml(['title', 'Title', 'text'], row?.title)}${fieldHtml(['isbn', 'ISBN', 'text'], row?.isbn)}${fieldHtml(['publication_year', 'Publication Year', 'number'], row?.publication_year)}${fieldHtml(['edition', 'Edition', 'number'], row?.edition || 1)}${fieldHtml(['language', 'Language', 'text'], row?.language || 'English')}${fieldHtml(['publisher_id', 'Publisher', 'selectLookup', 'publishers'], row?.publisher_id)}${fieldHtml(['category_id', 'Category', 'selectLookup', 'categories'], row?.category_id)}<div class="field full"><label>Authors</label><select id="f_author_ids" class="multi" multiple>${authors.map(a => `<option value="${a.id}" ${selected.includes(a.name) ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save</button></div>`; $('#modalForm').onsubmit = saveBook; $('#modal').classList.add('open') }
function editBook(row) { openBookModal(row) }
async function saveBook(e) { e.preventDefault(); const body = { title: $('#f_title').value, isbn: $('#f_isbn').value, publication_year: Number($('#f_publication_year').value), edition: Number($('#f_edition').value), language: $('#f_language').value, publisher_id: Number($('#f_publisher_id').value), category_id: Number($('#f_category_id').value), author_ids: [...$('#f_author_ids').selectedOptions].map(o => Number(o.value)) }; try { await api('/books' + (editingId ? '/' + editingId : ''), { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(body) }); closeModal(); toast(editingId ? 'Book updated' : 'Book added'); loadBooks() } catch (e) { toast(e.message, true) } }

async function deleteItem(resource, id, label) { if (!confirm(`Delete this ${label}? This may cascade to related records.`)) return; try { await api(`/${resource}/${id}`, { method: 'DELETE' }); toast('Deleted successfully'); resource === 'books' ? loadBooks() : loadResource(resource) } catch (e) { toast(e.message, true) } }
async function returnLoan(id) { if (!confirm('Mark this loan as returned?')) return; try { await api('/loans/' + id + '/return', { method: 'POST', body: JSON.stringify({}) }); toast('Book returned'); loadResource('loans'); loadDashboard() } catch (e) { toast(e.message, true) } }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal() });
(async function init() {
    initTheme();
    try { await api('/health'); await loadLookups(); loadDashboard() } catch (e) { toast('Cannot connect to MySQL/backend: ' + e.message, true) }
})();
