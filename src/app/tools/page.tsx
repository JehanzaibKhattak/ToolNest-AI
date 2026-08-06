import { Navbar, Footer } from "@/components/layout";
import { tools } from "@/lib/tools";
import Link from "next/link";
export default function Tools() {
  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container">
          <p className="eyebrow">Tool directory</p>
          <h1 className="mt-3 text-5xl font-black">
            Practical tools for your next task.
          </h1>
          <p className="muted mt-4 max-w-2xl text-lg">
            Every tool uses structured inputs, safe server-side generation and
            output designed to be reviewed.
          </p>
          <div className="grid-auto mt-10">
            {tools.map(
              ({ slug, name, description, benefit, credits, icon: Icon }) => (
                <article className="card p-6" key={slug}>
                  <div className="flex justify-between">
                    <Icon className="text-amber-400" />
                    <span className="rounded-full border px-2 py-1 text-xs">
                      Available
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold">{name}</h2>
                  <p className="muted mt-2">{description}</p>
                  <p className="mt-4 text-sm">
                    <b>Best for:</b> {benefit}
                  </p>
                  <Link
                    className="btn btn-primary mt-6 w-full"
                    href={`/tools/${slug}`}
                  >
                    Open tool · {credits} credit{credits > 1 ? "s" : ""}
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
