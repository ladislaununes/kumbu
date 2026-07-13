/* ==========================================================================
   Kumbu++ Main App Entry / Orchestrator
   ========================================================================== */

import store from './state.js';
import { CATEGORIES, getCategoryName } from './utils.js';

// Views
import { renderDashboard } from './views/dashboard.js';
import { renderTransactions } from './views/transactions.js';
import { renderBudgets } from './views/budgets.js';
import { renderGoals } from './views/goals.js';
import { renderReports } from './views/reports.js';

// App state
let currentView = 'dashboard';

// DOM Element Selectors
const viewContainer = document.getElementById('viewContainer');
const navItems = document.querySelectorAll('.nav-item');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const currencySelector = document.getElementById('currencySelector');
const greetingText = document.getElementById('greetingText');
const currentDateText = document.getElementById('currentDateText');

// Mobile navigation selectors
const menuToggleBtn = document.getElementById('menuToggleBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const appSidebar = document.getElementById('appSidebar');

// Modal selectors
const transactionModal = document.getElementById('transactionModal');
const budgetModal = document.getElementById('budgetModal');
const goalModal = document.getElementById('goalModal');
const contributionModal = document.getElementById('contributionModal');

/* ==========================================================================
   1. Initialization & Core Setup
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // A. Set header date in Portuguese
  updateHeaderDate();

  // B. Load user settings (Theme & Currency)
  applySettings();

  // C. Render Default View
  renderCurrentView();

  // D. Set up navigation listener
  initNavigation();

  // E. Set up theme & settings listeners
  initSettingsListeners();

  // F. Set up modal event bindings
  initModalListeners();
}

// Format and display current date: e.g. "Segunda-feira, 13 de Julho de 2026"
function updateHeaderDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  let dateString = today.toLocaleDateString('pt-PT', options);
  
  // Capitalize first letter
  dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
  if (currentDateText) {
    currentDateText.textContent = dateString;
  }
  
  // Dynamic Greeting based on time
  const hour = today.getHours();
  let greeting = 'Olá, Ladis';
  if (hour >= 5 && hour < 12) {
    greeting = 'Bom dia, Ladis';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Boa tarde, Ladis';
  } else {
    greeting = 'Boa noite, Ladis';
  }
  if (greetingText) {
    greetingText.textContent = greeting;
  }
}

/* ==========================================================================
   2. Theme and Settings Management
   ========================================================================== */

function applySettings() {
  const settings = store.getSettings();
  
  // Theme
  if (settings.theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }

  // Currency Select value Sync
  if (currencySelector) {
    currencySelector.value = settings.currency;
  }
}

function initSettingsListeners() {
  // Theme Toggle Button click
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = store.getSettings().theme;
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      store.updateSetting('theme', nextTheme);
    });
  }

  // Currency select change
  if (currencySelector) {
    currencySelector.addEventListener('change', (e) => {
      store.updateSetting('currency', e.target.value);
    });
  }

  // Subscribe to store updates to sync layout settings instantly
  store.subscribe((state) => {
    applySettings();
    renderCurrentView(); // Rerenders the current active view with fresh data/currency
  });
}

/* ==========================================================================
   3. View Rendering & Routing
   ========================================================================== */

function renderCurrentView() {
  if (!viewContainer) return;
  
  switch (currentView) {
    case 'dashboard':
      renderDashboard(viewContainer);
      break;
    case 'transactions':
      renderTransactions(viewContainer);
      break;
    case 'budgets':
      renderBudgets(viewContainer);
      break;
    case 'goals':
      renderGoals(viewContainer);
      break;
    case 'reports':
      renderReports(viewContainer);
      break;
    default:
      renderDashboard(viewContainer);
  }
}

function initNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Set active navigation tab style
      navItems.forEach(nav => nav.classList.remove('active'));
      const btn = e.currentTarget;
      btn.classList.add('active');
      
      // Update active view state
      currentView = btn.getAttribute('data-view');
      renderCurrentView();

      // Mobile: hide sidebar when navigating
      if (appSidebar) {
        appSidebar.classList.remove('mobile-active');
      }
    });
  });

  // Mobile sidebar burger toggles
  if (menuToggleBtn && appSidebar) {
    menuToggleBtn.addEventListener('click', () => {
      appSidebar.classList.add('mobile-active');
    });
  }

  if (closeSidebarBtn && appSidebar) {
    closeSidebarBtn.addEventListener('click', () => {
      appSidebar.classList.remove('mobile-active');
    });
  }
}

/* ==========================================================================
   4. Modals and Forms Integration
   ========================================================================== */

// Helper to open modal
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('active');
}

// Helper to close modal
function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('active');
}

