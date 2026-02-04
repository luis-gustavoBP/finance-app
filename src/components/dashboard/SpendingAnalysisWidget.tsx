'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MonthlyPace } from '@/components/dashboard/MonthlyPace';
import { EvolutionChart } from '@/components/dashboard/EvolutionChart';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface SpendingAnalysisWidgetProps {
    transactions: Transaction[];
    monthlyLimit: number;
}

export function SpendingAnalysisWidget({ transactions, monthlyLimit }: SpendingAnalysisWidgetProps) {
    const [viewMode, setViewMode] = useState<'pace' | 'evolution'>('pace');

    return (
        <Card className="glass-panel text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
                <CardTitle className="text-lg font-semibold text-white/90">
                    {viewMode === 'pace' ? 'Ritmo de Gasto' : 'Evolução (30 Dias)'}
                </CardTitle>
                <div className="flex bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('pace')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'pace'
                            ? 'bg-white/20 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Ritmo
                    </button>
                    <button
                        onClick={() => setViewMode('evolution')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'evolution'
                            ? 'bg-white/20 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Evolução
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                {viewMode === 'pace' ? (
                    <div className="animate-in fade-in duration-300">
                        {/* We reuse MonthlyPace's logic but might need to strip its internal Card wrapper if we want cleaner UI. 
                            However, since MonthlyPace currently has a Card wrapper, let's keep it wrapped or refactor.
                            For now, let's render the content directly if possible or just the component.
                            Actually, MonthlyPace returns a <Card>...
                            Let's verify MonthlyPace content. It returns a Card.
                            We should ideally modify MonthlyPace to NOT be a Card, or just render it inside here. 
                            Rendering a Card inside a CardContent is weird UI.
                            
                            Strategy:
                            1. Refactor MonthlyPace to accept a "headless" prop or Extract logic?
                            2. Or better: Just reimplement the chart rendering here to have full control?
                            
                            Let's keep it simple: Use the components as is. We'll adjust styles.
                        */}
                        <div className="-m-4 mt-0">
                            {/* Hack: Negative margin to counteract padding if we just render the component */}
                            {/* Actually, let's update `MonthlyPace` and `EvolutionChart` to NOT return a Card/Container
                                OR create a "headless" version.
                                
                                Wait, `EvolutionChart` returns a <div> with border/shadow.
                                `MonthlyPace` returns a <Card>.
                                
                                Let's modify those components to be cleaner first.
                            */}
                            <MonthlyPace transactions={transactions} monthlyLimit={monthlyLimit} minimal />
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        <div className="-m-4 mt-0">
                            <EvolutionChart transactions={transactions} minimal />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
