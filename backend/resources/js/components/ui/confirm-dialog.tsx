import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    variant = "danger",
    isLoading = false,
}: ConfirmDialogProps) {
    
    const iconColors = {
        danger: "bg-red-50 text-red-600",
        warning: "bg-amber-50 text-amber-600",
        info: "bg-indigo-50 text-indigo-600",
    };

    const buttonColors = {
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20",
        warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20",
        info: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
    };

    const Icon = variant === "danger" ? Trash2 : AlertTriangle;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                {/* Backdrop with subtle blur */}
                <Dialog.Backdrop className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200" />
                
                <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[160] w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* Close button in top right */}
                        <Dialog.Close 
                            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all focus:outline-none"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Dialog.Close>

                        <div className="p-8">
                            <div className="flex items-start gap-5">
                                {/* Icon focused container */}
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-transparent", iconColors[variant])}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="flex-1 pt-1">
                                    <Dialog.Title className="text-lg font-bold text-slate-900 mb-2">
                                        {title}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-[14px] leading-relaxed text-slate-500 font-medium">
                                        {description}
                                    </Dialog.Description>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onConfirm();
                                    }}
                                    disabled={isLoading}
                                    className={cn(
                                        "px-6 py-2.5 text-[13px] font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2",
                                        buttonColors[variant]
                                    )}
                                >
                                    {isLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>

                    </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
