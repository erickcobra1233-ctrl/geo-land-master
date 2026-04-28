import { NavLink as RouterNavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPinned,
  Map,
  Layers,
  Users,
  FileText,
  KanbanSquare,
  BarChart3,
  Compass,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/imoveis", icon: Layers, label: "Imóveis Rurais" },
  { to: "/pontos", icon: MapPinned, label: "Pontos & Vértices" },
  { to: "/mapa", icon: Map, label: "Mapa Geoespacial" },
  { to: "/processos", icon: KanbanSquare, label: "Processos" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/documentos", icon: FileText, label: "Documentos" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
];

export function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.nome || user?.email || "??")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gradient-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-md bg-gradient-brand flex items-center justify-center shadow-elevated">
          <Compass className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-display font-bold text-sidebar-accent-foreground tracking-tight leading-none">
            GeoSIGEF
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60 mt-0.5">
            Manager
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50 font-semibold">
          Operação
        </div>
        {nav.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border-l-2 border-sidebar-primary -ml-0.5"
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </RouterNavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-sidebar-accent-foreground truncate">
              {user?.nome || "Usuário"}
            </div>
            <div className="text-[10px] text-sidebar-foreground/60 truncate">
              {user?.email || "—"}
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate("/login", { replace: true }); }}
            className="text-sidebar-foreground/60 hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
