import React, { useState } from 'react';
import { 
  Database, 
  FolderTree, 
  Send, 
  Cloud, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  ShieldCheck,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  PRISMA_SCHEMA_CODE, 
  FOLDER_STRUCTURE_DOC, 
  RESEND_SERVICE_TS_CODE, 
  DEPLOY_GUIDE_MD 
} from '../data/architectureDocs';

export const ArchitectureDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prisma' | 'folders' | 'resend' | 'deploy'>('prisma');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-1.5 text-indigo-700 text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Blueprint de Arquitetura & Código</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              4worship SaaS: Arquitetura & Modelagem
            </h2>
            <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
              Modelagem Prisma PostgreSQL, código de serviço Resend v2 e guia completo de implantação em produção.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-xl border border-indigo-200">
              Stack: Node.js + Express + Prisma + React + Resend
            </span>
          </div>
        </div>
      </div>

      {/* Deliverables Subnav Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap gap-1.5">
        
        <button
          onClick={() => setActiveTab('prisma')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition touch-manipulation active:scale-95 ${
            activeTab === 'prisma'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Modelagem (Prisma Schema)</span>
        </button>

        <button
          onClick={() => setActiveTab('folders')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition touch-manipulation active:scale-95 ${
            activeTab === 'folders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>2. Estrutura de Pastas</span>
        </button>

        <button
          onClick={() => setActiveTab('resend')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition touch-manipulation active:scale-95 ${
            activeTab === 'resend'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>3. Módulo Resend (Service)</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition touch-manipulation active:scale-95 ${
            activeTab === 'deploy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>4. Guia de Deploy</span>
        </button>

      </div>

      {/* TAB 1: PRISMA SCHEMA */}
      {activeTab === 'prisma' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                prisma/schema.prisma (PostgreSQL Multi-tenant & Escalas)
              </span>
            </div>

            <button
              onClick={() => handleCopy('prisma', PRISMA_SCHEMA_CODE)}
              className="flex items-center space-x-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition font-bold"
            >
              {copiedKey === 'prisma' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedKey === 'prisma' ? 'Copiado!' : 'Copiar Schema'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[70vh] leading-relaxed shadow-inner">
            <pre>{PRISMA_SCHEMA_CODE}</pre>
          </div>
        </div>
      )}

      {/* TAB 2: FOLDER STRUCTURE */}
      {activeTab === 'folders' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Arquitetura de Pastas Backend (Render) + Frontend (Vercel)
              </span>
            </div>

            <button
              onClick={() => handleCopy('folders', FOLDER_STRUCTURE_DOC)}
              className="flex items-center space-x-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition font-bold"
            >
              {copiedKey === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedKey === 'folders' ? 'Copiado!' : 'Copiar Estrutura'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[70vh] leading-relaxed shadow-inner">
            <pre>{FOLDER_STRUCTURE_DOC}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: RESEND EMAIL SERVICE */}
      {activeTab === 'resend' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                backend/src/services/email.service.ts (@resend/node SDK & Templates)
              </span>
            </div>

            <button
              onClick={() => handleCopy('resend', RESEND_SERVICE_TS_CODE)}
              className="flex items-center space-x-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition font-bold"
            >
              {copiedKey === 'resend' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedKey === 'resend' ? 'Copiado!' : 'Copiar Código Resend'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[70vh] leading-relaxed shadow-inner">
            <pre>{RESEND_SERVICE_TS_CODE}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: DEPLOY GUIDE */}
      {activeTab === 'deploy' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Guia Completo de Deploy (Render + Vercel + Dockerfile + CORS)
              </span>
            </div>

            <button
              onClick={() => handleCopy('deploy', DEPLOY_GUIDE_MD)}
              className="flex items-center space-x-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition font-bold"
            >
              {copiedKey === 'deploy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedKey === 'deploy' ? 'Copiado!' : 'Copiar Guia'}</span>
            </button>
          </div>

          <div className="p-5 bg-slate-900 text-slate-200 text-xs overflow-x-auto max-h-[70vh] leading-relaxed font-mono whitespace-pre-wrap shadow-inner">
            {DEPLOY_GUIDE_MD}
          </div>
        </div>
      )}

    </div>
  );
};
