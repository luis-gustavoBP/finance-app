# 💰 ContApp - Controle Financeiro Pessoal

## 📝 Descrição

ContApp é uma aplicação web completa de controle financeiro pessoal, focada em gestão de gastos com cartão de crédito, rastreamento de parcelamentos e controle de orçamento mensal. Desenvolvida com Next.js 14, React e Supabase.

---

## 🎯 Principais Funcionalidades

### 1. 📊 Dashboard Inteligente

- **Visão Geral Financeira**
  - Saldo disponível do mês (Orçamento - Gastos + Entradas)
  - Barra de progresso visual do orçamento
  - Alertas coloridos (verde, amarelo, vermelho) conforme % gasto

- **Widgets de Acompanhamento**
  - 📅 **Progresso Semanal**: Gastos da semana atual vs meta semanal
  - 📈 **Evolução Mensal**: Gráfico de linha mostrando gastos acumulados
  - 🎯 **Compromissos Futuros**: Próximas parcelas a vencer
  - 🍕 **Gastos por Categoria**: Gráfico de pizza com distribuição de gastos
  - 💵 **Entradas no Mês**: Total de dinheiro extra recebido + últimas 3 entradas

- **Transações Recentes**
  - Últimas 5 transações com detalhes
  - Indicador visual de parcelas (ex: "2/12")
  - Cores por categoria

### 2. 💳 Gestão de Gastos

- **Adicionar Transações**
  - Descrição do gasto
  - Valor em R$ (formatação automática)
  - Data da compra
  - Categoria (com ícone e cor)
  - Cartão de crédito (opcional)
  - **Parcelamento inteligente**: Divide automaticamente em múltiplas parcelas

- **Visualizar Gastos**
  - Lista completa ordenada por data
  - Filtros por período, categoria, cartão
  - Edição inline de transações
  - Exclusão com confirmação
  - Indicador de parcelas vinculadas

- **Parcelamento Automático**
  - Criação automática de N parcelas
  - Vínculo entre parcela-mãe e parcelas-filhas
  - Cálculo de datas considerando ciclo da fatura
  - Visualização clara de "X/Y parcelas"

### 3. 🏷️ Categorias Personalizadas

- **CRUD Completo**
  - Criar categorias ilimitadas
  - Escolher ícone emoji para cada categoria
  - Definir cor de identificação (hex color picker)
  - Editar nome, ícone e cor
  - **Proteção**: Não pode deletar categoria com transações vinculadas

- **Categorias Padrão**
  - 🍔 Alimentação
  - 🚗 Transporte
  - 🏠 Casa
  - 💊 Saúde
  - 🎮 Lazer
  - 📦 Outros

### 4. 💳 Configuração de Cartões

- **Gerenciamento de Cartões**
  - Adicionar múltiplos cartões
  - Nome personalizado
  - Últimos 4 dígitos (opcional)
  - Cor de identificação
  - Definir limite mensal

- **Ciclo de Fatura Inteligente**
  - **Dia de vencimento** (1-31)
  - **Dias antes do vencimento** para fechamento da fatura (1-30)
  - Cálculo automático do dia de fechamento
  - Lógica de fatura: compra após fechamento → conta na fatura seguinte

- **Rastreamento por Cartão**
  - Gasto atual vs limite do cartão
  - Barra de progresso individual
  - Dashboard mostra todos os cartões ativos

### 5. 💵 Registro de Entradas de Dinheiro

- **Tipos de Entrada**
  - 💰 **Extra**: Dinheiro inesperado
  - ↩️ **Reembolso**: Devolução de gasto
  - 🎁 **Presente**: Presente em dinheiro
  - 💼 **Freelance**: Trabalho extra
  - 🎯 **Bônus**: Bonificação
  - 📦 **Outros**: Outro tipo

- **Gerenciamento**
  - Descrição da entrada
  - Valor recebido
  - Data de recebimento
  - Observações opcionais
  - Lista completa de entradas com filtros

- **Impacto no Saldo**
  - Entradas são somadas ao saldo disponível
  - Fórmula: `Saldo = Orçamento + Entradas - Gastos`
  - Widget no dashboard mostra total mensal

### 6. ⚙️ Configurações e Metas

- **Orçamento Mensal Global**
  - Definir limite total de gastos do mês
  - Input formatado em R$
  - Armazenado em centavos no banco

- **Meta de Gasto Semanal**
  - Definir objetivo de gastos por semana
  - Feedback visual no dashboard
  - Ajuda a manter controle diário

- **Configuração de Cartões**
  - Painel dedicado para cada cartão
  - Ajustes de limite, vencimento e fechamento
  - Visualização do ciclo calculado

### 7. 📤 Exportação de Dados

