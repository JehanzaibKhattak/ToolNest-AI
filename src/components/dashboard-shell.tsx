import Link from "next/link";
import {
  LayoutDashboard,
  History,
  Files,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { Logo } from "./layout";
import { tools } from "@/lib/tools";
const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  ...tools.map((t) => ({
    href: `/tools/${t.slug}`,
    label: t.name,
    icon: t.icon,
  })),
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/documents", label: "Documents", icon: Files },
  { href: "/dashboard/account", label: "Account", icon: User },
];
function DashboardNav() {
  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
          href={href}
          key={href}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
      <form action="/api/auth/logout" method="post">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2">
          <LogOut size={18} />
          Logout
        </button>
      </form>
    </>
  );
}
export function DashboardShell({
  children,
  credits = 0,
}: {
  children: React.ReactNode;
  credits?: number;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="hidden border-r p-5 md:block">
        <Logo />
        <nav className="mt-8 grid gap-1 text-sm">
          <DashboardNav />
        </nav>
      </aside>
      <div>
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-8">
          <details className="md:hidden">
            <summary className="btn">
              <Menu />
            </summary>
            <nav className="absolute top-16 left-4 z-40 grid min-w-64 gap-1 rounded-xl border bg-[color:var(--card)] p-4">
              <DashboardNav />
            </nav>
          </details>
          <span className="hidden md:block">Workspace</span>
          <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-slate-950">
            {credits} credits
          </span>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
