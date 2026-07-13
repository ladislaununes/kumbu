/* ==========================================================================
   Kumbu++ Helper Utilities
   ========================================================================== */

// Category Definitions with color tokens and Lucide icon mappings
export const CATEGORIES = {
  // Expenses
  alimentacao: { name: 'Alimentação', icon: 'utensils', color: '#10b981', bg: '#10b98120', type: 'expense' },
  lazer: { name: 'Lazer & Diversão', icon: 'party-popper', color: '#ec4899', bg: '#ec489920', type: 'expense' },
  transportes: { name: 'Transportes', icon: 'car', color: '#f59e0b', bg: '#f59e0b20', type: 'expense' },
  habitacao: { name: 'Habitação & Contas', icon: 'home', color: '#3b82f6', bg: '#3b82f620', type: 'expense' },
  saude: { name: 'Saúde', icon: 'heart-pulse', color: '#f43f5e', bg: '#f43f5e20', type: 'expense' },
  educacao: { name: 'Educação', icon: 'graduation-cap', color: '#6366f1', bg: '#6366f120', type: 'expense' },
  outros: { name: 'Outros Gastos', icon: 'help-circle', color: '#64748b', bg: '#64748b20', type: 'expense' },
  
  // Incomes
  salario: { name: 'Salário', icon: 'briefcase', color: '#10b981', bg: '#10b98120', type: 'income' },
  investimentos: { name: 'Investimentos', icon: 'trending-up', color: '#06b6d4', bg: '#06b6d420', type: 'income' },
  premios: { name: 'Prémios & Bónus', icon: 'gift', color: '#a855f7', bg: '#a855f720', type: 'income' },
  outras_receitas: { name: 'Outras Receitas', icon: 'circle-dollar-sign', color: '#84cc16', bg: '#84cc1620', type: 'income' }
};

// Map savings goal icons to Lucide icons
export const GOAL_ICONS = {
  car: 'car',
  plane: 'plane',
  home: 'home',
  'piggy-bank': 'piggy-bank',
  'graduation-cap': 'graduation-cap',
  'heart-pulse': 'heart-pulse',
  gift: 'gift',
  laptop: 'laptop'
};

/**
 * Format currency according to selected currency code
 * @param {number} amount 
 * @param {string} currencyCode ('AOA' | 'EUR' | 'USD')
 * @returns {string} Formatted string
 */
export function formatCurrency(amount, currencyCode = 'AOA') {
  if (amount === undefined || amount === null) amount = 0;
  
  switch (currencyCode) {
    case 'AOA':
      // Localized format for Angolan Kwanza
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
    default:
      return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

/**
 * Format date to a friendly Portuguese representation
 * @param {string} dateStr (YYYY-MM-DD)
 * @returns {string} e.g. "12 de Jul, 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00'); // Prevent timezone offset shift
  
  const day = date.getDate();
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month}, ${year}`;
}

/**
 * Generate a simple unique ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Helper to get the correct icon class for a category
 * @param {string} categoryKey 
 * @returns {string} Lucide icon name
 */
export function getCategoryIcon(categoryKey) {
  return CATEGORIES[categoryKey]?.icon || 'help-circle';
}

/**
 * Helper to get the color of a category
 * @param {string} categoryKey 
 * @returns {string} Hex color
 */
export function getCategoryColor(categoryKey) {
  return CATEGORIES[categoryKey]?.color || '#64748b';
}

/**
 * Get category name
 * @param {string} categoryKey 
 * @returns {string}
 */
export function getCategoryName(categoryKey) {
  return CATEGORIES[categoryKey]?.name || 'Outros';
}
