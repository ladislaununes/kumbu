import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('kumbu-transactions')
    return saved ? JSON.parse(saved) : []
  })
  
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Alimentação')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    localStorage.setItem('kumbu-transactions', JSON.stringify(transactions))
  }, [transactions])

  const categories = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Moradia', 'Outros']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    if (editingId) {
      setTransactions(transactions.map(t => 
        t.id === editingId 
          ? { ...t, description, amount: parseFloat(amount), type, category }
          : t
      ))
      setEditingId(null)
    } else {
      const newTransaction = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date().toLocaleDateString('pt-BR')
      }
      setTransactions([newTransaction, ...transactions])
    }

    setDescription('')
    setAmount('')
    setType('expense')
    setCategory('Alimentação')
  }

  const handleEdit = (transaction) => {
    setDescription(transaction.description)
    setAmount(transaction.amount.toString())
    setType(transaction.type)
    setCategory(transaction.category)
    setEditingId(transaction.id)
  }

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setDescription('')
      setAmount('')
      setType('expense')
      setCategory('Alimentação')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setDescription('')
    setAmount('')
    setType('expense')
    setCategory('Alimentação')
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Kumbu++</h1>
        <p>Controle de Gastos Pessoais</p>
      </header>

      <div className="summary">
        <div className="card income">
          <h3>Receitas</h3>
          <p className="value positive">+ R$ {totalIncome.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h3>Despesas</h3>
          <p className="value negative">- R$ {totalExpense.toFixed(2)}</p>
        </div>
        <div className={`card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <h3>Saldo</h3>
          <p className="value">R$ {balance.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <h2>{editingId ? 'Editar Transação' : 'Nova Transação'}</h2>
        
        <div className="form-group">
          <label>Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Compras do mês"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? 'Atualizar' : 'Adicionar'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="transactions">
        <h2>Histórico</h2>
        {transactions.length === 0 ? (
          <p className="empty-message">Nenhuma transação registrada ainda.</p>
        ) : (
          <ul className="transaction-list">
            {transactions.map(transaction => (
              <li key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-info">
                  <span className="transaction-description">{transaction.description}</span>
                  <span className="transaction-category">{transaction.category}</span>
                  <span className="transaction-date">{transaction.date}</span>
                </div>
                <div className="transaction-actions">
                  <span className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                  </span>
                  <button onClick={() => handleEdit(transaction)} className="btn-edit">✏️</button>
                  <button onClick={() => handleDelete(transaction.id)} className="btn-delete">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
