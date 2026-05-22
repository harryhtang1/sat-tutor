import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  // TODO: call Anthropic API using ANTHROPIC_API_KEY
  return NextResponse.json({ explanation: "Not implemented yet." });
}
