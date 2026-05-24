import { KeyRound } from "lucide-react";

export function QRCodeDisplay({
  orderNumber,
  qrDataUrl,
  qrLink,
}: {
  orderNumber: string;
  qrDataUrl?: string;
  qrLink?: string;
}) {
  return (
    <div className="stack">
      <div className="qr-box" aria-label="QR-Code Platzhalter">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt={`QR-Code fuer Bestellung ${orderNumber}`} width={220} height={220} />
        ) : (
          <KeyRound size={42} aria-hidden="true" />
        )}
      </div>
      <p>
        Abholcode: <strong>{orderNumber}</strong>
      </p>
      {qrLink ? (
        <p className="muted">
          Sicherer Abhollink: <span className="text-wrap">{qrLink}</span>
        </p>
      ) : null}
    </div>
  );
}
