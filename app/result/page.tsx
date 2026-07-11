"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  FileJson,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import CompanyHeader from "@/components/CompanyHeader";
import DecisionCard from "@/components/DecisionCard";
import ScoreMeter from "@/components/ScoreMeter";
import RevenueChart from "@/components/charts/RevenueChart";
import ScoreRadarChart from "@/components/charts/ScoreRadarChart";
import SWOTCard from "@/components/SWOTCard";
import RiskGauge from "@/components/RiskGauge";
import AnalysisLoader from "@/components/AnalysisLoader";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { saveToHistory, generateSearchId } from "@/lib/utils";
import type { AnalysisResult, AnalyzeResponse } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";

function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = searchParams.get("company");

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingTxt, setExportingTxt] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);

  useEffect(() => {
    if (!company) {
      router.push("/");
      return;
    }
    analyzeCompany(company);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  async function analyzeCompany(companyName: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error ?? "Analysis failed");
      }

      setResult(data.data);

      // Save to history
      saveToHistory({
        id: generateSearchId(),
        company: data.data.company,
        symbol: data.data.symbol,
        decision: data.data.decision,
        overallScore: data.data.overallScore,
        confidence: data.data.confidence,
        analyzedAt: data.data.analyzedAt,
        logo: data.data.logo,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze company");
    } finally {
      setLoading(false);
    }
  }

  async function exportReport(format: "text" | "json") {
    if (!result) return;

    if (format === "text") setExportingTxt(true);
    else setExportingJson(true);

    try {
      const response = await fetch(API_ENDPOINTS.REPORT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: result, format }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        format === "text"
          ? `${result.symbol}-report.txt`
          : `${result.symbol}-report.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export report");
    } finally {
      if (format === "text") setExportingTxt(false);
      else setExportingJson(false);
    }
  }

  if (!company) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Back + Search */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Search
              </Button>
            </Link>
            <div className="hidden md:block flex-1 max-w-sm">
              <SearchBar compact defaultValue={company} />
            </div>
          </div>

          {/* Loading State */}
          {loading && <AnalysisLoader companyName={company} />}

          {/* Error State */}
          {error && !loading && (
            <Card variant="bordered">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <AlertTriangle className="h-12 w-12 text-rose-400" />
                <p className="text-lg font-semibold text-rose-300">Analysis Failed</p>
                <p className="text-sm text-slate-500 max-w-md text-center">{error}</p>
                <Button
                  variant="gradient"
                  onClick={() => analyzeCompany(company)}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-6 animate-fade-in-up">
              {/* AI Failure Warning */}
              {result.warning && (
                <Card variant="bordered" className="border-rose-500/40 bg-rose-500/10">
                  <CardContent className="py-4 flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-200">
                      <span className="font-semibold">This is not a real analysis:</span>{" "}
                      {result.warning}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Company Header */}
              <CompanyHeader result={result} />

              {/* Investment Decision */}
              <DecisionCard result={result} />

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport("text")}
                  loading={exportingTxt}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Export PDF/TXT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport("json")}
                  loading={exportingJson}
                >
                  <FileJson className="h-3.5 w-3.5" />
                  Export JSON
                </Button>
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card variant="glass">
                      <CardHeader>
                        <CardTitle>Score Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScoreRadarChart result={result} />
                      </CardContent>
                    </Card>

                    <Card variant="glass">
                      <CardHeader>
                        <CardTitle>Historical Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RevenueChart data={result.historicalRevenue} />
                      </CardContent>
                    </Card>
                  </div>

                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle>SWOT Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SWOTCard swot={result.swot} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial" className="space-y-4">
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle>Financial Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-4">
                        {result.financialAnalysis.summary}
                      </p>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { label: "Revenue", data: result.financialAnalysis.revenue },
                          { label: "Profitability", data: result.financialAnalysis.profitability },
                          { label: "Growth", data: result.financialAnalysis.growth },
                          { label: "Cash Flow", data: result.financialAnalysis.cashFlow },
                          { label: "Debt", data: result.financialAnalysis.debt },
                          { label: "Valuation", data: result.financialAnalysis.valuation },
                        ].map(({ label, data }) => (
                          <ScoreMeter
                            key={label}
                            score={data.score}
                            size="sm"
                            label={label}
                            sublabel={data.trend}
                          />
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <RevenueChart data={result.historicalRevenue} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Business Tab */}
                <TabsContent value="business" className="space-y-4">
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle>Business Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-4">
                        {result.businessAnalysis.summary}
                      </p>
                      <Separator className="my-4" />
                      <SWOTCard swot={result.swot} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Risk Tab */}
                <TabsContent value="risk" className="space-y-4">
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle>Risk Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-4">
                        {result.riskAnalysis.summary}
                      </p>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RiskGauge label="Competition Risk" factor={result.riskAnalysis.competitionRisk} />
                        <RiskGauge label="Debt Risk" factor={result.riskAnalysis.debtRisk} />
                        <RiskGauge label="Regulatory Risk" factor={result.riskAnalysis.regulatoryRisk} />
                        <RiskGauge label="Geopolitical Risk" factor={result.riskAnalysis.geopoliticalRisk} />
                        <RiskGauge label="Market Risk" factor={result.riskAnalysis.marketRisk} />
                        <RiskGauge label="Operational Risk" factor={result.riskAnalysis.operationalRisk} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Disclaimer */}
              <Card variant="bordered" className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-semibold text-amber-400">Disclaimer:</span>{" "}
                    This report is AI-generated for informational purposes only. It is NOT financial advice.
                    Always consult a qualified financial advisor before making investment decisions.
                    Past performance does not guarantee future results. Data sources: {result.dataSource}.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  );
}
