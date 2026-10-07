"use client";
export default function ReceptionistError({ retry }: { retry: () => void }) {
  return (
    <div className="card grid justify-items-start gap-3 p-8" role="alert">
      <h1 className="text-xl font-bold">Receptionists could not be loaded</h1>
      <p className="muted">Check your connection and try again.</p>
      <button className="btn" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
