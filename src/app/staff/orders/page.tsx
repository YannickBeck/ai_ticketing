import { OpenOrdersList } from "@/components/staff/OpenOrdersList";

export const dynamic = "force-dynamic";

export default function StaffOrdersPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>Offene Bestellungen</h1>
      </header>
      <OpenOrdersList />
    </>
  );
}
