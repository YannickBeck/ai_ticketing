import { SignupForm } from "./SignupForm";

export const metadata = { title: "Registrieren – Spargelstand-App" };

export default function SignupPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Konto erstellen</h1>
        <SignupForm />
      </div>
    </div>
  );
}
