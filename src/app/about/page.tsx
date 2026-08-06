import { Navbar, Footer } from "@/components/layout";
export default function About() {
  return (
    <>
      <Navbar />
      <main className="section container max-w-3xl">
        <p className="eyebrow">About</p>
        <h1 className="mt-3 text-5xl font-black">
          AI that earns its place in your workflow.
        </h1>
        <p className="muted mt-6 text-lg leading-8">
          ToolNest AI, built by AGI Innovations, turns common work into focused
          workflows. We favor useful structure, clear limitations and human
          review over novelty.
        </p>
      </main>
      <Footer />
    </>
  );
}
