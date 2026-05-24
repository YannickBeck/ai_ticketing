import { NextResponse } from "next/server";

import type { ApiErrorCode } from "@/server/domain/types";

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status = 400,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function jsonCreated<T>(data: T) {
  return jsonOk(data, { status: 201 });
}

export function jsonAccepted<T>(data: T) {
  return jsonOk(data, { status: 202 });
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unerwarteter Fehler.",
        details: null,
      },
    },
    { status: 500 },
  );
}

export async function withApiErrors(handler: () => Promise<Response> | Response) {
  try {
    return await handler();
  } catch (error) {
    return jsonError(error);
  }
}

export function skeleton(name: string, details: Record<string, unknown> = {}) {
  return jsonOk({
    status: "skeleton",
    name,
    details,
  });
}

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError("VALIDATION_ERROR", "Request body muss valides JSON sein.", 400);
  }
}

export function parseSearchNumber(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
