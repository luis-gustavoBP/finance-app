'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

export function CategoryManager() {
    const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useCategories();
    const { showToast } = useToast();
    const [isMinimized, setIsMinimized] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ... rest of state stays the same
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📦');
    const [color, setColor] = useState('#6366f1');

    // Confirm delete state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ... helper functions stay the same
    const commonIcons = ['🍔', '🚗', '🎉', '🏠', '🛍️', '💡', '💊', '✈️', '📱', '💰', '🎓', '🏋️', '🎬', '📦'];
    const commonColors = [
        '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
        '#f97316', '#eab308', '#22c55e', '#06b6d4',
        '#3b82f6', '#8b5cf6'
    ];

    const openAddModal = () => {
        setEditingId(null);
        setName('');
        setIcon('📦');
        setColor('#6366f1');
        setIsModalOpen(true);
    };

    const openEditModal = (category: typeof categories[0]) => {
        setEditingId(category.id);
        setName(category.name);
        setIcon(category.icon);
        setColor(category.color);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showToast('Digite um nome para a categoria', 'error');
            return;
        }

        try {
            if (editingId) {
                await updateCategory(editingId, { name, icon, color });
            } else {
                await addCategory({ name, icon, color });
            }
            showToast(editingId ? 'Categoria atualizada!' : 'Categoria criada!', 'success');
            setIsModalOpen(false);
        } catch (error: any) {
            console.error(error);
            showToast(error.message || 'Erro ao salvar categoria', 'error');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        setCategoryToDelete({ id, name });
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCategory(categoryToDelete.id);
            showToast('Categoria excluída!', 'success');
            setDeleteConfirmOpen(false);
            setCategoryToDelete(null);
        } catch (error: any) {
            showToast(error.message || 'Erro ao excluir categoria', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="h-2 w-full bg-white/5 rounded" />
            </div>
        </div>;
    }

    return (
        <>
            <Card className={cn("transition-all duration-300", isMinimized ? "overflow-hidden" : "")}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle>🗂️ Categorias</CardTitle>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="text-[10px] uppercase tracking-widest font-bold text-indigo-400/60 hover:text-indigo-400 transition-colors"
                            >
                                {isMinimized ? 'Expandir' : 'Recolher'}
                            </button>
                        </div>
                        {!isMinimized && (
                            <Button variant="primary" size="sm" onClick={openAddModal}>
                                + Adicionar
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className={cn("transition-all duration-300", isMinimized ? "pt-0 pb-4" : "pt-2")}>
                    {isMinimized ? (
                        <div
                            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar cursor-pointer group"
                            onClick={() => setIsMinimized(false)}
                        >
                            {categories.length === 0 ? (
                                <p className="text-[12px] text-white/20 italic">Ainda não há categorias...</p>
                            ) : (
                                <>
                                    <div className="flex -space-x-2.5">
                                        {categories.slice(0, 5).map(c => (
                                            <div
                                                key={c.id}
                                                className="w-8 h-8 rounded-full bg-[#151b2e] border-2 border-[#0a0f1e] flex items-center justify-center text-sm shadow-xl"
                                                title={c.name}
                                            >
                                                {c.icon}
                                            </div>
                                        ))}
                                        {categories.length > 5 && (
                                            <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0a0f1e] flex items-center justify-center text-[10px] font-bold text-white/60">
                                                +{categories.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-white/20 font-medium ml-2 group-hover:text-white/40 transition-colors">
                                        {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'} organizadas
                                    </span>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-slate-300 mb-4">
                                Organize seus gastos por categorias personalizadas.
                            </p>

                            {categories.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    Nenhuma categoria criada ainda.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map(category => (
                                        <div
                                            key={category.id}
                                            className="p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors bg-white/5"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{category.icon}</span>
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                            </div>
                                            <div className="text-sm font-medium text-white mb-2">
                                                {category.name}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 text-slate-300 hover:text-white hover:bg-white/10"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:bg-red-500/10 px-2"
                                                    onClick={(e) => handleDeleteClick(e, category.id, category.name)}
                                                >
                                                    Excluir
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Editar Categoria' : 'Nova Categoria'}
            >
                <div className="space-y-4 pt-4">
                    <Input
                        label="Nome da Categoria"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Alimentação"
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ">
                            Ícone
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                            {commonIcons.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    className={`text-2xl p-2 rounded-md transition-colors ${icon === emoji
                                        ? 'bg-indigo-500/20 ring-2 ring-indigo-500'
                                        : 'hover:bg-white/10'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ">
                            Cor
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {commonColors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-full h-10 rounded-md transition-all ${color === c
                                        ? 'ring-2 ring-offset-2 ring-slate-400'
                                        : ''
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Salvar
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Categoria"
                message={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"? Esta ação não pode ser desfeita e só é possível se não houver gastos vinculados.`}
                confirmLabel="Excluir"
                isLoading={isDeleting}
            />
        </>
    );
}
