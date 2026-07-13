/* ==========================================================================
   Kumbu++ State Management
   ========================================================================= */

import { generateId } from './utils.js';

// Default State if no data is found in localStorage
const DEFAULT_STATE = {
  transactions: [
    {
      id: 'tx-1',
      description: 'Salário Sonangol',
      amount: 650000,
      type: 'income',
      category: 'salario',
      date: '2026-07-01',
      paymentMethod: 'Transfer',
      notes: 'Salário base mensal'
    },
    {
      id: 'tx-2',
      description: 'Supermercado Candando',
      amount: 78500,
      type: 'expense',
      category: 'alimentacao',
      date: '2026-07-03',
      paymentMethod: 'Card',
      notes: 'Compras de despensa para o mês'
    },
    {
      id: 'tx-3',
      description: 'Combustível Sonangol',
      amount: 15000,
      type: 'expense',
      category: 'transportes',
      date: '2026-07-05',
      paymentMethod: 'Card',
      notes: 'Abastecimento da viatura'
    },
    {
      id: 'tx-4',
      description: 'Consultoria Web Freelance',
      amount: 180000,
      type: 'income',
      category: 'investimentos',
      date: '2026-07-06',
      paymentMethod: 'Transfer',
      notes: 'Projeto de website concluído'
    },
    {
      id: 'tx-5',
      description: 'Renda do Apartamento',
      amount: 150000,
      type: 'expense',
      category: 'habitacao',
      date: '2026-07-08',
      paymentMethod: 'Transfer',
      notes: 'Renda mensal T2'
    },
    {
      id: 'tx-6',
      description: 'Jantar Restaurante Nikki\'s',
      amount: 32000,
      type: 'expense',
      category: 'lazer',
      date: '2026-07-10',
      paymentMethod: 'Card',
      notes: 'Jantar em família'
    },
    {
      id: 'tx-7',
      description: 'Consulta Geral - Climed',
      amount: 25000,
      type: 'expense',
      category: 'saude',
      date: '2026-07-11',
      paymentMethod: 'Card',
      notes: 'Consulta de rotina'
    },
    {
      id: 'tx-8',
      description: 'Curso online Avançado JS',
      amount: 45000,
      type: 'expense',
      category: 'educacao',
      date: '2026-07-12',
      paymentMethod: 'Transfer',
      notes: 'Formação pessoal'
    }
  ],
  budgets: {
    alimentacao: 120000,
    transportes: 40000,
    lazer: 60000,
    habitacao: 200000,
    saude: 50000,
    educacao: 80000
  },
  goals: [
    {
      id: 'goal-1',
      name: 'Fundo de Emergência',
      target: 1200000,
      current: 450000,
      deadline: '2026-12-31',
      icon: 'piggy-bank'
    },
    {
      id: 'goal-2',
      name: 'Férias em Benguela',
      target: 400000,
      current: 180000,
      deadline: '2026-09-15',
      icon: 'plane'
    },
    {
      id: 'goal-3',
      name: 'Computador Novo',
      target: 850000,
      current: 720000,
      deadline: '2026-10-30',
      icon: 'laptop'
    }
  ],
  settings: {
    currency: 'AOA',
    theme: 'dark'
  }
};

class StateManager {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  // Load state from localStorage or load defaults
  loadState() {
    try {
      const serialized = localStorage.getItem('kumbu_state_v2');
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE)); // deep clone
  }

  // Save current state to localStorage
  saveState() {
    try {
      localStorage.setItem('kumbu_state_v2', JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  // Subscribe to state updates
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all observers of state change
  notify() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error in listener callback:', e);
      }
    });
  }

  /* --- Transactions API --- */
  
  getTransactions() {
    return this.state.transactions;
  }

  addTransaction(tx) {
    const newTx = {
      id: tx.id || 'tx-' + generateId(),
      ...tx
    };
    this.state.transactions.unshift(newTx); // Add to the beginning
    this.saveState();
    this.notify();
    return newTx;
  }

  editTransaction(id, updatedTx) {
    const index = this.state.transactions.findIndex(tx => tx.id === id);
    if (index !== -1) {
      this.state.transactions[index] = { ...this.state.transactions[index], ...updatedTx };
      this.saveState();
      this.notify();
      return true;
    }
    return false;
  }

  deleteTransaction(id) {
    const originalLength = this.state.transactions.length;
    this.state.transactions = this.state.transactions.filter(tx => tx.id !== id);
    if (this.state.transactions.length !== originalLength) {
      this.saveState();
      this.notify();
      return true;
    }
    return false;
  }

  /* --- Budgets API --- */

  getBudgets() {
    return this.state.budgets;
  }

  setBudget(category, limit) {
    if (limit <= 0) {
      delete this.state.budgets[category];
    } else {
      this.state.budgets[category] = limit;
    }
    this.saveState();
    this.notify();
  }

  /* --- Goals API --- */

  getGoals() {
    return this.state.goals;
  }

  addGoal(goal) {
    const newGoal = {
      id: 'goal-' + generateId(),
      current: 0,
      ...goal
    };
    this.state.goals.push(newGoal);
    this.saveState();
    this.notify();
    return newGoal;
  }

  deleteGoal(id) {
    this.state.goals = this.state.goals.filter(goal => goal.id !== id);
    this.saveState();
    this.notify();
  }

  contributeToGoal(id, amount, type = 'deposit') {
    const goal = this.state.goals.find(g => g.id === id);
    if (!goal) return false;

    if (type === 'deposit') {
      goal.current += amount;
      // Add a matching expense transaction to account for this outgo
      this.addTransaction({
        description: `Reforço: ${goal.name}`,
        amount: amount,
        type: 'expense',
        category: 'outros',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Transfer',
        notes: `Transferência para a poupança da meta: ${goal.name}`
      });
    } else if (type === 'withdraw') {
      // Ensure we don't withdraw more than saved
      const withdrawAmount = Math.min(amount, goal.current);
      goal.current -= withdrawAmount;
      // Add a matching income transaction to account for goal liquidation
      this.addTransaction({
        description: `Levantamento: ${goal.name}`,
        amount: withdrawAmount,
        type: 'income',
        category: 'outras_receitas',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Transfer',
        notes: `Levantamento de fundos poupados da meta: ${goal.name}`
      });
    }

    this.saveState();
    this.notify();
    return true;
  }

  /* --- Settings API --- */

  getSettings() {
    return this.state.settings;
  }

  updateSetting(key, value) {
    this.state.settings[key] = value;
    this.saveState();
    this.notify();
  }

  /* --- Derived State Calculations --- */

  // Calculates Net Balance, Total Incomes, and Total Expenses
  getFinancialSummary() {
    let income = 0;
    let expense = 0;

    this.state.transactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }

  // Get total spent per category for current month (or all time since it's mock/simplified)
  getCategoryExpenses() {
    const totals = {};
    this.state.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
      }
    });
    return totals;
  }
}

export const store = new StateManager();
export default store;
