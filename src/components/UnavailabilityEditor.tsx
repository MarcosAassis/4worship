import React, { useState } from 'react';
import { CalendarOff, Plus, X } from 'lucide-react';
import { User } from '../types';

export function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatIsoDatePtBr(iso: string) {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

interface UnavailabilityEditorProps {
  user: User;
  onUpdate: (user: User) => void;
  compact?: boolean;
}

export const UnavailabilityEditor: React.FC<UnavailabilityEditorProps> = ({
  user,
  onUpdate,
  compact = false,
}) => {
  const [date, setDate] = useState('');
  const blockedDates = [...(user.blockedDates ?? [])].sort();

  const addDate = () => {
    if (!date) return;
    if (blockedDates.includes(date)) {
      setDate('');
      return;
    }
    onUpdate({
      ...user,
      blockedDates: [...blockedDates, date].sort(),
    });
    setDate('');
  };

  const removeDate = (iso: string) => {
    onUpdate({
      ...user,
      blockedDates: blockedDates.filter((d) => d !== iso),
    });
  };

  return (
    <div className={compact ? 'space-y-2' : 'mt-2 space-y-2'}>
      {!compact && (
        <span className="text-xs font-bold text-slate-500 block">
          Indisponibilidade pontual
        </span>
      )}

      <div className="flex items-stretch gap-1.5">
        <input
          type="date"
          aria-label="Data de indisponibilidade"
          min={localIsoDate()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addDate();
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="button"
          onClick={addDate}
          disabled={!date}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>

      {blockedDates.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {blockedDates.map((iso) => (
            <li
              key={iso}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900"
            >
              <CalendarOff className="h-3 w-3 text-amber-700" />
              {formatIsoDatePtBr(iso)}
              <button
                type="button"
                onClick={() => removeDate(iso)}
                className="rounded p-0.5 text-amber-700/70 transition hover:bg-amber-100 hover:text-rose-700"
                title="Remover indisponibilidade"
                aria-label={`Remover indisponibilidade de ${formatIsoDatePtBr(iso)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-slate-400">
          Nenhuma data bloqueada. Informe viagens, férias ou outros impedimentos.
        </p>
      )}
    </div>
  );
};
