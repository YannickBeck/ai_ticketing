import { StandCard } from "@/components/customer/StandCard";
import { mockStands } from "@/server/db/mockData";

export default function AdminStandsPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Stände</h1>
      </header>
      <section className="grid two">
        {mockStands.map((stand) => (
          <StandCard stand={stand} key={stand.id} />
        ))}
      </section>
    </>
  );
}
