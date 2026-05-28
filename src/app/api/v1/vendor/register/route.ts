import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name:         z.string().min(2).max(100),
  email:        z.string().email(),
  password:     z.string().min(8).max(128),
  producerName: z.string().min(2).max(100),
  standName:    z.string().min(2).max(100),
  addressLine:  z.string().min(3).max(200),
  postalCode:   z.string().min(4).max(10),
  city:         z.string().min(2).max(100),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Ungültige Eingabe.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { name, email, password, producerName, standName, addressLine, postalCode, city } =
    parsed.data;

  const admin = createSupabaseAdminClient();

  // 1. Create Supabase auth user (bypasses email confirmation — we handle it ourselves)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so the vendor can log in immediately
    user_metadata: { name },
  });

  if (authError) {
    // Supabase returns a descriptive message for duplicates etc.
    const msg =
      authError.message.includes("already")
        ? "Diese E-Mail-Adresse ist bereits registriert."
        : authError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = authData.user.id;

  // 2. The DB trigger `handle_new_auth_user` fires and creates User with role='customer'.
  //    We wait briefly to ensure the trigger has run, then upgrade atomically.
  //    (Trigger is synchronous within the same Supabase transaction — usually instant.)

  try {
    await prisma.$transaction(async (tx) => {
      // a) Create Producer
      const producer = await tx.producer.create({
        data: {
          name: producerName,
          billingEmail: email,
          status: "ACTIVE",
        },
      });

      // b) Create Stand (CLOSED until platform-admin reviews & activates)
      await tx.stand.create({
        data: {
          producerId:   producer.id,
          name:         standName,
          addressLine,
          postalCode,
          city,
          latitude:     0,
          longitude:    0,
          openingHours: {},
          status:       "CLOSED",
          publicNote:   null,
        },
      });

      // c) Upgrade the User that the trigger created
      //    Use upsert in case the trigger hasn't fired yet (race condition safety).
      await tx.user.upsert({
        where: { id: userId },
        update: {
          name,
          role:       "PRODUCER_ADMIN",
          producerId: producer.id,
        },
        create: {
          id:         userId,
          name,
          email,
          role:       "PRODUCER_ADMIN",
          producerId: producer.id,
          active:     true,
        },
      });
    });
  } catch (err) {
    // DB setup failed — clean up the auth user so the email is not blocked
    await admin.auth.admin.deleteUser(userId).catch(() => null);
    console.error("[vendor/register] DB transaction failed:", err);
    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen. Bitte versuche es erneut." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
