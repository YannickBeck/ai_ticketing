import { WhatsAppOptIn } from "@/components/customer/WhatsAppOptIn";

export default function NotificationPreferencesPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Konto</span>
        <h1>Benachrichtigungen</h1>
        <p className="lead">E-Mail bleibt Fallback; WhatsApp ist freiwillig und jederzeit deaktivierbar.</p>
      </header>
      <WhatsAppOptIn />
    </>
  );
}
