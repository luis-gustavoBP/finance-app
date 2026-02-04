# 💰 ContApp - Gerenciador Financeiro Inteligente

O **ContApp** é um aplicativo de controle financeiro pessoal desenvolvido para quem deseja simplicidade e precisão no gerenciamento de gastos, com foco especial em cartões de crédito, parcelamentos e planejamento mensal.

---

## 🚀 Funcionalidades Principais

### 1. 📊 Dashboard Inteligente
- **Visão Geral**: Resumo do saldo disponível, gastos do mês e orçamento configurado.
- **Progresso Semanal**: Gráfico intuitivo que mostra quanto você ainda pode gastar na semana para manter sua meta.
- **Ritmo de Gastos**: Comparativo entre o gasto real e o limite planejado no mês.
- **Gráfico de Categorias**: Visualização em pizza das áreas onde você mais gasta (alimentação, lazer, assinaturas, etc.).
- **Evolução Mensal**: Gráfico de linha mostrando o histórico de gastos acumulados.

### 2. 💳 Gestão de Cartões de Crédito
- **Limites Dinâmicos**: Acompanhamento do limite total disponível somado de todos os cartões.
- **Faturas Elegantes**: Visualização clara de faturas abertas e fechadas.
- **Status de Pagamento**: Controle fácil de quais faturas já foram pagas para fechar o caixa do mês.
- **Cálculo de Parcelas**: O app calcula automaticamente o impacto de compras parceladas nos meses futuros.

### 3. 📝 Controle de Gastos (Despesas)
- **Inserção Rápida**: Cadastro simplificado de novas compras.
- **Parcelamento Automático**: Ao inserir compras parceladas, o app distribui as parcelas nos meses seguintes automaticamente.
- **Filtro Mensal**: Navegue entre meses passados e futuros para ver históricos ou planejamentos.
- **Status de Pagamento**: Marque despesas como pagas individualmente.

### 4. 📈 Controle de Entradas (Receitas)
- **Categorização de Destino**: Separe sua receita entre o que vai para o **Orçamento Mensal** e o que vai para **Poupança/Investimentos**.
- **Histórico de Recebimentos**: Lista completa de todas as fontes de renda do mês.

### 5. 🔒 Segurança e Privacidade
- **Autenticação Segura**: Gerenciamento de usuários via Supabase (Login, Cadastro e Recuperação de Senha).
- **Proteção de Dados (RLS)**: Cada usuário tem acesso estritamente aos seus próprios dados de forma isolada e segura.
- **Confirmação por Email**: Verificação obrigatória de email para garantir a autenticidade das contas.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/).
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) (Design moderno e responsivo).
- **Backend / DB**: [Supabase](https://supabase.com/) (PostgreSQL, Auth e Row Level Security).
- **Gráficos**: [Recharts](https://recharts.org/).
- **Gerenciamento de Estado**: [SWR](https://swr.vercel.app/) (Data fetching) e Context API.

---

## ⚙️ Instalação e Configuração

1. **Clone o repositório**:
   ```bash
   git clone <URL_DO_REPO>
   cd contapp
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz com:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

---

## 📂 Estrutura do Banco de Dados
O sistema utiliza as seguintes tabelas principais:
- `transactions`: Todos os gastos (débitos e cartões).
- `cards`: Cadastro de cartões de crédito.
- `invoices`: Controle de faturas mensais.
- `income_entries`: Todas as receitas recebidas.
- `user_settings`: Metas semanais e orçamentos globais.
- `categories`: Organização personalizada de gastos.

---

Desenvolvido com foco em **clareza financeira** e **UX premium**. 💎
