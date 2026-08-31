import React, { useState } from 'react';
import { X, UserPlus, Users, Plus, Check } from 'lucide-react';
import { User, InstrumentType, UserRole, DayOfWeek } from '../types';

interface NewMusicianModalProps {
  onClose: () => void;
  onSave: (newMusician: User) => void;
  organizationId: string;
}

const ALL_AVAILABLE_INSTRUMENTS: InstrumentType[] = [
  'Vocal Líder',
  'Backing Vocal',
  'Violão',
  'Guitarra',
  'Teclado / Piano',
  'Baixo',
  'Bateria',
  'Percussão',
  'Saxofone',
  'Mesa de Som (Áudio)',
  'Transmissão / Live',
  'Projeção / Mídia'
];

export const NewMusicianModal: React.FC<NewMusicianModalProps> = ({
  onClose,
  onSave,
  organizationId,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+55 11 9');
  const [role, setRole] = useState<UserRole>('MUSICIAN');
  const [selectedInstruments, setSelectedInstruments] = useState<InstrumentType[]>(['Vocal Líder']);
  
  // Weekly availability
  const [domManha, setDomManha] = useState(true);
  const [domNoite, setDomNoite] = useState(true);
  const [quarta, setQuarta] = useState(true);
  const [sabado, setSabado] = useState(true);

  const toggleInstrument = (inst: InstrumentType) => {
    if (selectedInstruments.includes(inst)) {
      if (selectedInstruments.length > 1) {
        setSelectedInstruments(selectedInstruments.filter(i => i !== inst));
      }
    } else {
      setSelectedInstruments([...selectedInstruments, inst]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Informe o nome e e-mail do voluntário.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone: phone || undefined,
      role,
      organizationId,
      instruments: selectedInstruments,
      weeklyAvailability: [
        { day: 'DOMINGO_MANHA', available: domManha },
        { day: 'DOMINGO_NOITE', available: domNoite },
        { day: 'QUARTA', available: quarta },
        { day: 'SABADO', available: sabado },
      ],
      blockedDates: [],
      createdAt: new Date().toISOString(),
    };

    onSave(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <span>Cadastrar Músico / Voluntário</span>
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 shadow-xs transition touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lucas Drummond, Camila Rocha..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="musico@igreja.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp / Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 98765-4321"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Função / Nível de Acesso</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            >
              <option value="MUSICIAN">Voluntário / Músico</option>
              <option value="TEAM_LEADER">Líder de Louvor</option>
              <option value="ADMIN">Administrador Geral</option>
            </select>
          </div>

          {/* Instruments Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Instrumentos & Habilidades (selecione um ou mais)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_AVAILABLE_INSTRUMENTS.map(inst => {
                const selected = selectedInstruments.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleInstrument(inst)}
                    className={`px-2.5 py-1.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition touch-manipulation ${
                      selected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{inst}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Availability Checkboxes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Disponibilidade Semanal Inicial
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={domManha}
                  onChange={(e) => setDomManha(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">Domingo Manhã</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={domNoite}
                  onChange={(e) => setDomNoite(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">Domingo Noite</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quarta}
                  onChange={(e) => setQuarta(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">Quarta-feira</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sabado}
                  onChange={(e) => setSabado(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">Sábado</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition touch-manipulation active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Voluntário</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
