/**
 * CSV Export Utilities
 * 
 * Functions for exporting financial data to CSV format
 */

import { formatCents } from './utils';
import { Database } from '@/types/database.types';
import { calculateInvoiceDueDate, formatInvoicePeriod } from './invoiceLogic';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Card = Database['public']['Tables']['cards']['Row'];

interface TransactionWithRelations extends Transaction {
    category?: Category | null;
    card?: Card | null;
}

/**
 * Convert array of values to CSV row
 */
function toCsvRow(values: (string | number)[]): string {
    return values
        .map(val => {
            const strVal = String(val);
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
                return `"${strVal.replace(/"/g, '""')}"`;
            }
            return strVal;
        })
        .join(',');
}

/**
 * Generate CSV content from transactions
 */
export function generateTransactionsCsv(
    transactions: TransactionWithRelations[],
    cards: Card[]
): string {
    const headers = [
        'Data',
        'Nome do Item',
        'Categoria',
        'Valor Total',
        'Parcela',
        'Valor da Parcela',
        'Mês da Fatura',
        'Cartão',
        'Status'
    ];

    const rows = transactions.map(tx => {
        const date = new Date(tx.posted_at).toLocaleDateString('pt-BR');
        const description = tx.description;
        const category = tx.category?.name || 'Sem categoria';

        // Calculate total value for installment purchases
        const installmentTotal = tx.installments > 1
            ? formatCents(tx.amount_cents * tx.installments)
            : formatCents(tx.amount_cents);

        const installmentInfo = tx.installments > 1
            ? `${tx.installment_number}/${tx.installments}`
            : '1/1';

        const installmentValue = formatCents(tx.amount_cents);

        // Calculate invoice month
        let invoiceMonth = 'N/A';
        if (tx.card_id && tx.card) {
            const dueDay = tx.card.due_day || 10;
            const closingDaysBefore = tx.card.closing_days_before || 10;
            const invoiceDueDate = calculateInvoiceDueDate(
                new Date(tx.posted_at),
                dueDay,
                closingDaysBefore
            );
            invoiceMonth = formatInvoicePeriod(invoiceDueDate);
        } else {
            invoiceMonth = 'À vista';
        }

        const cardName = tx.card?.name || 'Dinheiro';
        const status = 'Pendente'; // Future: could track paid status

        return [
            date,
            description,
            category,
            installmentTotal,
            installmentInfo,
            installmentValue,
            invoiceMonth,
            cardName,
            status
        ];
    });

    const csvLines = [
        toCsvRow(headers),
        ...rows.map(row => toCsvRow(row))
    ];

    return csvLines.join('\n');
}

/**
 * Download CSV file to browser
 */
export function downloadCsv(content: string, filename: string): void {
    // Create Blob with UTF-8 BOM for proper encoding in Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Export transactions for a specific month
 */
export function exportMonthTransactions(
    transactions: TransactionWithRelations[],
    cards: Card[],
    year: number,
    month: number // 1-12
): void {
    // Filter transactions for the specific month
    const filtered = transactions.filter(tx => {
        const txDate = new Date(tx.posted_at);
        return txDate.getFullYear() === year && txDate.getMonth() === month - 1;
    });

    if (filtered.length === 0) {
        alert('Nenhuma transação encontrada para este mês.');
        return;
    }

    const csvContent = generateTransactionsCsv(filtered, cards);
    const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long' });
    const filename = `gastos_${monthName}_${year}.csv`;

    downloadCsv(csvContent, filename);
}
