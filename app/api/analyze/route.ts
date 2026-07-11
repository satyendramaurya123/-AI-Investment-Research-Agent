import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runInvestmentResearch } from "@backend/agents/investmentGraph";
import type { AnalyzeResponse } from "@/types";

// ============================================================
// POST /api/analyze
// Body: { company: string }
// Returns: AnalysisResult
// ============================================================

const AnalyzeSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name too long")
    .trim(),
});

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = AnalyzeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message ?? "Invalid request",
        },
        { status: 400 }
      );
    }

    const { company } = validation.data;

    // Basic sanity check on company name
    if (/^\d+$/.test(company)) {
      return NextResponse.json(
        { success: false, error: "Please enter a company name, not a number" },
        { status: 400 }
      );
    }

    // Run the LangGraph investment research workflow, with a hard cap so
    // a slow/stuck LLM call can never leave the
    // request — and the frontend spinner — hanging forever.
    const ANALYSIS_TIMEOUT_MS = 55_000;
    const result = await Promise.race([
      runInvestmentResearch(company),
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Analysis is taking longer than expected. Please try again."
              )
            ),
          ANALYSIS_TIMEOUT_MS
        )
      ),
    ]);

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error) {
    console.error("Analysis error:", error);

    const message =
      error instanceof Error ? error.message : "Analysis failed unexpectedly";

    // Handle specific error types
    if (message.includes("rate limit") || message.includes("429")) {
      return NextResponse.json(
        { success: false, error: "API rate limit reached. Please try again in a minute." },
        { status: 429 }
      );
    }

    if (message.includes("GROQ_API_KEY") || message.includes("API key")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Groq API key not configured. Please add GROQ_API_KEY to .env.local",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { message: "Use POST with { company: string } to analyze a company" },
    { status: 200 }
  );
}
