import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                'mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none',
                'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

export { Label };
