/* ==========================================================================
   Kumbu++ Reports View
   ========================================================================== */

import store from '../state.js';
import { formatCurrency, CATEGORIES } from '../utils.js';

export function renderReports(container) {
  const allTx = store.getTransactions();
  const settings = store.getSettings();
  const summary = store.getFinancialSummary();

  // If no transactions, display empty state
  if (allTx.length === 0) {
    container.innerHTML = `
      <div class="card empty-state" style="padding: 80px 24px;">
        <div class="empty-state-icon">
          <i data-lucide="trending-up"></i>
        </div>
        <h3>Sem dados suficientes</h3>
        <p>Registe transações de receita e despesa para gerar relatórios detalhados e gráficos interativos.</p>
      </div>
    `;
    return;
  }

  // Build Reports layout
  let html = `
    <!-- Top summary info -->
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 class="section-title" style="margin-bottom: 6px;">Relatórios Financeiros</h2>
        <p style="color: var(--text-secondary); font-size: 14px; max-width: 550px;">
          Analise visualmente as suas receitas, despesas e a evolução do seu património líquido (saldo acumulado) ao longo do tempo.
        </p>
      </div>
      <div style="display: flex; gap: 24px; text-align: right;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; display: block;">Saldo Acumulado</span>
          <span style="font-family: var(--font-display); font-size: 20px; font-weight: 700; color: ${summary.balance >= 0 ? 'var(--success)' : 'var(--danger)'}">
            ${formatCurrency(summary.balance, settings.currency)}
          </span>
        </div>
      </div>
    </div>

    <!-- Reports Grid Layout -->
    <div class="reports-layout">
      <!-- 1. Expenses by Category -->
      <div class="card">
        <div class="section-header-row">
          <h2 class="section-title">Despesas por Categoria</h2>
          <i data-lucide="pie-chart" style="color: var(--text-muted)"></i>
        </div>
        <div class="chart-wrapper">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>

      <!-- 2. Monthly Income vs Expenses -->
      <div class="card">
        <div class="section-header-row">
          <h2 class="section-title">Mensal: Entradas vs Saídas</h2>
          <i data-lucide="bar-chart-3" style="color: var(--text-muted)"></i>
        </div>
        <div class="chart-wrapper">
          <canvas id="monthlyChart"></canvas>
        </div>
      </div>

      <!-- 3. Balance Trend over Time -->
      <div class="card reports-full-width">
        <div class="section-header-row">
          <h2 class="section-title">Evolução do Saldo Acumulado</h2>
          <i data-lucide="trending-up" style="color: var(--text-muted)"></i>
        </div>
        <div class="chart-wrapper" style="height: 360px;">
          <canvas id="trendChart"></canvas>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Re-initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Check if Chart.js is available
  if (!window.Chart) {
    console.error('Chart.js is not loaded');
    return;
  }

  // Resolve themes for colors
  const isDark = document.body.classList.contains('dark-theme');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const fontConfig = {
    family: "'Inter', sans-serif",
    size: 11
  };

  /* --- 1. Render Category Doughnut Chart --- */
  const categoryExpenses = store.getCategoryExpenses();
  const expenseEntries = Object.entries(categoryExpenses).filter(([key]) => CATEGORIES[key]?.type === 'expense');

  if (expenseEntries.length > 0) {
    const catCanvas = container.querySelector('#categoryChart');
    const labels = expenseEntries.map(([key]) => CATEGORIES[key]?.name || 'Outros');
    const data = expenseEntries.map(([, val]) => val);
    const colors = expenseEntries.map(([key]) => CATEGORIES[key]?.color || '#64748b');

    new window.Chart(catCanvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: isDark ? '#0d111c' : '#ffffff',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              font: fontConfig,
              padding: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${formatCurrency(context.raw, settings.currency)}`;
              }
            }
          }
        }
      }
    });
  } else {
    // Show fallback text inside canvas parent
    const wrapper = container.querySelector('#categoryChart').parentNode;
    wrapper.innerHTML = '<div style="color: var(--text-muted); font-size: 14px; text-align: center;">Nenhuma despesa registada para o gráfico de categorias.</div>';
  }

  /* --- 2. Render Monthly Bar Chart --- */
  // Group incomes and expenses by month-year
  const monthlyData = {}; // Format: { '2026-07': { income: X, expense: Y } }
  
  allTx.forEach(tx => {
    if (!tx.date) return;
    const monthKey = tx.date.substring(0, 7); // 'YYYY-MM'
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      monthlyData[monthKey].income += tx.amount;
    } else {
      monthlyData[monthKey].expense += tx.amount;
    }
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort();

  if (sortedMonths.length > 0) {
    const monthlyCanvas = container.querySelector('#monthlyChart');
    const monthNamesPT = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };

    const labels = sortedMonths.map(m => {
      const [year, month] = m.split('-');
      return `${monthNamesPT[month]} ${year.substring(2)}`;
    });
    
    const incomeData = sortedMonths.map(m => monthlyData[m].income);
    const expenseData = sortedMonths.map(m => monthlyData[m].expense);

    new window.Chart(monthlyCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receitas',
            data: incomeData,
            backgroundColor: '#10b981', // Success
            borderRadius: 6,
            maxBarThickness: 32
          },
          {
            label: 'Despesas',
            data: expenseData,
            backgroundColor: '#f43f5e', // Danger/Rose
            borderRadius: 6,
            maxBarThickness: 32
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: fontConfig
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${formatCurrency(context.raw, settings.currency)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: fontConfig }
          },
          y: {
            grid: { color: gridColor },
            ticks: { 
              color: textColor, 
              font: fontConfig,
              callback: function(value) {
                // Short currency form
                if (value >= 1000) {
                  return (value / 1000).toFixed(0) + 'k';
                }
                return value;
              }
            }
          }
        }
      }
    });
  }

  /* --- 3. Render Balance Trend Line Chart --- */
  // Sort ALL transactions oldest to newest
  const chronoTx = [...allTx].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (chronoTx.length > 0) {
    const trendCanvas = container.querySelector('#trendChart');
    
    // Group transactions by date to show daily cumulative progression
    const dailyBalances = []; // Array of { date: 'YYYY-MM-DD', balance: X }
    let cumulative = 0;
    
    // First, map date to net daily change
    const dailyNet = {};
    chronoTx.forEach(tx => {
      if (!tx.date) return;
      const change = tx.type === 'income' ? tx.amount : -tx.amount;
      dailyNet[tx.date] = (dailyNet[tx.date] || 0) + change;
    });

    const sortedDates = Object.keys(dailyNet).sort();
    sortedDates.forEach(date => {
      cumulative += dailyNet[date];
      dailyBalances.push({ date, balance: cumulative });
    });

    // Translate dates to readable strings
    const labels = dailyBalances.map(db => {
      const [, m, d] = db.date.split('-');
      const monthNamesShort = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
        '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
      };
      return `${d} ${monthNamesShort[m]}`;
    });
    
    const data = dailyBalances.map(db => db.balance);

    // Create glowing gradient
    const ctx = trendCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)'); // Primary color (Violet)
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

    new window.Chart(trendCanvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Saldo Acumulado',
          data: data,
          borderColor: '#7c3aed', // Primary
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#7c3aed',
          pointHoverRadius: 6,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function(context) {
                // Return full date if possible
                const index = context[0].dataIndex;
                const db = dailyBalances[index];
                const parts = db.date.split('-');
                return `Data: ${parts[2]}/${parts[1]}/${parts[0]}`;
              },
              label: function(context) {
                return ` Saldo: ${formatCurrency(context.raw, settings.currency)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: fontConfig }
          },
          y: {
            grid: { color: gridColor },
            ticks: { 
              color: textColor, 
              font: fontConfig,
              callback: function(value) {
                if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                if (value <= -1000) return (value / 1000).toFixed(0) + 'k';
                return value;
              }
            }
          }
        }
      }
    });
  }
}
