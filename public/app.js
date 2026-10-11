const API = '/api';
const cats = ['food','transport','shopping','bills','other'];

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return ${d.getFullYear()}--;
}

document.getElementById('date').value = todayISO();

const form = document.getElementById('expenseForm');
const formMsg = document.getElementById('formMsg');
const totalEl = document.getElementById('total');
const monthEl = document.getElementById('monthTotal');
const barsEl = document.getElementById('bars');
const listEl = document.getElementById('expensesList');
const filterEl = document.getElementById('filterCategory');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const note = document.getElementById('note').value.trim();
  if (!amount || amount <= 0 || !category || !date) {
    formMsg.textContent = 'Please fill required fields with valid values.';
    return;
  }
  try {
    const res = await fetch(${API}/expenses, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, date, note })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      formMsg.textContent = data.error || 'Error creating expense';
      return;
    }
    form.reset();
    document.getElementById('date').value = todayISO();
    await load();
  } catch (err) {
    formMsg.textContent = 'Network error';
  }
});

filterEl.addEventListener('change', load);

async function load() {
  await Promise.all([loadSummary(), loadExpenses()]);
}

async function loadSummary() {
  try {
    const res = await fetch(${API}/summary);
    const data = await res.json();
    totalEl.textContent = (data.total||0).toFixed(2);
    monthEl.textContent = (data.monthTotal||0).toFixed(2);
    renderBars(data.byCategory || {});
  } catch (e) {
    // ignore
  }
}

function renderBars(byCat) {
  barsEl.innerHTML = '';
  const entries = cats.map(c => ({c, v: Number(byCat[c]||0)})).filter(x=>x.v>0);
  if (entries.length===0) return;
  const max = Math.max(...entries.map(x=>x.v), 1);
  for (const x of entries) {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = x.c;
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = (x.v/max*100)+'%';
    wrap.appendChild(fill);
    const val = document.createElement('div');
    val.className = 'bar-val';
    val.textContent = x.v.toFixed(2);
    row.appendChild(label); row.appendChild(wrap); row.appendChild(val);
    barsEl.appendChild(row);
  }
}

async function loadExpenses() {
  const cat = filterEl.value;
  const url = cat ? ${API}/expenses?category= : ${API}/expenses;
  try {
    const res = await fetch(url);
    const data = await res.json();
    renderExpenses(Array.isArray(data)?data:[]);
  } catch (e) {
    renderExpenses([]);
  }
}

function renderExpenses(items) {
  listEl.innerHTML = '';
  if (items.length===0) {
    listEl.textContent = 'No expenses found.';
    return;
  }
  for (const it of items) {
    const item = document.createElement('div');
    item.className = 'exp-item';
    const meta = document.createElement('div');
    meta.className = 'exp-meta';
    meta.innerHTML = <strong></strong> —  —  ;
    const acts = document.createElement('div');
    acts.className = 'exp-actions';
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = async () => {
      await fetch(${API}/expenses/, {method:'DELETE'});
      await load();
    };
    acts.appendChild(del);
    item.appendChild(meta); item.appendChild(acts);
    listEl.appendChild(item);
  }
}

load();
