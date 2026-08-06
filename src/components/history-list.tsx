"use client";
import { useMemo, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
type Item = {
  id: string;
  tool_name: string;
  output: unknown;
  created_at: string;
};
export function HistoryList({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [tool, setTool] = useState("");
  const shown = useMemo(
    () =>
      items.filter(
        (x) =>
          (!tool || x.tool_name === tool) &&
          JSON.stringify(x.output).toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query, tool],
  );
  async function remove(id: string) {
    if (!confirm("Delete this generation permanently?")) return;
    const r = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (r.ok) {
      setItems((x) => x.filter((i) => i.id !== id));
      toast.success("Deleted");
    } else toast.error("Could not delete");
  }
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          className="field max-w-sm"
          placeholder="Search output"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="field max-w-xs"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
        >
          <option value="">All tools</option>
          {[
            "pdf-assistant",
            "resume-analyzer",
            "email-writer",
            "prompt-improver",
            "content-repurposer",
          ].map((x) => (
            <option value={x} key={x}>
              {x.replaceAll("-", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4">
        {shown.length ? (
          shown.map((item) => (
            <article className="card p-5" key={item.id}>
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-bold capitalize">
                    {item.tool_name.replaceAll("-", " ")}
                  </h2>
                  <time className="muted text-xs">
                    {new Date(item.created_at).toLocaleString()}
                  </time>
                </div>
                <div className="flex gap-2">
                  <button
                    aria-label="Copy"
                    className="btn"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(item.output, null, 2),
                      )
                    }
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    aria-label="Delete"
                    className="btn"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-bold">
                  Open result
                </summary>
                <pre className="mt-3 text-sm whitespace-pre-wrap">
                  {JSON.stringify(item.output, null, 2)}
                </pre>
              </details>
            </article>
          ))
        ) : (
          <div className="card p-10 text-center">
            <h2 className="font-bold">No generations found</h2>
            <p className="muted mt-2">
              Try another filter or create your first result.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
