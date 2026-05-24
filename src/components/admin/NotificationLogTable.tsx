import { mockNotifications } from "@/server/db/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function NotificationLogTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Zeitpunkt</th>
            <th>Order</th>
            <th>Kanal</th>
            <th>Template</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockNotifications.map((notification) => (
            <tr key={notification.id}>
              <td>{new Date(notification.createdAt).toLocaleString("de-DE")}</td>
              <td>{notification.orderId}</td>
              <td>{notification.channel}</td>
              <td>{notification.templateKey}</td>
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
