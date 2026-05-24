import { ReservationForm } from "@/app/stands/[standId]/products/[productId]/ReservationForm";
import { WhatsAppOptIn } from "@/components/customer/WhatsAppOptIn";
import { Money } from "@/components/shared/Money";
import { productService } from "@/server/services/ProductService";
import { standService } from "@/server/services/StandService";

type PageProps = { params: Promise<{ standId: string; productId: string }> };

export default async function ProductReservationPage({ params }: PageProps) {
  const { standId, productId } = await params;
  const [stand, product] = await Promise.all([standService.getStand(standId), productService.getProduct(productId)]);
  const pickupSlots = buildPickupSlots();

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Reservierung</span>
        <h1>{product.name}</h1>
        <p className="lead">
          {stand.name} · <Money cents={product.priceCents} /> / {product.unit}
        </p>
      </header>
      <section className="split">
        <ReservationForm
          pickupSlots={pickupSlots}
          priceCents={product.priceCents}
          productId={product.id}
          productName={product.name}
          standId={stand.id}
          unit={product.unit}
        />
        <WhatsAppOptIn />
      </section>
    </>
  );
}

function buildPickupSlots() {
  const base = new Date();
  base.setMinutes(0, 0, 0);

  return [1, 2, 3].map((hoursFromNow) => {
    const start = new Date(base.getTime() + hoursFromNow * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    return {
      label: `${start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} bis ${end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`,
      start: start.toISOString(),
      end: end.toISOString(),
    };
  });
}
