/**
 * Invoice Logic Utilities
 * 
 * Core business logic for credit card invoice calculations.
 * Determines which invoice a purchase affects based on card closing dates.
 */

/**
 * Calculate the actual closing day considering month boundaries
 * 
 * @param dueDay - Day of month when invoice is due (1-31)
 * @param closingDaysBefore - Days before due that invoice closes (1-30)
 * @param referenceDate - Date to calculate for (defaults to today)
 * @returns Closing date for that month's invoice
 * 
 * @example
 * // Due on 10th, closes 10 days before
 * calculateClosingDate(10, 10, new Date('2024-03-15'))
 * // Returns Date for Feb 29, 2024 (or Feb 28 in non-leap years)
 */
export function calculateClosingDate(
    dueDay: number,
    closingDaysBefore: number,
    referenceDate: Date = new Date()
): Date {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    // Create due date for current month
    const dueDate = new Date(year, month, dueDay);

    // Subtract closing days to get closing date
    const closingDate = new Date(dueDate);
    closingDate.setDate(dueDate.getDate() - closingDaysBefore);

    return closingDate;
}

/**
 * Determine which invoice a purchase will appear on
 * 
 * CRITICAL BUSINESS RULE:
 * - If purchase date >= closing day → goes to NEXT invoice
 * - If purchase date < closing day → goes to CURRENT invoice
 * 
 * @param purchaseDate - When the purchase was made
 * @param dueDay - Day of month when invoice is due (1-31)
 * @param closingDaysBefore - Days before due that invoice closes
 * @returns The due date of the invoice this purchase affects
 * 
 * @example
 * // Card: due on 10th, closes 10 days before (closes on ~28-31)
 * calculateInvoiceDueDate(new Date('2024-02-27'), 10, 10)
 * // Returns Mar 10, 2024 (purchase before closing)
 * 
 * calculateInvoiceDueDate(new Date('2024-02-29'), 10, 10)
 * // Returns Apr 10, 2024 (purchase on/after closing)
 */
export function calculateInvoiceDueDate(
    purchaseDate: Date,
    dueDay: number,
    closingDaysBefore: number
): Date {
    const purchaseYear = purchaseDate.getFullYear();
    const purchaseMonth = purchaseDate.getMonth();
    const purchaseDay = purchaseDate.getDate();

    // Calculate when this month's invoice closes
    const closingDate = calculateClosingDate(dueDay, closingDaysBefore, purchaseDate);
    const closingDay = closingDate.getDate();

    // Determine which invoice this purchase goes on
    let invoiceMonth: number;
    let invoiceYear: number;

    if (purchaseDay >= closingDay) {
        // Purchase on or after closing → goes to NEXT invoice
        invoiceMonth = purchaseMonth + 2; // Next month's due date
        invoiceYear = purchaseYear;

        // Handle year rollover
        if (invoiceMonth > 11) {
            invoiceMonth = invoiceMonth - 12;
            invoiceYear++;
        }
    } else {
        // Purchase before closing → goes to CURRENT invoice
        invoiceMonth = purchaseMonth + 1; // This month's due date
        invoiceYear = purchaseYear;

        // Handle year rollover
        if (invoiceMonth > 11) {
            invoiceMonth = 0;
            invoiceYear++;
        }
    }

    // Create the due date
    const invoiceDueDate = new Date(invoiceYear, invoiceMonth, dueDay);

    return invoiceDueDate;
}

/**
 * Calculate the posted_at date for an installment
 * 
 * Each installment should be posted to the invoice N months after the first one.
 * Uses the same invoice logic to determine correct dates.
 * 
 * @param firstPurchaseDate - Original purchase date
 * @param installmentNumber - Which installment (1-based: 1, 2, 3...)
 * @param dueDay - Card due day
 * @param closingDaysBefore - Card closing days before
 * @returns Date when this installment should be posted
 */
export function calculateInstallmentDate(
    firstPurchaseDate: Date,
    installmentNumber: number,
    dueDay: number,
    closingDaysBefore: number
): Date {
    // First installment uses the original purchase date logic
    if (installmentNumber === 1) {
        return firstPurchaseDate;
    }

    // Subsequent installments: add (installmentNumber - 1) months
    const monthsToAdd = installmentNumber - 1;
    const installmentDate = new Date(firstPurchaseDate);
    installmentDate.setMonth(installmentDate.getMonth() + monthsToAdd);

    return installmentDate;
}

/**
 * Get all transactions for a specific invoice period
 * 
 * @param transactions - All transactions
 * @param invoiceDueDate - The due date of the invoice to filter for
 * @param dueDay - Card due day
 * @param closingDaysBefore - Card closing days before
 * @returns Transactions that appear on this invoice
 */
export function getInvoiceTransactions<T extends { posted_at: string }>(
    transactions: T[],
    invoiceDueDate: Date,
    dueDay: number,
    closingDaysBefore: number
): T[] {
    return transactions.filter(tx => {
        const txDate = new Date(tx.posted_at);
        const txInvoiceDue = calculateInvoiceDueDate(txDate, dueDay, closingDaysBefore);

        // Compare just the year and month (ignore time)
        return (
            txInvoiceDue.getFullYear() === invoiceDueDate.getFullYear() &&
            txInvoiceDue.getMonth() === invoiceDueDate.getMonth()
        );
    });
}

/**
 * Format invoice period for display
 * 
 * @param invoiceDueDate - Due date of invoice
 * @returns Formatted string like "Fatura de Março/2024 (vence 10/03)"
 */
export function formatInvoicePeriod(invoiceDueDate: Date): string {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const month = monthNames[invoiceDueDate.getMonth()];
    const year = invoiceDueDate.getFullYear();
    const day = invoiceDueDate.getDate();
    const displayMonth = invoiceDueDate.getMonth() + 1;

    return `Fatura de ${month}/${year} (vence ${day.toString().padStart(2, '0')}/${displayMonth.toString().padStart(2, '0')})`;
}

/**
 * Get current and next invoice due dates for a card
 * 
 * @param dueDay - Card due day
 * @param closingDaysBefore - Card closing days before
 * @param referenceDate - Reference date (defaults to today)
 * @returns Object with currentInvoice and nextInvoice due dates
 */
export function getCurrentAndNextInvoices(
    dueDay: number,
    closingDaysBefore: number,
    referenceDate: Date = new Date()
): { currentInvoice: Date; nextInvoice: Date } {
    const today = referenceDate;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Current invoice is this month's due date (or next if already passed)
    const currentInvoice = new Date(currentYear, currentMonth, dueDay);

    // If due date already passed this month, current invoice is next month
    if (today > currentInvoice) {
        currentInvoice.setMonth(currentInvoice.getMonth() + 1);
    }

    // Next invoice is one month after current
    const nextInvoice = new Date(currentInvoice);
    nextInvoice.setMonth(nextInvoice.getMonth() + 1);

    return { currentInvoice, nextInvoice };
}
