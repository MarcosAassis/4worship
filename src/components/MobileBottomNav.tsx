import React from 'react';
import { 
  CalendarDays, 
  Music, 
  Users, 
  Send, 
  FileCode2, 
  Sparkles 
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'schedules' | 'songs' | 'musicians' | 'notifications' | 'architecture';
  setCurrentTab: (tab: 'schedules' | 'songs' | 'musicians' | 'notifications' | 'architecture') => void;
  pendingCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  pendingCount = 0,
}) => {
  return (
    <nav 
      aria-label="Navegação móvel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 safe-area-pb"
    >
      <div className="flex items-center justify-around">
        
        {/* Tab 1: Escalas */}
        <button
          onClick={() => setCurrentTab('schedules')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-center transition touch-manipulation min-w-[56px] ${
            currentTab === 'schedules'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <CalendarDays className={`w-5 h-5 ${currentTab === 'schedules' ? 'text-indigo-600 scale-110' : 'text-slate-500'} transition transform`} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">Escalas</span>
        </button>

        {/* Tab 2: Repertório */}
        <button
          onClick={() => setCurrentTab('songs')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-center transition touch-manipulation min-w-[56px] ${
            currentTab === 'songs'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Music className={`w-5 h-5 ${currentTab === 'songs' ? 'text-indigo-600 scale-110' : 'text-slate-500'} transition transform`} />
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">Músicas</span>
        </button>

        {/* Tab 3: Músicos */}
        <button
          onClick={() => setCurrentTab('musicians')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-center transition touch-manipulation min-w-[56px] ${
            currentTab === 'musicians'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className={`w-5 h-5 ${currentTab === 'musicians' ? 'text-indigo-600 scale-110' : 'text-slate-500'} transition transform`} />
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">Músicos</span>
        </button>

        {/* Tab 4: Resend */}
        <button
          onClick={() => setCurrentTab('notifications')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-center transition touch-manipulation min-w-[56px] ${
            currentTab === 'notifications'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className={`w-5 h-5 ${currentTab === 'notifications' ? 'text-indigo-600 scale-110' : 'text-slate-500'} transition transform`} />
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">Resend</span>
        </button>

        {/* Tab 5: Docs / Arquitetura */}
        <button
          onClick={() => setCurrentTab('architecture')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-center transition touch-manipulation min-w-[56px] ${
            currentTab === 'architecture'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode2 className={`w-5 h-5 ${currentTab === 'architecture' ? 'text-amber-600 scale-110' : 'text-slate-500'} transition transform`} />
          <span className="text-[10px] mt-0.5 leading-tight tracking-tight">Docs</span>
        </button>

      </div>
    </nav>
  );
};
