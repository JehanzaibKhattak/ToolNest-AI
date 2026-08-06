import { Navbar, Footer } from "@/components/layout";
export default function Terms() {
  return (
    <>
      <Navbar />
      <main className="section container max-w-3xl">
        <h1 className="text-4xl font-black">Terms</h1>
        <p className="muted mt-6 leading-7">
          ToolNest AI provides assistive drafts and estimates, not professional
          advice. You retain responsibility for submitted content and final use.
          Resume scores do not represent an employer’s actual ATS and do not
          guarantee interviews or employment. Do not use the service unlawfully
          or to infringe third-party rights.
        </p>
      </main>
      <Footer />
    </>
  );
}
