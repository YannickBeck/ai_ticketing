import { StaffHomeActions } from "@/components/staff/StaffHomeActions";
import { OpenOrdersList } from "@/components/staff/OpenOrdersList";

export const dynamic = "force-dynamic";

export default function StaffPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>Standbetrieb</h1>
      </header>
      <div className="stack">
        <StaffHomeActions />
        <OpenOrdersList />
      </div>
    </>
  );
}
