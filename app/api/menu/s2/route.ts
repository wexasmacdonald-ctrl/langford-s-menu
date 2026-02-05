import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { S2Data } from "@/lib/menu-types";
import { defaultS2Data } from "@/lib/menu-defaults";

export const dynamic = "force-dynamic";

const dataPath = path.join(process.cwd(), "data", "menu-s2.json");

async function ensureFile() {
  await mkdir(path.dirname(dataPath), { recursive: true });
  try {
    await readFile(dataPath, "utf8");
  } catch {
    await writeFile(dataPath, JSON.stringify(defaultS2Data, null, 2));
  }
}

export async function GET() {
  await ensureFile();
  const raw = await readFile(dataPath, "utf8");
  const data = JSON.parse(raw) as S2Data;
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as S2Data;
  await ensureFile();
  await writeFile(dataPath, JSON.stringify(payload, null, 2));
  return NextResponse.json({ ok: true });
}
