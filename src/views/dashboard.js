/* ==========================================================================
   Kumbu++ Dashboard View
   ========================================================================== */

import store from '../state.js';
import { formatCurrency, formatDate, CATEGORIES } from '../utils.js';

export function renderDashboard(container) {
  const summary = store.getFinancialSummary();
  const settings = store.getSettings();
  const transactions = store.getTransactions().slice(0, 5); // Get recent 5
  
  // Get expenses by category
  const categoryExpenses = store.getCategoryExpenses();
  const topCategories = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Top 4 categories
    
  const totalExpense = summary.expense || 1; // Prevent division by zero

  // Build HTML Structure
  let html = `
    <!-- Top Summary Grid -->
    <div class="dashboard-grid">
      <!-- Balance Card -->
      <div class="card summary-card">
        <div class="card-title">
          <span>Saldo Total</span>
          <i data-lucide="wallet"></i>
        </div>
        <div class="summary-value ${summary.balance >= 0 ? '' : 'trend-down'}">
          ${formatCurrency(summary.balance, settings.currency)}
        </div>
        <div class="summary-trend">
          <span class="${summary.balance >= 0 ? 'trend-up' : 'trend-down'}">
            <i data-lucide="${summary.balance >= 0 ? 'trending-up' : 'trending-down'}"></i>
            ${summary.balance >= 0 ? 'Saldo Positivo' : 'Saldo Negativo'}
          </span>
        </div>
        <div class="summary-progress-bg">
          <div class="summary-progress-bar primary" style="width: 100%"></div>
        </div>
      </div>

      <!-- Income Card -->
      <div class="card summary-card">
        <div class="card-title">
          <span>Receitas</span>
          <i data-lucide="arrow-up-circle" style="color: var(--success)"></i>
        </div>
        <div class="summary-value" style="color: var(--success)">
          ${formatCurrency(summary.income, settings.currency)}
        </div>
        <div class="summary-trend trend-up">
          <i data-lucide="plus"></i> Entrada mensal
        </div>
        <div class="summary-progress-bg">
          <div class="summary-progress-bar success" style="width: ${summary.income > 0 ? '100%' : '0%'}"></div>
        </div>
      </div>

      <!-- Expense Card -->
      <div class="card summary-card">
        <div class="card-title">
          <span>Despesas</span>
          <i data-lucide="arrow-down-circle" style="color: var(--danger)"></i>
        </div>
        <div class="summary-value" style="color: var(--danger)">
          ${formatCurrency(summary.expense, settings.currency)}
        </div>
        <div class="summary-trend trend-down">
          <i data-lucide="minus"></i> Saída mensal
        </div>
        <div class="summary-progress-bg">
          <div class="summary-progress-bar danger" style="width: ${summary.income > 0 ? Math.min((summary.expense / summary.income) * 100, 100) + '%' : '0%'}"></div>
        </div>
      </div>

      <!-- Savings Card -->
      <div class="card summary-card">
        <div class="card-title">
          <span>Taxa de Poupança</span>
          <i data-lucide="percent"></i>
        </div>
        <div class="summary-value">
          ${summary.savingsRate.toFixed(1)}%
        </div>
        <div class="summary-trend ${summary.savingsRate > 20 ? 'trend-up' : 'trend-neutral'}">
          <i data-lucide="shield-check"></i> ${summary.savingsRate > 20 ? 'Excelente poupança!' : 'Meta: poupar > 20%'}
        </div>
        <div class="summary-progress-bg">
          <div class="summary-progress-bar primary" style="width: ${Math.max(0, Math.min(summary.savingsRate, 100))}%"></div>
        </div>
      </div>
    </div>

    <!-- Main Sections Split -->
    <div class="dashboard-sections">
      <!-- Recent Transactions -->
      <div class="card">
        <div class="section-header-row">
          <h2 class="section-title">Transações Recentes</h2>
          <button class="btn btn-secondary btn-icon" id="viewAllTxBtn" title="Ver Todas">
            <i data-lucide="arrow-right"></i>
          </button>
        </div>
        
        ${transactions.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">
              <i data-lucide="arrow-left-right"></i>
            </div>
            <h3>Sem transações</h3>
            <p>Comece por registar a sua primeira despesa ou receita para ver os dados aqui.</p>
          </div>
        ` : `
          <div class="tx-table-wrapper">
            <table class="tx-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(tx => {
                  const cat = CATEGORIES[tx.category] || { name: 'Outros', icon: 'help-circle', color: '#64748b', bg: '#64748b20' };
                  return `
                    <tr>
                      <td>
                        <div class="tx-desc-cell">
                          <div class="tx-icon-wrapper" style="background-color: ${cat.bg}; color: ${cat.color}">
                            <i data-lucide="${cat.icon}"></i>
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
                      <td>
                        <span class="tx-amount ${tx.type === 'income' ? 'income' : 'expense'}">
                          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount, settings.currency)}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Category Breakdown (Mini Reports / Budget Status) -->
      <div class="card">
        <div class="section-header-row">
          <h2 class="section-title">Distribuição de Gastos</h2>
          <i data-lucide="pie-chart" style="color: var(--text-muted)"></i>
        </div>
        
        ${topCategories.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">
              <i data-lucide="donut"></i>
            </div>
            <h3>Sem despesas</h3>
            <p>Nenhuma despesa registada para gerar distribuição por categoria.</p>
          </div>
        ` : `
          <div class="chart-wrapper" style="height: 180px; margin-bottom: 20px;">
            <canvas id="miniDashboardChart"></canvas>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${topCategories.map(([catKey, val]) => {
              const cat = CATEGORIES[catKey] || { name: 'Outros', color: '#64748b' };
              const percentage = ((val / totalExpense) * 100).toFixed(0);
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                    <span style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${cat.color}; display: inline-block;"></span>
                      ${cat.name}
                    </span>
                    <span style="color: var(--text-secondary); font-weight: 600;">
                      ${formatCurrency(val, settings.currency)} (${percentage}%)
                    </span>
                  </div>
                  <div class="summary-progress-bg" style="margin-top: 0; height: 5px;">
                    <div class="summary-progress-bar" style="width: ${percentage}%; background-color: ${cat.color}"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  container.innerHTML = html;
  
  // Re-initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Hook view all transactions button
  const viewAllBtn = container.querySelector('#viewAllTxBtn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      const txTab = document.querySelector('.nav-item[data-view="transactions"]');
      if (txTab) txTab.click();
    });
  }

  // Initialize mini Chart.js doughnut
  if (topCategories.length > 0 && window.Chart) {
    const canvas = container.querySelector('#miniDashboardChart');
    if (canvas) {
      const labels = topCategories.map(([key]) => CATEGORIES[key]?.name || 'Outros');
      const data = topCategories.map(([, val]) => val);
      const colors = topCategories.map(([key]) => CATEGORIES[key]?.color || '#64748b');

      new window.Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.raw;
                  return ` ${formatCurrency(val, settings.currency)}`;
                }
              }
            }
          },
          cutout: '75%'
        }
      });
    }
  }
}
