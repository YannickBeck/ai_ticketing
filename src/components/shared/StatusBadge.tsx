import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "destructive" | "warning" | "info" | "secondary" | "outline";

type StatusConfig = {
  label: string;
  variant: BadgeVariant;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  // Order statuses
  pending_payment:   { label: "Zahlung ausstehend", variant: "warning" },
  confirmed:         { label: "Bestätigt",           variant: "default" },
  ready_for_pickup:  { label: "Abholbereit",         variant: "info" },
  picked_up:         { label: "Abgeholt",            variant: "secondary" },
  cancelled:         { label: "Storniert",           variant: "destructive" },
  expired:           { label: "Abgelaufen",          variant: "destructive" },
  refunded:          { label: "Erstattet",           variant: "secondary" },

  // Inventory / product statuses
  available:         { label: "Verfügbar",           variant: "default" },
  low_stock:         { label: "Geringer Bestand",    variant: "warning" },
  out_of_stock:      { label: "Ausverkauft",         variant: "destructive" },
  unavailable:       { label: "Nicht verfügbar",     variant: "secondary" },

  // Stand statuses
  open:              { label: "Geöffnet",            variant: "default" },
  closed:            { label: "Geschlossen",         variant: "secondary" },
  paused:            { label: "Pausiert",            variant: "warning" },

  // Notification statuses
  sent:              { label: "Gesendet",            variant: "default" },
  failed:            { label: "Fehlgeschlagen",      variant: "destructive" },
  pending:           { label: "Ausstehend",          variant: "warning" },

  // QR token
  active:            { label: "Aktiv",               variant: "default" },
  used:              { label: "Verwendet",           variant: "secondary" },
  revoked:           { label: "Widerrufen",          variant: "destructive" },
};

function humanize(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status.toLowerCase()];
  return (
    <Badge variant={config?.variant ?? "secondary"}>
      {config?.label ?? humanize(status)}
    </Badge>
  );
}
