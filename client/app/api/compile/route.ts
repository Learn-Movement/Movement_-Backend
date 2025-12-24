import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code : "";

    const backendBaseUrl =
      process.env.BACKEND_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "http://backend:8000");
    const upstream = await fetch(`${backendBaseUrl}/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    }

    const text = await upstream.text();
    return NextResponse.json(
      {
        type: "compile_failed",
        success: false,
        error_count: 1,
        errors: [{ message: text || "Upstream returned a non-JSON response", type: "raw_output" }],
      },
      { status: upstream.status || 502 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        type: "compile_failed",
        success: false,
        error_count: 1,
        errors: [{ message, type: "proxy_error" }],
      },
      { status: 500 }
    );
  }
}
