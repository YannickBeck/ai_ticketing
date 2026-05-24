import { deliveryPlanningService } from "@/server/services/DeliveryPlanningService";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function AdminDeliveryPage() {
  const suggestions = await deliveryPlanningService.getSuggestions();

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Lieferplanung</h1>
      </header>
      <section className="grid">
        {suggestions.map((suggestion) => (
          <article className="card" key={`${suggestion.standId}-${suggestion.productId}`}>
            <div className="card-header">
              <h3>{suggestion.productId}</h3>
              <StatusBadge status={suggestion.status} />
            </div>
            <p>Empfehlung: {suggestion.recommendedQuantity} Einheiten</p>
          </article>
        ))}
      </section>
    </>
  );
}
