import type { HTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={cn('mt-1.5 flex items-center gap-1 text-[10px] font-medium text-rose-400', className)}
        >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {message}
        </p>
    ) : null;
}
