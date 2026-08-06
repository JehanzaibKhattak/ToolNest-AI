import { AuthPage } from "@/components/auth-page";
export default function Page() {
  return (
    <AuthPage
      mode="forgot"
      title="Reset your password"
      copy="We’ll email you a secure reset link."
    />
  );
}
