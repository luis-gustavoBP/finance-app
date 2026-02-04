'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { Button } from '@/components/ui/Button';
import { exportMonthTransactions } from '@/lib/csvExport';

export function ExportButton() {
    const { transactions } = useTransactions();
    const { cards } = useCards();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const handleExport = () => {
        const [year, month] = selectedMonth.split('-').map(Number);

        // Cast to proper type format
        const txWithRelations = transactions.map(tx => ({
            ...tx,
            category: (tx as any).category || null,
            card: (tx as any).card || null,
        }));

        exportMonthTransactions(txWithRelations, cards, year, month);
    };

    // Generate last 12 months options
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const value = `${year}-${String(month).padStart(2, '0')}`;
        const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return { value, label };
    });

    return (
        <div className="flex items-center gap-2">
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex h-9 rounded-md border border-white/20 bg-[#0f172a] px-3 py-1 text-sm text-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
            >
                {monthOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-[#001242] text-white">
                        {option.label}
                    </option>
                ))}
            </select>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="whitespace-nowrap"
            >
                📥 Exportar CSV
            </Button>
        </div>
    );
}