function initModalListeners() {
  // Bind close buttons in all modals
  const closeBtns = document.querySelectorAll('[data-close]');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(document.getElementById(modalId));
    });
  });

  // Close modal when clicking overlay background
  const overlays = document.querySelectorAll('.modal-overlay');
  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // Quick Action Add Button (in header) opens transaction modal
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', () => {
      openTransactionModalForm();
    });
  }

  // Listen for custom trigger events from view components
  document.addEventListener('open-transaction-modal', (e) => {
    const tx = e.detail?.transaction;
    openTransactionModalForm(tx);
  });

  document.addEventListener('open-budget-modal', (e) => {
    const cat = e.detail?.category;
    const limit = e.detail?.limit;
    openBudgetModalForm(cat, limit);
  });

  document.addEventListener('open-goal-modal', () => {
    openGoalModalForm();
  });

  document.addEventListener('open-contribution-modal', (e) => {
    const goal = e.detail?.goal;
    const type = e.detail?.type;
    openContributionModalForm(goal, type);
  });

  // Bind individual forms
  bindTransactionForm();
  bindBudgetForm();
  bindGoalForm();
  bindContributionForm();
}

/* --- A. Transaction Form Logic --- */

const transactionForm = document.getElementById('transactionForm');
const txTypeRadios = document.querySelectorAll('input[name="txType"]');
const txCategorySelect = document.getElementById('txCategory');
const modalCurrencySymbol = document.getElementById('modalCurrencySymbol');

function populateCategories(type = 'expense', selectedValue = '') {
  if (!txCategorySelect) return;
  
  txCategorySelect.innerHTML = '';
  
  Object.entries(CATEGORIES)
    .filter(([, cat]) => cat.type === type)
    .forEach(([key, cat]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = cat.name;
      if (key === selectedValue) {
        opt.selected = true;
      }
      txCategorySelect.appendChild(opt);
    });
}

function openTransactionModalForm(tx = null) {
  if (!transactionModal || !transactionForm) return;

  const titleEl = document.getElementById('transactionModalTitle');
  const idInput = document.getElementById('txId');
  const descInput = document.getElementById('txDescription');
  const amountInput = document.getElementById('txAmount');
  const dateInput = document.getElementById('txDate');
  const paymentSelect = document.getElementById('txPaymentMethod');
  const notesInput = document.getElementById('txNotes');

  // Set Currency Symbol
  if (modalCurrencySymbol) {
    modalCurrencySymbol.textContent = 'Kz';
  }

  // If Editing
  if (tx) {
    titleEl.textContent = 'Editar Transação';
    idInput.value = tx.id;
    descInput.value = tx.description;
    amountInput.value = tx.amount;
    dateInput.value = tx.date;
    paymentSelect.value = tx.paymentMethod || 'Cash';
    notesInput.value = tx.notes || '';
    
    // Toggle active type radio button
    txTypeRadios.forEach(radio => {
      radio.checked = radio.value === tx.type;
      const label = radio.closest('.type-option');
      if (radio.checked) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });

    populateCategories(tx.type, tx.category);
  } else {
    // Creating fresh transaction
    titleEl.textContent = 'Nova Transação';
    idInput.value = '';
    transactionForm.reset();
    
    // Default Date to today
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Ensure "Expense" radio is active by default
    txTypeRadios.forEach(radio => {
      radio.checked = radio.value === 'expense';
      const label = radio.closest('.type-option');
      if (radio.checked) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
    
    populateCategories('expense');
  }

  // Add click handlers for custom radio designs
  txTypeRadios.forEach(radio => {
    const label = radio.closest('.type-option');
    label.addEventListener('click', () => {
      txTypeRadios.forEach(r => r.closest('.type-option').classList.remove('active'));
      label.classList.add('active');
      radio.checked = true;
      populateCategories(radio.value);
    });
  });

  openModal(transactionModal);
}

function bindTransactionForm() {
  if (!transactionForm) return;

  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('txId').value;
    const type = document.querySelector('input[name="txType"]:checked').value;
    const description = document.getElementById('txDescription').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    const category = document.getElementById('txCategory').value;
    const date = document.getElementById('txDate').value;
    const paymentMethod = document.getElementById('txPaymentMethod').value;
    const notes = document.getElementById('txNotes').value;

    const data = {
      description,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes
    };

    if (id) {
      // Edit
      store.editTransaction(id, data);
    } else {
      // Create
      store.addTransaction(data);
    }

    closeModal(transactionModal);
  });
}

/* --- B. Budget Form Logic --- */

const budgetForm = document.getElementById('budgetForm');
const budgetCategorySelect = document.getElementById('budgetCategory');
const budgetModalCurrencySymbol = document.getElementById('budgetModalCurrencySymbol');

