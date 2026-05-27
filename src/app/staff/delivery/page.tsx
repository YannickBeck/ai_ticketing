import { getCurrentUser } from "@/server/auth/requireUser";
import { standService } from "@/server/services/StandService";
import { StaffDeliveryForm } from "./StaffDeliveryForm";

export const dynamic = "force-dynamic";

async function loadStandsWithProducts(standIds: string[]) {
  const entries = await Promise.allSettled(
    standIds.map(async (id) => {
      const stand = await standService.getStand(id);
      const products = await standService
        .getProductsForStand(id)
        .then((items) => items.map((i) => ({ id: i.product.id, name: i.product.name })))
        .catch(() => []);
      return { id: stand.id, name: stand.name, products };
    }),
  );
  return entries
    .filter((r): r is PromiseFulfilledResult<{ id: string; name: string; products: { id: string; name: string }[] }> => r.status === "fulfilled")
    .map((r) => r.value);
}

export default async function StaffDeliveryPage() {
  const user = await getCurrentUser();
  const standIds = user?.standIds ?? [];
  const stands = standIds.length > 0 ? await loadStandsWithProducts(standIds) : [];

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>Lieferung erfassen</h1>
      </header>
      <StaffDeliveryForm stands={stands} />
    </>
  );
}
