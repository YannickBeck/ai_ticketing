import { ProductAvailabilityCard } from "@/components/customer/ProductAvailabilityCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { standService } from "@/server/services/StandService";

type PageProps = { params: Promise<{ standId: string }> };

export default async function StandDetailPage({ params }: PageProps) {
  const { standId } = await params;
  const stand = await standService.getStand(standId);
  const products = await standService.getProductsForStand(standId);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Stand</span>
        <h1>{stand.name}</h1>
        <p className="lead">
          {stand.address}, {stand.city}
        </p>
        <StatusBadge status={stand.status} />
      </header>
      <section className="grid two">
        {products.map((item) => (
          <ProductAvailabilityCard item={item} key={item.inventoryId} standId={stand.id} />
        ))}
      </section>
    </>
  );
}
