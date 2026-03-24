'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { MonthlyPace } from '@/components/dashboard/MonthlyPace';
import { EvolutionChart } from '@/components/dashboard/EvolutionChart';
import { Database } from '@/types/database.types';
import { cn } from '@/lib/utils';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface SpendingAnalysisWidgetProps {
    transactions: Transaction[];
    monthlyLimit: number;
    selectedMonth?: Date;
}

export function SpendingAnalysisWidget({ transactions, monthlyLimit, selectedMonth }: SpendingAnalysisWidgetProps) {
    const [viewMode, setViewMode] = useState<'pace' | 'evolution'>('pace');

    return (
        <Card className="text-white overflow-hidden">
            <div className="px-4 sm:px-5 pt-4 sm:pt-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        {viewMode === 'pace' ? 'Ritmo de Gasto' : 'Evolução do Mês'}
                    </span>
                    <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.04]">
                        <button
                            onClick={() => setViewMode('pace')}
                            className={cn(
                                'px-3 py-1.5 text-[11px] font-medium rounded-md transition-all',
                                viewMode === 'pace'
                                    ? 'bg-white/[0.08] text-white/80'
                                    : 'text-white/25 hover:text-white/50'
                            )}
                        >
                            Ritmo
                        </button>
                        <button
                            onClick={() => setViewMode('evolution')}
                            className={cn(
                                'px-3 py-1.5 text-[11px] font-medium rounded-md transition-all',
                                viewMode === 'evolution'
                                    ? 'bg-white/[0.08] text-white/80'
                                    : 'text-white/25 hover:text-white/50'
                            )}
                        >
                            Evolução
                        </button>
                    </div>
                </div>
            </div>
            <CardContent className="px-0 pb-0">
                {viewMode === 'pace' ? (
                    <div className="animate-in" key="pace">
                        <MonthlyPace transactions={transactions} monthlyLimit={monthlyLimit} minimal selectedMonth={selectedMonth} />
                    </div>
                ) : (
                    <div className="animate-in" key="evolution">
                        <EvolutionChart transactions={transactions} minimal selectedMonth={selectedMonth} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
