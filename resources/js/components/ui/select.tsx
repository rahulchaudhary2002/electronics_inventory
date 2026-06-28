import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
    className,
    size = 'default',
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'default' }) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                'flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 whitespace-nowrap',
                'transition-all outline-none',
                'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30',
                'aria-invalid:border-rose-500/50 aria-invalid:focus:ring-rose-500/30',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'data-[placeholder]:text-slate-600',
                'data-[size=default]:h-10 data-[size=sm]:h-8',
                '[&_svg]:pointer-events-none [&_svg]:shrink-0',
                '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDownIcon className="size-3.5 shrink-0 text-slate-500" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    position = 'popper',
    side = 'bottom',
    sideOffset = 6,
    align = 'center',
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                className={cn(
                    'relative z-50 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/40',
                    'max-h-(--radix-select-content-available-height) min-w-[var(--radix-select-trigger-width)]',
                    'origin-(--radix-select-content-transform-origin)',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
                    position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
                    className,
                )}
                position={position}
                side={side}
                sideOffset={sideOffset}
                avoidCollisions={false}
                align={align}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                    className={cn(
                        'p-1.5',
                        position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot="select-label"
            className={cn('px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-600', className)}
            {...props}
        />
    );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                'relative flex w-full cursor-default select-none items-center gap-2 rounded-xl py-2 pr-8 pl-3 text-xs text-slate-300 outline-none',
                'transition-colors',
                'focus:bg-indigo-600 focus:text-white',
                'data-[state=checked]:text-white data-[state=checked]:font-semibold',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3.5',
                className,
            )}
            {...props}
        >
            <span
                data-slot="select-item-indicator"
                className="absolute right-2.5 flex size-3.5 items-center justify-center"
            >
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="size-3.5 text-indigo-400" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn('pointer-events-none -mx-1 my-1 h-px bg-slate-800', className)}
            {...props}
        />
    );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
    return (
        <SelectPrimitive.ScrollUpButton
            data-slot="select-scroll-up-button"
            className={cn('flex cursor-default items-center justify-center py-1 text-slate-500', className)}
            {...props}
        >
            <ChevronUpIcon className="size-3.5" />
        </SelectPrimitive.ScrollUpButton>
    );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
    return (
        <SelectPrimitive.ScrollDownButton
            data-slot="select-scroll-down-button"
            className={cn('flex cursor-default items-center justify-center py-1 text-slate-500', className)}
            {...props}
        >
            <ChevronDownIcon className="size-3.5" />
        </SelectPrimitive.ScrollDownButton>
    );
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
