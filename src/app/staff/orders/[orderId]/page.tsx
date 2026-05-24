import { QRCodeDisplay } from "@/components/customer/QRCodeDisplay";
import { StaffPickupForm } from "@/app/staff/orders/[orderId]/StaffPickupForm";
import { reservationService } from "@/server/services/ReservationService";

type PageProps = { params: Promise<{ orderId: string }> };

export const dynamic = "force-dynamic";

export default async function StaffOrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await reservationService.getOrder(orderId);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff Order</span>
        <h1>{order.orderNumber}</h1>
      </header>
      <section className="split">
        <QRCodeDisplay orderNumber={order.orderNumber} />
        <StaffPickupForm orderId={order.id} orderNumber={order.orderNumber} standId={order.standId} />
      </section>
    </>
  );
}
