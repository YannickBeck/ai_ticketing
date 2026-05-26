import { StatusBadge } from "@/components/shared/StatusBadge";
import { getCurrentUser } from "@/server/auth/requireUser";
import { adminQueryService } from "@/server/services/AdminQueryService";

export async function NotificationLogTable() {
  const user = await getCurrentUser();
  const result =
    user
      ? await adminQueryService
          .listNotifications(user)
          .then((items) => ({ items, failed: false }))
          .catch(() => ({ items: [], failed: true }))
      : { items: [], failed: true };

  if (result.failed) {
    return (
      <div className="card stack">
        <h2>Benachrichtigungen nicht geladen</h2>
        <p className="muted">Die Datenbank ist nicht erreichbar oder noch nicht migriert.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Zeitpunkt</th>
            <th>Order</th>
            <th>Kanal</th>
            <th>Template</th>
            <th>Empfänger</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {result.items.length === 0 ? (
            <tr>
              <td colSpan={6}>Noch keine Benachrichtigungen vorhanden.</td>
            </tr>
          ) : null}
          {result.items.map((notification) => (
            <tr key={notification.id}>
              <td>{new Date(notification.createdAt).toLocaleString("de-DE")}</td>
              <td>{notification.orderNumber ?? notification.orderId}</td>
              <td>{notification.channel}</td>
              <td>{notification.templateKey}</td>
              <td>{notification.maskedRecipient}</td>
              <td>
                <StatusBadge status={notification.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
