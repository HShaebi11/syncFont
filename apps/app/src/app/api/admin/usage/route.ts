import { NextResponse } from "next/server";

import { requireAdmin } from "@typefolio/core/access";
import { getUsageAdminSummary } from "@typefolio/core/usage/admin-summary";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const url = new URL(request.url);
  const daysRaw = url.searchParams.get("days");
  const days = daysRaw ? Math.min(90, Math.max(1, Number(daysRaw))) : 7;

  const summary = await getUsageAdminSummary(Number.isFinite(days) ? days : 7);
  return NextResponse.json(summary);
}
