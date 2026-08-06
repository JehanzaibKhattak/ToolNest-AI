import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold">
      <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950">
        <Sparkles size={18} />
      </span>
      ToolNest AI
    </Link>
  );
}
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-[color:var(--bg)]/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/tools">Tools</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/about">About</Link>
          <Link href="/login">Log in</Link>
          <Link className="btn btn-primary" href="/register">
            Start free
          </Link>
          <ThemeToggle />
        </nav>
        <details className="md:hidden">
          <summary className="btn">
            <Menu />
          </summary>
          <nav className="absolute top-16 right-4 grid min-w-52 gap-3 rounded-xl border bg-[color:var(--card)] p-4">
            <Link href="/tools">Tools</Link>
            <Link href="/about">About</Link>
            <Link href="/login">Log in</Link>
            <Link href="/register">Start free</Link>
            <ThemeToggle />
          </nav>
        </details>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="container grid gap-8 md:grid-cols-3">
        <div>
          <Logo />
          <p className="muted mt-3 text-sm">
            Practical AI tools for work, study and content creation.
          </p>
          <p className="mt-2 text-sm">Built by AGI Innovations</p>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <Link href="/tools">Tools</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="muted text-sm">
          AI output can be inaccurate. Review it before professional use.
          <br />© {new Date().getFullYear()} ToolNest AI.
        </p>
      </div>
    </footer>
  );
}
