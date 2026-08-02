const NAMES = ["יאמא", "אלירן", "ריהוט גן", "אורן", "משה"];

const form = document.getElementById("entry-form");
const nameSelect = document.getElementById("name-select");
const amountInput = document.getElementById("amount-input");
const descInput = document.getElementById("desc-input");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const entriesBody = document.getElementById("entries-body");
const emptyState = document.getElementById("empty-state");
const summaryList = document.getElementById("summary-list");
const totalValue = document.getElementById("total-value");
const statusBanner = document.getElementById("status-banner");
const filterSelect = document.getElementById("filter-select");

let editingId = null;
let allEntries = [];

function populateNameSelect() {
  for (const name of NAMES) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    nameSelect.appendChild(opt);
  }
}

function populateFilterSelect() {
  for (const name of NAMES) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    filterSelect.appendChild(opt);
  }
}

function formatCurrency(n) {
  return "₪" + Number(n).toLocaleString("he-IL");
}

function showStatus(message) {
  statusBanner.textContent = message;
  statusBanner.style.display = message ? "block" : "none";
}

function resetForm() {
  form.reset();
  editingId = null;
  submitBtn.textContent = "הוסף רשומה";
  cancelEditBtn.style.display = "none";
}

function startEdit(entry) {
  editingId = entry.id;
  nameSelect.value = entry.name;
  amountInput.value = entry.amount;
  descInput.value = entry.description;
  submitBtn.textContent = "עדכן רשומה";
  cancelEditBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderEntries(entries) {
  entriesBody.innerHTML = "";
  emptyState.style.display = entries.length === 0 ? "block" : "none";

  for (const entry of entries) {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = entry.name;

    const amountTd = document.createElement("td");
    amountTd.className = "amount";
    amountTd.textContent = formatCurrency(entry.amount);

    const descTd = document.createElement("td");
    descTd.textContent = entry.description || "";

    const actionsTd = document.createElement("td");
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "row-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit";
    editBtn.textContent = "ערוך";
    editBtn.type = "button";
    editBtn.addEventListener("click", () => startEdit(entry));

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn delete";
    delBtn.textContent = "מחק";
    delBtn.type = "button";
    delBtn.addEventListener("click", () => deleteEntry(entry.id));

    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(delBtn);
    actionsTd.appendChild(actionsWrap);

    tr.appendChild(nameTd);
    tr.appendChild(amountTd);
    tr.appendChild(descTd);
    tr.appendChild(actionsTd);
    entriesBody.appendChild(tr);
  }
}

function applyFilterAndRender() {
  const selected = filterSelect.value;
  const filtered = selected ? allEntries.filter((e) => e.name === selected) : allEntries;
  renderEntries(filtered);
}

function renderSummary(entries) {
  const totals = {};
  for (const name of NAMES) totals[name] = 0;
  let grandTotal = 0;

  for (const entry of entries) {
    totals[entry.name] = (totals[entry.name] || 0) + entry.amount;
    grandTotal += entry.amount;
  }

  summaryList.innerHTML = "";
  for (const name of NAMES) {
    const row = document.createElement("div");
    row.className = "summary-row";
    row.innerHTML = `<span class="name">${name}</span><span class="value">${formatCurrency(totals[name])}</span>`;
    summaryList.appendChild(row);
  }

  totalValue.textContent = formatCurrency(grandTotal);
}

async function deleteEntry(id) {
  if (!confirm("למחוק את הרשומה הזו?")) return;
  try {
    await db.collection("entries").doc(id).delete();
  } catch (err) {
    showStatus("שגיאה במחיקה: " + err.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameSelect.value;
  const amount = Number(amountInput.value);
  const description = descInput.value.trim();

  if (!name || !amount || amount <= 0) {
    showStatus("יש לבחור שם ולמלא סכום תקין");
    return;
  }
  showStatus("");

  try {
    if (editingId) {
      await db.collection("entries").doc(editingId).update({ name, amount, description });
    } else {
      await db.collection("entries").add({
        name,
        amount,
        description,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    resetForm();
  } catch (err) {
    showStatus("שגיאה בשמירה: " + err.message);
  }
});

cancelEditBtn.addEventListener("click", resetForm);
filterSelect.addEventListener("change", applyFilterAndRender);

function init() {
  populateNameSelect();
  populateFilterSelect();

  if (!window.firebase || !firebase.apps) {
    showStatus("פיירבייס לא נטען. ודא שקובץ firebase-config.js מולא כראוי.");
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
  } catch (err) {
    showStatus("שגיאה באתחול פיירבייס: " + err.message);
    return;
  }

  window.db = firebase.firestore();

  db.collection("entries").orderBy("createdAt", "desc").onSnapshot(
    (snapshot) => {
      allEntries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      applyFilterAndRender();
      renderSummary(allEntries);
    },
    (err) => {
      showStatus("שגיאה בחיבור לפיירבייס: " + err.message);
    }
  );
}

init();
