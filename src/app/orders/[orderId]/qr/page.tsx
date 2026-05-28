import QRCode from "qrcode";
import { notFound, redirect } from "next/navigation";

import { QRCodeDisplay } from "@/components/customer/QRCodeDisplay";
import { getCurrentUser } from "@/server/auth/requireUser";
import { reservationService } from "@/server/services/ReservationService";

type PageProps = { params: Promise<{ orderId: string }> };

export default async function OrderQrPage({ params }: PageProps) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/orders/${orderId}/qr`);

  const qr = await reservationService.getOrderQr(orderId).catch(() => null);
  if (!qr || qr.order.customerId !== user.id) notFound();
  const qrDataUrl = await QRCode.toDataURL(qr.qrLink, {
    margin: 1,
    width: 240,
  });

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">QR Abholung</span>
        <h1>Abholcode {qr.order.orderNumber}</h1>
        <p className="lead">Dieser QR-Code wird nach erfolgreichem Payment erzeugt und nur einmal verwendet.</p>
      </header>
      <QRCodeDisplay orderNumber={qr.order.orderNumber} qrDataUrl={qrDataUrl} qrLink={qr.qrLink} />
    </>
  );
}
