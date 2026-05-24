import { StaffDeliveryForm } from "@/app/staff/delivery/StaffDeliveryForm";

export default function StaffDeliveryPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>Lieferung erfassen</h1>
      </header>
      <StaffDeliveryForm />
    </>
  );
}