- **Exportar para CSV**
  - Seletor de mês/ano
  - Exportação com encoding UTF-8 (suporta acentos)
  - Colunas incluídas:
    - Data da compra
    - Descrição
    - Valor
    - Categoria
    - Cartão
    - Parcelas (ex: "3/12")
    - **Mês da Fatura** (calculado baseado no ciclo do cartão)
  - Download automático no navegador

### 8. 🔐 Autenticação e Segurança

- **Sistema de Login/Registro**
  - Autenticação via Supabase Auth
  - Email + senha
  - Confirmação de email (opcional)
  - Senha de acesso global ao app (configurável)

- **Segurança de Dados**
  - Row Level Security (RLS) no Supabase
  - Cada usuário vê apenas seus dados
  - Políticas de INSERT, UPDATE, DELETE, SELECT
  - Tokens JWT para autenticação

### 9. 📊 Lógica de Fatura de Cartão

- **Cálculo Inteligente**
  - `closing_date = due_day - closing_days_before`
  - Compra **antes** do fechamento → fatura do mês atual
  - Compra **após** fechamento → fatura do mês seguinte
  - Tratamento de bordas de mês (ex: dia 31 em meses com 30 dias)

- **Aplicação Automática**
  - Usado no cálculo de parcelamentos
  - Exibido na exportação CSV
  - Pode ser mostrado na lista de transações

### 10. 🎨 Interface e UX

- **Design Moderno**
  - Gradientes vibrantes
  - Modo escuro/claro (toggle)
  - Animações suaves
  - Responsivo (mobile e desktop)

- **Componentes Reutilizáveis**
  - Modais consistentes
  - Inputs formatados (moeda)
  - Botões com states (loading, disabled)
  - Cards informativos

- **Feedback Visual**
  - Mensagens de sucesso/erro
  - Loading states
  - Confirmações para ações destrutivas
  - Badges coloridos por categoria/status

---

## 🏗️ Arquitetura Técnica

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Estilo**: Tailwind CSS (ou CSS Vanilla)
- **Estado**: Hooks customizados + SWR para cache
- **Gráficos**: Recharts

### Backend
- **BaaS**: Supabase
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Real-time**: Supabase Realtime (subscriptions)

### Estrutura de Dados

**5 Tabelas Principais:**
1. **categories** - Categorias de gastos
2. **cards** - Cartões de crédito
3. **transactions** - Todas as transações/gastos
4. **user_settings** - Configurações do usuário
5. **income_entries** - Entradas de dinheiro

**Features do Banco:**
- RLS habilitado em todas as tabelas
- Trigger de proteção (não deletar categoria com transações)
- RPC function para criar parcelamentos
- Indexes otimizados
- Constraints de validação

---

## 🚀 Como Usar

### Setup Inicial
1. Clone o projeto
2. Configure `.env.local` com credenciais Supabase
3. Execute migration SQL (`supabase_complete_schema.sql`)
4. `npm install && npm run dev`
5. Acesse `http://localhost:3000`

### Workflow Típico
1. **Primeiro Acesso**
   - Criar conta
   - Configurar orçamento mensal
   - Criar categorias básicas
   - Adicionar cartões

2. **Uso Diário**
   - Adicionar gastos conforme compra
   - Marcar se é parcelado
   - Registrar entradas extras
   - Acompanhar progresso no dashboard

3. **Fim do Mês**
   - Revisar gastos por categoria
   - Exportar relatório CSV
   - Ajustar orçamento do próximo mês
   - Planejar gastos futuros

---

## 🎯 Diferenciais

1. **Foco em Cartão de Crédito**: Lógica específica de ciclo de fatura
2. **Parcelamento Inteligente**: Criação automática e rastreamento
3. **Visual Atraente**: Design moderno e responsivo
4. **Controle Completo**: CRUD em todas as entidades
5. **Exportação**: Relatórios prontos para análise
6. **Entradas de Dinheiro**: Rastreamento de receitas extras
7. **Segurança**: RLS + autenticação robusta

---

## 📈 Métricas e Insights

O app fornece visão clara de:
- Quanto você gastou hoje/semana/mês
- Qual categoria consome mais
- Qual cartão está mais próximo do limite
- Quanto falta para a meta semanal
- Quanto você ainda pode gastar no mês
- Quais parcelas vencem em breve
- Impacto de entradas extras no saldo

---

## 🔮 Possíveis Melhorias Futuras

- [ ] Vincular reembolsos a gastos específicos
- [ ] Gráficos de evolução mensal (histórico)
- [ ] Metas por categoria
- [ ] Notificações de vencimento
- [ ] App mobile (React Native)
- [ ] Importação de extratos bancários
- [ ] Compartilhamento multi-usuário (família)
- [ ] Relatórios em PDF

---

**Status**: ✅ Pronto para uso!  
**Tecnologias**: Next.js + React + TypeScript + Supabase + PostgreSQL  
**Licença**: MIT  
**Autor**: Desenvolvido com ❤️ para controle financeiro pessoal
