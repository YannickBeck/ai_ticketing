import { StaffScanForm } from "@/app/staff/scan/StaffScanForm";

type PageProps = { searchParams: Promise<{ token?: string }> };

export default async function StaffScanPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>QR scannen</h1>
      </header>
      <StaffScanForm initialToken={token} />
    </>
  );
}
