/* ==========================================================================
   Kumbu++ Budgets View
   ========================================================================== */

import store from '../state.js';
import { formatCurrency, CATEGORIES } from '../utils.js';

export function renderBudgets(container) {
  const budgets = store.getBudgets();
  const categoryExpenses = store.getCategoryExpenses();
  const settings = store.getSettings();

  // Filter only expense categories
  const expenseCategories = Object.entries(CATEGORIES).filter(([, cat]) => cat.type === 'expense');

  let html = `
    <!-- Budgets Header / Explainer -->
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 class="section-title" style="margin-bottom: 6px;">Orçamentos Mensais</h2>
        <p style="color: var(--text-secondary); font-size: 14px; max-width: 500px;">
          Defina limites de gastos mensais para cada categoria e evite surpresas. 
          Acompanhe o consumo dos seus limites através das cores indicadoras.
        </p>
      </div>
      <button class="btn btn-primary" id="openAddBudgetBtn">
        <i data-lucide="plus"></i>
        <span>Definir Limite</span>
      </button>
    </div>

    <!-- Budgets Grid -->
    <div class="budgets-grid">
      ${expenseCategories.map(([key, cat]) => {
        const limit = budgets[key];
        const spent = categoryExpenses[key] || 0;
        
        // If no budget is set for this category
        if (limit === undefined) {
          return `
            <div class="card budget-card" style="opacity: 0.85; border-style: dashed; border-width: 2px;">
              <div class="budget-card-header">
                <div class="budget-cat-info">
                  <div class="budget-icon" style="background-color: var(--border-light); color: var(--text-muted)">
                    <i class="lucide-${cat.icon}"></i>
                  </div>
                  <div>
                    <h3 class="budget-name" style="color: var(--text-muted)">${cat.name}</h3>
                    <span style="font-size: 12px; color: var(--text-muted);">Sem limite ativo</span>
                  </div>
                </div>
              </div>
              
              <div style="margin-top: 16px; text-align: center; padding: 12px 0;">
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Gastos atuais: ${formatCurrency(spent, settings.currency)}</p>
                <button class="btn btn-secondary btn-icon-text set-cat-budget-btn" data-category="${key}" style="font-size: 12px; padding: 6px 12px; width: 100%;">
                  <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Definir Limite
                </button>
              </div>
            </div>
          `;
        }

        // Budget is set
        const pct = Math.min((spent / limit) * 100, 100);
        let progressClass = 'progress-success';
        let statusClass = 'ok';
        let statusText = '';
        
        if (pct >= 100) {
          progressClass = 'progress-danger';
          statusClass = 'over';
          statusText = `Ultrapassou em ${formatCurrency(spent - limit, settings.currency)}`;
        } else if (pct >= 80) {
          progressClass = 'progress-warning';
          statusClass = 'warning';
          statusText = `Resta apenas ${formatCurrency(limit - spent, settings.currency)}`;
        } else {
          statusText = `Disponível: ${formatCurrency(limit - spent, settings.currency)}`;
        }

        return `
          <div class="card budget-card">
            <div class="budget-card-header">
              <div class="budget-cat-info">
                <div class="budget-icon" style="background-color: ${cat.bg}; color: ${cat.color}">
                  <i class="lucide-${cat.icon}"></i>
                </div>
                <div>
                  <h3 class="budget-name">${cat.name}</h3>
                  <span style="font-size: 11px; color: var(--text-muted)">Limite: ${formatCurrency(limit, settings.currency)}</span>
                </div>
              </div>
              
              <div class="budget-actions">
                <button class="btn btn-secondary btn-icon set-cat-budget-btn" data-category="${key}" title="Editar">
                  <i data-lucide="pencil" style="width: 13px; height: 13px;"></i>
                </button>
                <button class="btn btn-danger btn-icon delete-budget-btn" data-category="${key}" title="Remover">
                  <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
                </button>
              </div>
            </div>

            <div class="budget-amount-row">
              <span class="budget-spent">${formatCurrency(spent, settings.currency)}</span>
              <span class="budget-total">de ${formatCurrency(limit, settings.currency)}</span>
            </div>

            <div class="budget-progress-bg">
              <div class="budget-progress-bar ${progressClass}" style="width: ${pct}%"></div>
            </div>

            <div class="budget-status-text ${statusClass}">
              <span>${pct.toFixed(0)}% consumido</span>
              <span>${statusText}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;

  // Re-initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Bind Event Listeners
  
  // Open Add Budget Dialog
  const addBtn = container.querySelector('#openAddBudgetBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('open-budget-modal'));
    });
  }

  // Set Budget buttons (both for fresh setting and editing)
  const setBtns = container.querySelectorAll('.set-cat-budget-btn');
  setBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catKey = e.currentTarget.getAttribute('data-category');
      const currentLimit = budgets[catKey] || '';
      document.dispatchEvent(new CustomEvent('open-budget-modal', {
        detail: { category: catKey, limit: currentLimit }
      }));
    });
  });

  // Remove Budget buttons
  const deleteBtns = container.querySelectorAll('.delete-budget-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catKey = e.currentTarget.getAttribute('data-category');
      const catName = CATEGORIES[catKey]?.name || 'esta categoria';
      if (confirm(`Deseja remover o limite de orçamento para ${catName}?`)) {
        store.setBudget(catKey, 0); // 0 deletes it in state
        renderBudgets(container);
      }
    });
  });
}
