
import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Image as ImageIcon,
  Printer,
  ListOrdered,
  Camera,
  FileText,
  Settings,
  Monitor,
  User,
  Users,
  UserPlus,
  ChevronDown,
  ChevronUp,
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  currentPath?: string;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: CalendarDays, label: 'Eventos', path: '/admin/eventos' },
  { icon: Sparkles, label: 'Efeitos de IA', path: '/admin/efeitos' },
  { icon: ImageIcon, label: 'Molduras', path: '/admin/molduras' },
  { icon: Printer, label: 'Impressão', path: '/admin/impressao' },
  { icon: ListOrdered, label: 'Fila de Impressão', path: '/admin/fila' },
  { icon: Camera, label: 'Fotos', path: '/admin/fotos' },
  { icon: FileText, label: 'Relatórios', path: '/admin/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/admin/config' },
  { icon: Monitor, label: 'Sistema', path: '/admin/sistema' },
  { icon: FileText, label: "Orçamentos", path: "/admin/orcamentos" },
];

export default function Sidebar({ currentPath = '/admin/dashboard' }: SidebarProps) {
  const [clientesAberto, setClientesAberto] = useState(
    currentPath.startsWith('/admin/clientes')
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-10">

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Vive <span className="text-vive-primary">AI</span>
        </h1>

        <p className="text-[10px] tracking-[0.2em] text-gray-500 font-semibold mt-1">
          PHOTOBOOTH
        </p>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-xs font-bold text-vive-primary uppercase mb-1">
          Painel<br />Administrativo
        </h2>

        <p className="text-xs text-gray-500 leading-relaxed">
          Gerencie seu totem fotográfico de forma simples e completa.
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">

        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-vive-primary/10 text-vive-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}

        {/* CLIENTES */}

        <div className="pt-1">

          <button
            type="button"
            onClick={() => setClientesAberto(!clientesAberto)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentPath.startsWith('/admin/clientes')
                ? 'bg-vive-primary/10 text-vive-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Users size={18} />

            <span className="flex-1 text-left">
              Clientes
            </span>

            {clientesAberto ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {clientesAberto && (
            <div className="ml-6 mt-1 space-y-1">

              <a
                href="/admin/clientes"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              >
                <User size={16} />
                Lista de clientes
              </a>

              <a
                href="/admin/clientes/adicionar"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              >
                <UserPlus size={16} />
                Adicionar cliente
              </a>

            </div>
          )}

        </div>

      </nav>

      <div className="px-6 py-8 flex justify-center">
        <img
          src="https://placehold.co/150x150/1a1a1a/ffffff?text=Butterfly"
          alt="Butterfly Decoration"
          className="w-32 h-32 object-contain opacity-90 drop-shadow-md"
        />
      </div>

      <div className="p-4 border-t border-gray-100 mx-4 mb-4 rounded-xl bg-gray-50">

        <div className="flex items-center gap-3 mb-3">

          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={16} className="text-gray-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              Admin
            </p>

            <p className="text-xs text-gray-500 truncate">
              admin@viveai.com
            </p>
          </div>

        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sair
        </button>

      </div>

    </aside>
  );
}