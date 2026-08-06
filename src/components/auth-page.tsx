import { Logo } from "./layout";
import { AuthForm } from "./auth-form";
export function AuthPage({
  mode,
  title,
  copy,
}: {
  mode: "login" | "register" | "forgot";
  title: string;
  copy: string;
}) {
  return (
    <main className="hero-glow grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-3xl font-black">{title}</h1>
        <p className="muted mt-2 mb-6 text-center">{copy}</p>
        <AuthForm mode={mode} />
      </div>
    </main>
  );
}
