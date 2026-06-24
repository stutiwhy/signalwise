import { NextResponse } from "next/server";

import { resetDb } from "@/modules/reset/reset-db";
import { syncYC } from "@/modules/yc/sync";
import { scoreCompanies } from "@/modules/scoring/score-companies";

export async function POST() {
  try {
    await resetDb();
    await syncYC();
    await scoreCompanies();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}