import { Money } from "@/components/shared/Money";
import { productService } from "@/server/services/ProductService";

export default async function AdminProductsPage() {
  const result = await productService
    .listProducerProducts("producer_sonnenhof")
    .then((items) => ({ items, failed: false }))
    .catch(() => ({ items: [], failed: true }));

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Produkte</h1>
      </header>
      {result.failed ? (
        <div className="card stack">
          <h2>Produkte nicht geladen</h2>
          <p className="muted">Die Datenbank ist nicht erreichbar oder noch nicht migriert.</p>
        </div>
      ) : null}
      <section className="grid two">
        {result.items.map((product) => (
          <article className="card stack" key={product.id}>
            <h3>{product.name}</h3>
            <p className="muted">{product.category}</p>
            <p>
              <Money cents={product.priceCents} /> / {product.unit}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
