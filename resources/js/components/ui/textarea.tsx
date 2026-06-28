import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200',
                'placeholder:text-slate-600',
                'transition-all outline-none resize-y min-h-[80px]',
                'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30',
                'aria-invalid:border-rose-500/50 aria-invalid:focus:ring-rose-500/30',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
