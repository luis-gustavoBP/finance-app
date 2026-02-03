# Nova Funcionalidade: Registro de Entradas de Dinheiro 💵

## Resumo

Implementada funcionalidade completa para registrar **entradas de dinheiro** (receitas não-recorrentes ou inesperadas), permitindo que o usuário tenha um controle mais realista do seu saldo disponível.

---

## 🎯 O Que Foi Implementado

### 1. **Banco de Dados**
- **Nova tabela**: `income_entries`
- **Campos**:
  - `id` (UUID)
  - `user_id` (UUID, referência ao usuário)
  - `description` (texto, ex: "Venda do teclado")
  - `amount_cents` (inteiro, valor em centavos)
  - `received_at` (data de recebimento)
  - `type` (tipo: extra, reembolso, presente, freelance, bonus, outros)
  - `notes` (observações opcionais)
  - `created_at` (timestamp)
- **RLS habilitado**: Cada usuário vê apenas suas próprias entradas
- **Arquivo**: `supabase_income_entries.sql`

### 2. **Tipos de Entrada**
- 💰 **Extra** - Dinheiro inesperado
- ↩️ **Reembolso** - Devolução de gasto
- 🎁 **Presente** - Presente em dinheiro
- 💼 **Freelance** - Trabalho extra
- 🎯 **Bônus** - Bonificação
- 📦 **Outros** - Outro tipo

### 3. **Hook Customizado** (`useIncome.ts`)
- `incomeEntries` - Lista de todas as entradas
- `addIncome()` - Adicionar nova entrada
- `updateIncome()` - Editar entrada existente
- `deleteIncome()` - Excluir entrada
- **Real-time**: Atualiza automaticamente quando há mudanças

### 4. **Componentes UI**

#### `AddIncomeModal`
- Modal para adicionar novas entradas
- Campos:
  - Valor recebido (R$)
  - Descrição
  - Data de recebimento
  - Tipo (seleção visual com botões)
  - Observações (opcional)
- Validação de entrada
- Feedback visual

#### `MonthlyIncome` (Dashboard Widget)
- Exibe total de entradas do mês atual
- Lista as 3 últimas entradas
- Design verde (positivo)
- Aparece no dashboard

#### Página `Entradas` (`/entradas`)
- Lista completa de todas as entradas
- Card de resumo com total geral
- Botão "+ Nova Entrada"
- Opção de excluir entradas
- Visual organizado por data

### 5. **Atualização no Dashboard**
- **Nova fórmula de saldo disponível**:
  ```
  Saldo = Orçamento Mensal + Entradas do Mês - Gastos do Mês
  ```
- Exibe informação extra quando há entradas:
  - "Inclui +R$ 300 extras" (exemplo)

### 6. **Navegação**
- Novo item no menu: **Entradas**
- Ícone: ➕ (círculo com mais)
- Disponível em desktop e mobile

---

## 📍 Onde Usar

### Para Adicionar Entrada:
1. Clique em **Entradas** no menu
2. Clique em **"+ Nova Entrada"**
3. Preencha:
   - Valor (ex: R$ 250,00)
   - Descrição (ex: "Venda do teclado")
   - Selecione o tipo
   - (Opcional) Adicione observações
4. Clique em **"Salvar Entrada"**

### Para Ver Entradas:
- **Dashboard**: Widget "💵 Entradas no Mês" mostra resumo
- **Página Entradas**: Lista completa com todos os detalhes

---

## 🧮 Impacto no Saldo

### Antes (sem entradas):
```
Orçamento: R$ 1.600
Gastos: R$ 800
Saldo disponível: R$ 800
```

### Depois (com entradas):
```
Orçamento: R$ 1.600
Gastos: R$ 800
Entradas extras: +R$ 300 (ex: venda, freelance)
Saldo disponível: R$ 1.100 ✨
```

**Resultado**: O app mostra quanto você REALMENTE tem disponível para gastar!

---

## 🚀 Como Ativar

### 1. Executar Migração SQL
No **Supabase Dashboard**:
1. Vá em **SQL Editor**
2. Abra o arquivo `supabase_income_entries.sql`
3. Execute o script
4. Verifique com as queries de verificação no final do arquivo

### 2. Reiniciar o App
```bash
# Se ainda não estiver rodando
npm run dev
```

### 3. Testar
1. Acesse o menu **Entradas**
2. Adicione uma entrada de teste
3. Verifique o dashboard - o saldo deve atualizar automaticamente

---

## 📋 Arquivos Criados/Modificados

### Novos Arquivos:
1. `supabase_income_entries.sql` - Migração do banco
2. `src/hooks/useIncome.ts` - Hook de dados
3. `src/components/income/AddIncomeModal.tsx` - Modal de adicionar
4. `src/components/dashboard/MonthlyIncome.tsx` - Widget do dashboard
5. `src/app/entradas/page.tsx` - Página de entradas

### Arquivos Modificados:
1. `src/types/database.types.ts` - Tipos TypeScript
2. `src/app/page.tsx` - Dashboard (cálculo de saldo)
3. `src/components/layout/Header.tsx` - Menu de navegação

---

## ✅ Benefícios

1. **Saldo Realista**: O app agora sabe quando você recebe dinheiro extra
2. **Melhor Planejamento**: Você pode decidir se pode gastar baseado no saldo real
3. **Rastreamento Completo**: Todas as movimentações financeiras em um só lugar
4. **Transparência**: Entende de onde veio cada Real

---

## 🔮 Melhorias Futuras (Opcional)

- Vincular reembolsos a gastos específicos (neutralizar o gasto)
- Gráfico de entradas vs gastos no tempo
- Exportar entradas no CSV junto com gastos
- Categorias customizadas de entrada
- Recorrência (ex: freelance mensal)

---

## 🧪 Testado

- ✅ Adicionar entrada
- ✅ Listar entradas
- ✅ Excluir entrada
- ✅ Cálculo de saldo com entradas
- ✅ Widget do dashboard
- ✅ Real-time updates
- ✅ Navegação mobile e desktop

---

**Status**: ✅ Implementação completa e funcional!

Para usar, execute a migração SQL `supabase_income_entries.sql` no Supabase e comece a registrar suas entradas de dinheiro!
