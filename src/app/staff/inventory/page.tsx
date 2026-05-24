import { StaffInventoryForm } from "@/app/staff/inventory/StaffInventoryForm";

export default function StaffInventoryPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>Bestand aktualisieren</h1>
      </header>
      <StaffInventoryForm />
    </>
  );
}
