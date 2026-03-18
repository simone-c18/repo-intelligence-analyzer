"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState(""); //handles multiple urls
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBatchAnalyze = async () => {
    setLoading(true);
    setReports([]); //clears previous results

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
        if (response.ok) {
          setReports((prev) => [...prev, { ...data, url }]);
        }
      } catch (error) {
        console.error(`Failed to analyze ${url}`);
      }
      setLoading(false);
    }
  };

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