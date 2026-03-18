"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState(""); //handles multiple urls
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBatchAnalyze = async () => {
    setLoading(true);
    setReports([]); //clears previous results
    setError(null); //clear previous errors

    //splits input by commas or new lines, cleans up whitespaces
    const urls = input.split(/[\n,]+/).map(u => u.trim()).filter(u => u !== "");

    for (const url of urls) {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "An unexpected error occurred");
          setLoading(false);
          return; //stops processing
        }
        setReports((prev) => [...prev, { ...data, url }]);
      } catch (error) {
        setError("Check your internet connection or the URL format.");
      }
      setLoading(false);
    }
  };

  if (!mounted) return null; // Wait until client-side to render

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            GitHub <span className="text-blue-500">Intelligence</span>
          </h1>
          <p className="text-slate-400">Enter one or multiple repo URLs (separated by commas or new lines).</p>
        </header>

        {/* Input Section */}
        <div className="space-y-4">
          <textarea 
            rows={4}
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            placeholder="https://github.com/facebook/react, https://github.com/vercel/next.js"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            onClick={handleBatchAnalyze}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/20"
          >
            {loading ? "Analyzing Batch..." : "Generate Intelligence Reports"}
          </button>
        </div>

        {/* Displays error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <p className="text-red-200 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Section (Structured Reports) */}
        <div className="grid gap-6">
          {reports.map((report, index) => (
            <section key={index} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{report.name}</h2>
                  <p className="text-slate-500 text-sm">{report.url}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  report.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                  report.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {report.difficulty}
                </span>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Activity Score" value={report.activityScore} color="text-blue-400" subtitle="Engagement Velocity" />
                <MetricCard title="Complexity" value={report.complexityScore} color="text-purple-400" subtitle="Codebase Weight" />
                <MetricCard title="Top Language" value={report.languages[0] || "N/A"} color="text-slate-200" subtitle="Primary Stack" />
              </div>
            </section>
          ))}
        </div>

        {/* Methodology Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h3 className="font-bold text-emerald-500 uppercase tracking-wider text-xs">Beginner</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Small codebases (<span className="text-slate-200">50MB</span>) with focused tech stacks. 
              Ideal for learning core patterns and individual contributions.
            </p>
          </div>

          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <h3 className="font-bold text-yellow-500 uppercase tracking-wider text-xs">Intermediate</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Established projects with <span className="text-slate-200">multi-language</span> stacks and 
              moderate community activity (500+ forks). Requires architectural awareness.
            </p>
          </div>

          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <h3 className="font-bold text-red-500 uppercase tracking-wider text-xs">Advanced</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Massive enterprise-scale repos (<span className="text-slate-200">50MB</span>) with high 
              complexity and rapid commit velocity. Involves complex CI/CD and dependencies.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

//helper component for UI consistency 
function MetricCard({ title, value, color, subtitle }: any) {
  return (
    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <p className={`text-3xl font-mono font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-600 mt-2 italic">{subtitle}</p>
    </div>
  );
}