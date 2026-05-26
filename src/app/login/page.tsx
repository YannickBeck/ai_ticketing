import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Anmelden – Spargelstand-App" };

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Anmelden</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
