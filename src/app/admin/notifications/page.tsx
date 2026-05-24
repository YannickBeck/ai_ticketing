import { NotificationLogTable } from "@/components/admin/NotificationLogTable";

export default function AdminNotificationsPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Benachrichtigungen</h1>
        <p className="lead">Transaktionale E-Mail- und WhatsApp-Versandhistorie.</p>
      </header>
      <NotificationLogTable />
    </>
  );
}
