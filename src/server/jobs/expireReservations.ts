import { reservationService } from "@/server/services/ReservationService";

export async function expireReservationsJob(now = new Date()) {
  const result = await reservationService.expirePendingReservations(now);

  return {
    status: "completed",
    cadence: "every 1-5 minutes",
    responsibility: "pending_payment Orders nach expires_at auf expired setzen und Inventory freigeben",
    ...result,
  };
}
