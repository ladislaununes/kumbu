/* ==========================================================================
   Kumbu++ Savings Goals View
   ========================================================================== */

import store from '../state.js';
import { formatCurrency, formatDate, GOAL_ICONS } from '../utils.js';

export function renderGoals(container) {
  const goals = store.getGoals();
  const settings = store.getSettings();

  let html = `
    <!-- Goals Header -->
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 class="section-title" style="margin-bottom: 6px;">Metas de Poupança</h2>
        <p style="color: var(--text-secondary); font-size: 14px; max-width: 550px;">
          Poupe para os seus sonhos de forma organizada. 
          Reforce as suas metas (reduzindo o seu saldo atual) ou levante o valor poupado se precisar.
        </p>
      </div>
      <button class="btn btn-primary" id="openAddGoalBtn">
        <i data-lucide="plus"></i>
        <span>Nova Meta</span>
      </button>
    </div>

    <!-- Goals Grid -->
    ${goals.length === 0 ? `
      <div class="card empty-state" style="padding: 60px 24px;">
        <div class="empty-state-icon">
          <i data-lucide="target"></i>
        </div>
        <h3>Sem metas financeiras</h3>
        <p>Defina a sua primeira meta, como um fundo de emergência ou fundos para uma viagem.</p>
        <button class="btn btn-primary" id="emptyAddGoalBtn">Criar Primeira Meta</button>
      </div>
    ` : `
      <div class="goals-grid">
        ${goals.map(goal => {
          const pct = Math.min((goal.current / goal.target) * 100, 100);
          const icon = GOAL_ICONS[goal.icon] || 'piggy-bank';
          
          return `
            <div class="card goal-card" data-id="${goal.id}">
              <div class="goal-card-header">
                <div class="goal-title-wrapper">
                  <div class="goal-emoji">
                    <i class="lucide-${icon}" style="color: var(--primary); width: 22px; height: 22px;"></i>
                  </div>
                  <div>
                    <h3 class="goal-name">${goal.name}</h3>
                    <span class="goal-deadline">Prazo: ${formatDate(goal.deadline)}</span>
                  </div>
                </div>
                
                <button class="btn btn-danger btn-icon delete-goal-btn" style="background: none; border: none; padding: 4px; opacity: 0.6;" title="Eliminar Meta">
                  <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
              </div>

              <div class="goal-value-row">
                <div>
                  <span class="goal-current">${formatCurrency(goal.current, settings.currency)}</span>
                  <span class="goal-target"> de ${formatCurrency(goal.target, settings.currency)}</span>
                </div>
                <div class="goal-progress-percent">${pct.toFixed(0)}%</div>
              </div>

              <div class="budget-progress-bg" style="height: 10px; margin-bottom: 20px;">
                <div class="budget-progress-bar progress-success" style="width: ${pct}%; background-color: var(--primary)"></div>
              </div>

              <div class="goal-buttons">
                <button class="btn btn-secondary contribute-btn" data-type="deposit">
                  <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Reforço
                </button>
                <button class="btn btn-secondary contribute-btn" data-type="withdraw" ${goal.current <= 0 ? 'disabled' : ''}>
                  <i data-lucide="minus" style="width: 14px; height: 14px;"></i> Levantamento
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  container.innerHTML = html;

  // Re-initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Bind Event Listeners
  
  // Open Add Goal Modal
  const addBtn = container.querySelector('#openAddGoalBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('open-goal-modal'));
    });
  }

  const emptyAddBtn = container.querySelector('#emptyAddGoalBtn');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('open-goal-modal'));
    });
  }

  // Delete Goal
  const deleteBtns = container.querySelectorAll('.delete-goal-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.goal-card');
      const id = card.getAttribute('data-id');
      const goal = goals.find(g => g.id === id);
      if (goal && confirm(`Tem a certeza que deseja eliminar a meta "${goal.name}"?`)) {
        store.deleteGoal(id);
        renderGoals(container);
      }
    });
  });

  // Contribute Buttons (Deposit or Withdraw)
  const contribBtns = container.querySelectorAll('.contribute-btn');
  contribBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.goal-card');
      const id = card.getAttribute('data-id');
      const type = e.currentTarget.getAttribute('data-type');
      const goal = goals.find(g => g.id === id);
      
      if (goal) {
        document.dispatchEvent(new CustomEvent('open-contribution-modal', {
          detail: { goal: goal, type: type }
        }));
      }
    });
  });
}
