import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900',
                'transition-all outline-none',
                'focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50',
                'data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600',
                'aria-invalid:border-rose-500/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-white transition-none"
            >
                <CheckIcon className="size-3" strokeWidth={3} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
