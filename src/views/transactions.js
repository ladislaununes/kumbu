/* ==========================================================================
   Kumbu++ Transactions View
   ========================================================================== */

import store from '../state.js';
import { formatCurrency, formatDate, CATEGORIES } from '../utils.js';

// Component state (persists during app execution session)
let filters = {
  search: '',
  category: 'all',
  type: 'all',
  page: 1,
  limit: 8
};

export function renderTransactions(container) {
  const allTx = store.getTransactions();
  const settings = store.getSettings();
  
  // 1. Apply Filters
  let filteredTx = allTx.filter(tx => {
    // Search Filter
    const searchMatch = tx.description.toLowerCase().includes(filters.search.toLowerCase()) || 
                        (tx.notes && tx.notes.toLowerCase().includes(filters.search.toLowerCase()));
    
    // Category Filter
    const categoryMatch = filters.category === 'all' || tx.category === filters.category;
    
    // Type Filter
    const typeMatch = filters.type === 'all' || tx.type === filters.type;
    
    return searchMatch && categoryMatch && typeMatch;
  });

  // 2. Pagination Calculations
  const totalItems = filteredTx.length;
  const totalPages = Math.ceil(totalItems / filters.limit) || 1;
  
  // Adjust current page if out of bounds
  if (filters.page > totalPages) {
    filters.page = totalPages;
  }
  
  const startIndex = (filters.page - 1) * filters.limit;
  const endIndex = Math.min(startIndex + filters.limit, totalItems);
  const paginatedTx = filteredTx.slice(startIndex, startIndex + filters.limit);

  // Translate payment methods
  const paymentMethods = {
    Cash: 'Dinheiro',
    Card: 'Multicaixa',
    Transfer: 'Transferência',
    Mobile: 'Mobile Money'
  };

  // Build View HTML
  let html = `
    <!-- Filters Toolbar -->
    <div class="card toolbar-card">
      <div class="toolbar-grid">
        <!-- Search Input -->
        <div class="search-input-wrapper">
          <i data-lucide="search"></i>
          <input type="text" id="searchTx" class="form-input" placeholder="Pesquisar transações..." value="${filters.search}">
        </div>
        
        <!-- Category Filter -->
        <div>
          <select id="filterCategory" class="form-input custom-select">
            <option value="all" ${filters.category === 'all' ? 'selected' : ''}>Todas as Categorias</option>
            ${Object.entries(CATEGORIES).map(([key, cat]) => `
              <option value="${key}" ${filters.category === key ? 'selected' : ''}>${cat.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <select id="filterType" class="form-input custom-select">
            <option value="all" ${filters.type === 'all' ? 'selected' : ''}>Todos os Tipos</option>
            <option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>Despesas (-)</option>
            <option value="income" ${filters.type === 'income' ? 'selected' : ''}>Receitas (+)</option>
          </select>
        </div>

        <!-- Action Button -->
        <button class="btn btn-primary" id="addTxBtn">
          <i data-lucide="plus"></i>
          <span>Nova</span>
        </button>
      </div>
    </div>

    <!-- Transactions Ledger Card -->
    <div class="card" style="flex: 1; display: flex; flex-direction: column;">
      ${paginatedTx.length === 0 ? `
        <div class="empty-state" style="flex: 1;">
          <div class="empty-state-icon">
            <i data-lucide="file-question"></i>
          </div>
          <h3>Nenhuma transação encontrada</h3>
          <p>Não encontramos transações que coincidam com os filtros aplicados.</p>
          <button class="btn btn-secondary" id="clearFiltersBtn">Limpar Filtros</button>
        </div>
      ` : `
        <div class="tx-table-wrapper" style="flex: 1;">
          <table class="tx-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>Pagamento</th>
                <th>Valor</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedTx.map(tx => {
                const cat = CATEGORIES[tx.category] || { name: 'Outros', icon: 'help-circle', color: '#64748b', bg: '#64748b20' };
                return `
                  <tr data-id="${tx.id}">
                    <td>
                      <div class="tx-desc-cell">
                        <div class="tx-icon-wrapper" style="background-color: ${cat.bg}; color: ${cat.color}">
                          <i class="lucide-${cat.icon}"></i>
                        </div>
                        <div class="tx-info">
                          <span class="tx-name">${tx.description}</span>
                          ${tx.notes ? `<span class="tx-notes">${tx.notes}</span>` : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="tx-category-badge" style="background-color: ${cat.bg}; color: ${cat.color}">
                        ${cat.name}
                      </span>
                    </td>
                    <td style="color: var(--text-secondary)">
                      ${formatDate(tx.date)}
                    </td>
                    <td style="color: var(--text-secondary)">
                      ${paymentMethods[tx.paymentMethod] || tx.paymentMethod || 'Dinheiro'}
                    </td>
                    <td>
                      <span class="tx-amount ${tx.type === 'income' ? 'income' : 'expense'}">
                        ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount, settings.currency)}
                      </span>
                    </td>
                    <td>
                      <div class="tx-actions">
                        <button class="btn btn-secondary btn-icon edit-tx-btn" title="Editar">
                          <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn btn-danger btn-icon delete-tx-btn" title="Eliminar">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="pagination-container">
          <div class="pagination-info">
            A mostrar <strong>${totalItems > 0 ? startIndex + 1 : 0}</strong> a <strong>${endIndex}</strong> de <strong>${totalItems}</strong> transações
          </div>
          <div class="pagination-buttons">
            <button class="btn btn-secondary btn-icon" id="prevPageBtn" ${filters.page === 1 ? 'disabled' : ''}>
              <i data-lucide="chevron-left"></i>
            </button>
            <button class="btn btn-secondary btn-icon" id="nextPageBtn" ${filters.page === totalPages ? 'disabled' : ''}>
              <i data-lucide="chevron-right"></i>
            </button>
          </div>
        </div>
      `}
    </div>
  `;

  container.innerHTML = html;

  // Re-initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Bind Event Listeners
  
  // Search Input (de-bounced a little or input listener)
  const searchInput = container.querySelector('#searchTx');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filters.search = e.target.value;
      filters.page = 1; // Reset to page 1
      renderTransactions(container);
      // Keep focus and place cursor at the end
      const input = container.querySelector('#searchTx');
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  // Category Filter select
  const catFilter = container.querySelector('#filterCategory');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      filters.category = e.target.value;
      filters.page = 1;
      renderTransactions(container);
    });
  }

  // Type Filter select
  const typeFilter = container.querySelector('#filterType');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      filters.type = e.target.value;
      filters.page = 1;
      renderTransactions(container);
    });
  }

  // Clear filters button
  const clearFiltersBtn = container.querySelector('#clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      filters.search = '';
      filters.category = 'all';
      filters.type = 'all';
      filters.page = 1;
      renderTransactions(container);
    });
  }

  // Pagination Prev Button
  const prevBtn = container.querySelector('#prevPageBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (filters.page > 1) {
        filters.page--;
        renderTransactions(container);
      }
    });
  }

  // Pagination Next Button
  const nextBtn = container.querySelector('#nextPageBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (filters.page < totalPages) {
        filters.page++;
        renderTransactions(container);
      }
    });
  }

  // Open Modal Add Transaction
  const addBtn = container.querySelector('#addTxBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('open-transaction-modal'));
    });
  }

  // Delete Transaction Buttons
  const deleteBtns = container.querySelectorAll('.delete-tx-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      const id = tr.getAttribute('data-id');
      if (confirm('Tem a certeza que deseja eliminar esta transação?')) {
        store.deleteTransaction(id);
        // Page updates automatically if subscribed, but standard is to render
        renderTransactions(container);
      }
    });
  });

  // Edit Transaction Buttons
  const editBtns = container.querySelectorAll('.edit-tx-btn');
  editBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      const id = tr.getAttribute('data-id');
      const tx = store.getTransactions().find(t => t.id === id);
      if (tx) {
        document.dispatchEvent(new CustomEvent('open-transaction-modal', { detail: { transaction: tx } }));
      }
    });
  });
}
