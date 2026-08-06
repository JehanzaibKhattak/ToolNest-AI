import { notFound } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { getTool, tools, type ToolSlug } from "@/lib/tools";
import { ToolForm } from "@/components/tool-form";
export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const Icon = tool.icon;
  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container">
          <div className="mb-10 flex items-start gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-amber-400 text-slate-950">
              <Icon />
            </span>
            <div>
              <p className="eyebrow">
                {tool.credits} credit{tool.credits > 1 ? "s" : ""} per result
              </p>
              <h1 className="mt-1 text-4xl font-black">AI {tool.name}</h1>
              <p className="muted mt-2">{tool.description}</p>
            </div>
          </div>
          <ToolForm tool={slug as ToolSlug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
