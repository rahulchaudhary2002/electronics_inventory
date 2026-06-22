import { useState } from 'react';
import { X } from 'lucide-react';

type Props = {
    title: string;
    placeholder: string;
    url: string;
    onSuccess: (item: { id: number; name: string }) => void;
    onClose: () => void;
};

function getCsrf(): string {
    return decodeURIComponent(
        document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? ''
    );
}

export function QuickCreateModal({ title, placeholder, url, onSuccess, onClose }: Props) {
    const [name, setName]       = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res  = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrf(),
                },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.errors?.name?.[0] ?? data.message ?? 'Error creating item.');
            } else {
                onSuccess(data);
                onClose();
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
            <div className="w-full max-w-xs space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-indigo-400">{title}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <input
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder={placeholder}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                            required
                        />
                        {error && <p className="mt-1.5 text-[10px] text-rose-400">{error}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading ? 'Creating...' : '✓ Create'}
                    </button>
                </form>
            </div>
        </div>
    );
}
