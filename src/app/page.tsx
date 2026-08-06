import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Zap } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { tools } from "@/lib/tools";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero-glow section">
          <div className="container grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="eyebrow">Built for useful work</p>
              <h1 className="mt-4 text-5xl leading-[1.05] font-black tracking-tight md:text-7xl">
                One workspace.
                <br />
                <span className="text-amber-400">Multiple practical</span> AI
                tools.
              </h1>
              <p className="muted mt-6 max-w-xl text-lg leading-8">
                Understand PDFs, analyze resumes, write professional emails,
                improve prompts and repurpose content from one simple AI
                workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn btn-primary" href="/register">
                  Start with 20 free credits <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-ghost" href="/tools">
                  Explore tools
                </Link>
              </div>
              <p className="muted mt-4 text-sm">
                No card required · AI output stays under your control
              </p>
            </div>
            <div className="card p-4 md:p-6">
              <div className="rounded-xl border bg-slate-950 p-5 text-white">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">
                    Resume readiness
                  </span>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs text-amber-300">
                    Analysis complete
                  </span>
                </div>
                <div className="mt-8 flex items-end gap-5">
                  <span className="text-7xl font-black text-amber-400">84</span>
                  <div className="mb-2 text-sm text-slate-400">
                    Strong match
                    <br />3 priority improvements
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {["Skills 88", "Impact 79", "Clarity 86"].map((x) => (
                    <div
                      className="rounded-lg border border-slate-700 p-3 text-sm"
                      key={x}
                    >
                      {x}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <p className="eyebrow">Your toolkit</p>
            <h2 className="mt-3 text-3xl font-bold">
              Five focused tools. Zero clutter.
            </h2>
            <div className="grid-auto mt-8">
              {tools.map(
                ({ slug, name, description, benefit, credits, icon: Icon }) => (
                  <article className="card p-6" key={slug}>
                    <Icon className="text-amber-400" />
                    <h3 className="mt-5 text-xl font-bold">{name}</h3>
                    <p className="muted mt-2 leading-6">{description}</p>
                    <p className="mt-5 text-sm font-semibold">{benefit}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="muted text-xs">
                        {credits} credit{credits > 1 ? "s" : ""}
                      </span>
                      <Link
                        className="font-bold text-amber-400"
                        href={`/tools/${slug}`}
                      >
                        Open <ArrowRight className="inline" size={15} />
                      </Link>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>
        <section id="how" className="section border-y">
          <div className="container">
            <p className="eyebrow">How it works</p>
            <div className="grid-auto mt-8">
              {[
                ["01", "Choose a tool"],
                ["02", "Add your context"],
                ["03", "Review and refine"],
              ].map(([n, t]) => (
                <div key={n}>
                  <span className="text-4xl font-black text-amber-400">
                    {n}
                  </span>
                  <h3 className="mt-3 text-xl font-bold">{t}</h3>
                  <p className="muted mt-2">
                    Focused inputs create useful output you can copy, save and
                    improve.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container grid gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow">Why ToolNest</p>
              <h2 className="mt-3 text-4xl font-bold">
                Professional results without prompt engineering.
              </h2>
              <p className="muted mt-5 leading-7">
                Purpose-built workflows help professionals, students, job
                seekers, marketers and small teams move from blank page to
                polished draft.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                [Zap, "Fast, structured output"],
                [ShieldCheck, "Private server-side AI calls"],
                [Check, "Clear credit costs"],
              ].map(([Icon, label]) => (
                <div
                  className="card flex items-center gap-4 p-5"
                  key={String(label)}
                >
                  {typeof Icon !== "string" && (
                    <Icon className="text-amber-400" />
                  )}
                  <b>{String(label)}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section border-y">
          <div className="container">
            <h2 className="text-3xl font-bold">Simple, future-ready plans</h2>
            <div className="grid-auto mt-8">
              <div className="card p-6">
                <h3 className="text-xl font-bold">Free</h3>
                <p className="mt-3 text-3xl font-black">20 credits</p>
                <p className="muted mt-2">Included when you join.</p>
              </div>
              <div className="card p-6">
                <span className="eyebrow">Coming later</span>
                <h3 className="mt-2 text-xl font-bold">Pro</h3>
                <p className="muted mt-3">
                  More credits and advanced workflows. No fake checkout—just a
                  clear roadmap.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <div className="mt-6 grid gap-3">
              {[
                [
                  "Is the resume score an actual ATS score?",
                  "No. It is an AI-generated estimate and never guarantees employment.",
                ],
                [
                  "Is my content used safely?",
                  "Requests run on the server and sensitive content is not written to application logs.",
                ],
                [
                  "What happens if generation fails?",
                  "Credits are reserved atomically and restored when the AI request fails.",
                ],
              ].map(([q, a]) => (
                <details className="card p-5" key={q}>
                  <summary className="cursor-pointer font-bold">{q}</summary>
                  <p className="muted mt-3">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container rounded-3xl bg-amber-400 p-8 text-slate-950 md:p-14">
            <h2 className="text-4xl font-black">
              Make your next draft the strong one.
            </h2>
            <p className="mt-3">
              Start free with 20 credits. Review every AI output before use.
            </p>
            <Link className="btn mt-7 bg-slate-950 text-white" href="/register">
              Create your workspace <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
