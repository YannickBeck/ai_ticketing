import { Money } from "@/components/shared/Money";
import { mockProducts } from "@/server/db/mockData";

export default function AdminProductsPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Produkte</h1>
      </header>
      <section className="grid two">
        {mockProducts.map((product) => (
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
