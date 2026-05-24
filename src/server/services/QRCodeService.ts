import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

import { ApiError } from "@/server/api/http";

type TokenPayload = {
  tokenId: string;
  type: "order" | "stand" | "stand_product" | "staff";
  referenceId: string;
  exp: number;
  nonce: string;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export class QRCodeService {
  createSignedToken(input: Omit<TokenPayload, "nonce"> & { nonce?: string }) {
    const payload: TokenPayload = {
      ...input,
      nonce: input.nonce ?? randomBytes(16).toString("hex"),
    };
    const encodedPayload = base64Url(JSON.stringify(payload));
    const signature = this.sign(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  hashToken(token: string) {
    const pepper = process.env.QR_TOKEN_PEPPER ?? "local-dev-pepper";
    return createHash("sha256").update(`${token}.${pepper}`).digest("hex");
  }

  verifySignedToken(token: string): TokenPayload {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature || this.sign(encodedPayload) !== signature) {
      throw new ApiError("FORBIDDEN", "QRToken-Signatur ist ungueltig.", 403);
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;

    if (payload.exp * 1000 < Date.now()) {
      throw new ApiError("RESERVATION_EXPIRED", "QRToken ist abgelaufen.", 410);
    }

    return payload;
  }

  buildQrLink(token: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return `${appUrl}/pickup/scan?token=${encodeURIComponent(token)}`;
  }

  createOrderPickupToken(orderId: string, pickupSlotEnd: Date) {
    const tokenId = randomUUID();
    const tokenNonce = randomBytes(16).toString("hex");
    const expiresAt = new Date(pickupSlotEnd.getTime() + 1000 * 60 * 60 * 2);
    const token = this.createSignedToken({
      tokenId,
      type: "order",
      referenceId: orderId,
      exp: Math.floor(expiresAt.getTime() / 1000),
      nonce: tokenNonce,
    });

    return {
      tokenId,
      tokenNonce,
      token,
      tokenHash: this.hashToken(token),
      expiresAt,
      qrLink: this.buildQrLink(token),
    };
  }

  buildStoredOrderPickupToken(input: {
    tokenId: string;
    tokenNonce: string;
    orderId: string;
    expiresAt: Date;
  }) {
    const token = this.createSignedToken({
      tokenId: input.tokenId,
      type: "order",
      referenceId: input.orderId,
      exp: Math.floor(input.expiresAt.getTime() / 1000),
      nonce: input.tokenNonce,
    });

    return {
      token,
      tokenHash: this.hashToken(token),
      qrLink: this.buildQrLink(token),
    };
  }

  private sign(payload: string) {
    const secret = process.env.QR_TOKEN_SECRET ?? "local-dev-secret";
    return createHmac("sha256", secret).update(payload).digest("base64url");
  }
}

export const qrCodeService = new QRCodeService();
