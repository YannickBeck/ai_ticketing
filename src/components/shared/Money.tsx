export function Money({ cents, currency = "EUR" }: { cents: number; currency?: string }) {
  return (
    <span>
      {(cents / 100).toLocaleString("de-DE", {
        style: "currency",
        currency,
      })}
    </span>
  );
}
