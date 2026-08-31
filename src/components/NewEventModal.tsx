import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, UserCheck, Plus } from 'lucide-react';
import { WorshipEvent, User } from '../types';

interface NewEventModalProps {
  onClose: () => void;
  onSave: (newEvent: WorshipEvent) => void;
  currentUser: User;
  allUsers: User[];
  organizationId: string;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  onClose,
  onSave,
  currentUser,
  allUsers,
  organizationId,
}) => {
  const [title, setTitle] = useState('Culto de Domingo - Noite');
  const [date, setDate] = useState('2026-09-13');
  const [time, setTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');
  const [location, setLocation] = useState('Nave Principal - Altar Central');
  const [leaderId, setLeaderId] = useState(currentUser.id);
  const [generalNotes, setGeneralNotes] = useState('Passagem de som às 17h30. Vestimenta preto e azul.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const leader = allUsers.find(u => u.id === leaderId) || currentUser;

    const newEvent: WorshipEvent = {
      id: `evt_${Date.now()}`,
      organizationId,
      title,
      date,
      time,
      endTime: endTime || undefined,
      location,
      leaderId: leader.id,
      leaderName: leader.name,
      status: 'DRAFT',
      generalNotes,
      members: [],
      setlist: [],
      createdAt: new Date().toISOString(),
    };

    onSave(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span>Criar Nova Escala / Culto</span>
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
            <label className="block font-bold text-slate-700 mb-1">Título do Culto / Evento *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Culto de Domingo - Noite, Ensaio Geral..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Horário de Início *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Horário Término</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Líder Responsável</label>
              <select
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              >
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Local / Templo</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Templo Principal, Auditório 2..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações para a Equipe</label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Ex: Passagem de som às 17h30, vestimenta padrão..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
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
              <span>Criar Escala</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
