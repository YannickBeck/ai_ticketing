import { ProductCreateForm } from "@/components/admin/ProductCreateForm";
import { Money } from "@/components/shared/Money";
import { getCurrentUser } from "@/server/auth/requireUser";
import { productService } from "@/server/services/ProductService";
import { standService } from "@/server/services/StandService";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  const producerId = user?.role === "platform_admin" ? undefined : (user?.producerId ?? undefined);

  const [productsResult, standsResult] = await Promise.allSettled([
    productService.listProducerProducts(producerId),
    standService.listAdminStands(producerId),
  ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const stands = standsResult.status === "fulfilled"
    ? standsResult.value.map((s) => ({ id: s.id, name: s.name }))
    : [];
  const failed = productsResult.status === "rejected";

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Produkte</h1>
      </header>

      <ProductCreateForm stands={stands} />

      {failed ? (
        <div className="card stack">
          <h2>Produkte nicht geladen</h2>
          <p className="muted">Die Datenbank ist nicht erreichbar oder noch nicht migriert.</p>
        </div>
      ) : null}

      <section className="grid two">
        {products.map((product) => (
          <article className="card stack" key={product.id}>
            <h3>{product.name}</h3>
            <p className="muted">{product.category}</p>
            <p>
              <Money cents={product.priceCents} /> / {product.unit}
            </p>
            {product.description ? (
              <p className="muted" style={{ fontSize: "0.85rem" }}>
                {product.description}
              </p>
            ) : null}
          </article>
        ))}
        {products.length === 0 && !failed ? (
          <p className="muted">Noch keine Produkte vorhanden.</p>
        ) : null}
      </section>
    </>
  );
}