function openBudgetModalForm(catKey = '', limitAmount = '') {
  if (!budgetModal || !budgetForm || !budgetCategorySelect) return;

  // Set Currency Symbol
  if (budgetModalCurrencySymbol) {
    budgetModalCurrencySymbol.textContent = 'Kz';
  }

  // Populate Categories
  budgetCategorySelect.innerHTML = '';
  Object.entries(CATEGORIES)
    .filter(([, cat]) => cat.type === 'expense')
    .forEach(([key, cat]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = cat.name;
      if (key === catKey) {
        opt.selected = true;
      }
      budgetCategorySelect.appendChild(opt);
    });

  // Set inputs
  document.getElementById('budgetLimit').value = limitAmount;
  
  if (catKey) {
    budgetCategorySelect.disabled = true; // Block category edit if editing limit
    document.getElementById('budgetModalTitle').textContent = 'Editar Orçamento';
  } else {
    budgetCategorySelect.disabled = false;
    document.getElementById('budgetModalTitle').textContent = 'Configurar Orçamento';
  }

  openModal(budgetModal);
}

function bindBudgetForm() {
  if (!budgetForm) return;

  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Enable disabled select to capture value on submit
    budgetCategorySelect.disabled = false;
    const category = budgetCategorySelect.value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);

    store.setBudget(category, limit);
    closeModal(budgetModal);
  });
}

/* --- C. Goal Form Logic --- */

const goalForm = document.getElementById('goalForm');
const goalModalCurrencySymbol = document.getElementById('goalModalCurrencySymbol');

function openGoalModalForm() {
  if (!goalModal || !goalForm) return;
  
  // Set Currency Symbol
  if (goalModalCurrencySymbol) {
    goalModalCurrencySymbol.textContent = 'Kz';
  }

  goalForm.reset();
  // Default deadline to 3 months from now
  const nextThreeMonths = new Date();
  nextThreeMonths.setMonth(nextThreeMonths.getMonth() + 3);
  document.getElementById('goalDeadline').value = nextThreeMonths.toISOString().split('T')[0];

  openModal(goalModal);
}

function bindGoalForm() {
  if (!goalForm) return;

  goalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('goalName').value;
    const target = parseFloat(document.getElementById('goalTarget').value);
    const deadline = document.getElementById('goalDeadline').value;
    const icon = document.getElementById('goalIcon').value;

    store.addGoal({ name, target, deadline, icon });
    closeModal(goalModal);
  });
}

/* --- D. Contribution Form Logic --- */

const contributionForm = document.getElementById('contributionForm');
const contribModalCurrencySymbol = document.getElementById('contribModalCurrencySymbol');

function openContributionModalForm(goal, type = 'deposit') {
  if (!contributionModal || !contributionForm) return;

  // Set Currency Symbol
  if (contribModalCurrencySymbol) {
    contribModalCurrencySymbol.textContent = 'Kz';
  }

  contributionForm.reset();
  
  // Set hidden variables
  document.getElementById('contributionGoalId').value = goal.id;
  document.getElementById('contributionType').value = type;

  // Set titles
  const titleEl = document.getElementById('contributionModalTitle');
  const nameEl = document.getElementById('contributionGoalName');
  const submitBtn = document.getElementById('contribSubmitBtn');
  const helperEl = document.getElementById('contribHelperText');
  const amountInput = document.getElementById('contributionAmount');

  nameEl.innerHTML = `Meta poupança: <strong>${goal.name}</strong>`;
  
  if (type === 'deposit') {
    titleEl.textContent = 'Reforçar Meta';
    submitBtn.textContent = 'Reforçar Poupança';
    submitBtn.className = 'btn btn-primary';
    helperEl.textContent = 'Este valor será debitado do seu saldo geral atual e adicionado à meta.';
    amountInput.max = ''; // No max, client can save as much as they want (will show negative balance if overdrafted, which is normal)
  } else {
    titleEl.textContent = 'Levantar Fundos';
    submitBtn.textContent = 'Levantar Saldo';
    submitBtn.className = 'btn btn-danger';
    helperEl.textContent = 'O valor será retirado da meta e devolvido ao seu saldo geral.';
    amountInput.max = goal.current; // Cannot withdraw more than saved
  }

  openModal(contributionModal);
}

function bindContributionForm() {
  if (!contributionForm) return;

  contributionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('contributionGoalId').value;
    const type = document.getElementById('contributionType').value;
    const amount = parseFloat(document.getElementById('contributionAmount').value);

    store.contributeToGoal(id, amount, type);
    closeModal(contributionModal);
  });
}
