import { Navbar, Footer } from "@/components/layout";
export default function Privacy() {
  return (
    <>
      <Navbar />
      <main className="section container max-w-3xl">
        <h1 className="text-4xl font-black">Privacy</h1>
        <p className="muted mt-6 leading-7">
          We process submitted content to provide requested AI output. Avoid
          submitting secrets you do not need analyzed. Resume uploads are
          restricted by type and size. Sensitive source content is not placed in
          summaries or logs. Configure your OpenAI and Supabase retention
          settings for your jurisdiction.
        </p>
        <h2 className="mt-8 text-2xl font-bold">AI phone receptionist</h2>
        <p className="muted mt-3 leading-7">
          Calls to an AI receptionist are handled by our voice provider, Vapi.
          Caller numbers, transcripts, summaries, details callers choose to
          leave and, when the business enables it, recordings are stored for the
          business that owns the receptionist and are visible only to that
          account. Businesses are responsible for telling callers about
          recording where the law requires consent.
        </p>
        <h2 className="mt-8 text-2xl font-bold">Human review</h2>
        <p className="muted mt-3">
          AI output can be inaccurate and must be reviewed before professional,
          academic, hiring or legal use.
        </p>
      </main>
      <Footer />
    </>
  );
}
