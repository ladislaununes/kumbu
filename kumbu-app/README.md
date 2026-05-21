# 💰 Kumbu++ - Controle de Gastos Pessoais

Um aplicativo moderno e intuitivo para controle de gastos pessoais, desenvolvido com React e Vite.

## 🚀 Funcionalidades

- **Registro de Transações**: Adicione receitas e despesas com descrição, valor, categoria e data
- **Dashboard Financeiro**: Visualize o total de receitas, despesas e saldo atual
- **Categorias Personalizadas**: Alimentação, Transporte, Lazer, Saúde, Educação, Moradia e Outros
- **Edição e Exclusão**: Edite ou remova transações existentes
- **Persistência Local**: Os dados são salvos automaticamente no localStorage do navegador
- **Design Responsivo**: Funciona perfeitamente em dispositivos móveis e desktop
- **Interface Moderna**: Gradientes, animações e cards elegantes

## 🛠️ Tecnologias Utilizadas

- React 18
- Vite
- CSS3 (com Flexbox e Grid)
- LocalStorage API

## 📦 Instalação

```bash
# Navegue até a pasta do projeto
cd kumbu-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 🏗️ Build para Produção

```bash
# Gere a build otimizada
npm run build

# Preview da build
npm run preview
```

## 📱 Como Usar

1. **Adicionar Transação**:
   - Preencha a descrição (ex: "Compras do mês")
   - Informe o valor em Reais (R$)
   - Selecione o tipo: Receita ou Despesa
   - Escolha uma categoria
   - Clique em "Adicionar"

2. **Editar Transação**:
   - Clique no ícone ✏️ ao lado da transação desejada
   - Modifique os campos necessários
   - Clique em "Atualizar"

3. **Excluir Transação**:
   - Clique no ícone 🗑️ ao lado da transação que deseja remover

## 🎨 Personalização

Você pode personalizar as categorias editando o array `categories` no componente `App.jsx`.

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal.
