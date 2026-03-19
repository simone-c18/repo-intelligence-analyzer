"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState(""); // track user input
  const [reports, setReports] = useState<any[]>([]); // list of analyzed repos
  const [loading, setLoading] = useState(false); // if computer is "thinking"
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // ensures component only renders on client (solves hydration error)
  useEffect(() => {
    setMounted(true);
  }, []);

  // function to read in user input (repo links)
  const handleBatchAnalyze = async () => {
    setLoading(true);
    setError(null);
    setReports([]);

    // splits input by commas or new lines
    // cleans up extra white spaces
    const urls = input.split(/[\n,]+/).map(u => u.trim()).filter(u => u !== "");

    // if no user input
    if (urls.length === 0) {
      setError("Please enter at least one GitHub URL.");
      setLoading(false);
      return;
    }

    // iterates through each provided repo
    for (const url of urls) {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || `Failed to analyze: ${url}`);
          continue; // keep going with other URLs even if one fails
        }

        setReports((prev) => [...prev, { ...data, url }]);
      } catch (err) {
        setError("Network error. Please check your connection.");
      }
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* header */}
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter">
            GIT<span className="text-blue-500">INTEL</span>
          </h1>
          <p className="text-slate-400 font-medium">Repository Intelligence & Complexity Analyzer</p>
        </header>

        {/* input section */}
        <div className="bg-slate-900/50 p-1 border border-slate-800 rounded-2xl shadow-2xl">
          <textarea 
            rows={3}
            className="w-full p-4 rounded-t-xl bg-transparent border-none focus:ring-0 outline-none text-lg resize-none"
            placeholder="Paste one or multiple GitHub URLs (separated by commas or new lines)."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            onClick={handleBatchAnalyze}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-4 rounded-b-xl font-bold text-lg transition-all active:scale-[0.99]"
          >
            {loading ? "Processing Intelligence..." : "Run Analysis Report"}
          </button>
        </div>

        {/* error display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* difficulty classification legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LegendCard color="bg-emerald-500" title="Beginner" desc="Small scale (<50MB), focused stacks. Ideal for core pattern learning." />
          <LegendCard color="bg-yellow-500" title="Intermediate" desc="Multi-language, established community (500+ forks). Complex architecture." />
          <LegendCard color="bg-red-500" title="Advanced" desc="Enterprise scale (>50MB), rapid velocity. High CI/CD & dependency depth." />
        </div>

        {/* structured results output */}
        <div className="space-y-8">
          {reports.map((report, index) => (
            <article key={index} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* card header */}
              <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{report.name}</h2>
                  <p className="text-slate-400 text-sm mt-1 max-w-xl">{report.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter border ${getDifficultyStyles(report.difficulty)}`}>
                    {report.difficulty}
                  </span>
                </div>
              </div>

              {/* reusable component for displaying repo info */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 p-8 bg-slate-950/20">
                <Stat title="Activity Score" value={report.activityScore} highlight="text-blue-400" />
                <Stat title="Complexity" value={report.complexityScore} highlight="text-purple-400" />
                <Stat title="Stars" value={report.stars.toLocaleString()} />
                <Stat title="Forks" value={report.forks.toLocaleString()} />
                <Stat title="Watchers" value={report.watchers.toLocaleString()} />
                <Stat 
                  title="Size" 
                  value={`${report.size} MB`} 
                />
              </div>

              {/* insights section */}
              <div className="p-8 border-t border-slate-800 bg-slate-950/40">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Intelligence Analysis</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.insights && report.insights.map((insight: string, i: number) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2 italic">
                      <span className="text-blue-600">↳</span> {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

/* --- HELPER COMPONENTS --- */

function LegendCard({ color, title, desc }: any) {
  // We use a mapping to avoid dynamic class string construction which can confuse tailwind
  const textColor = title === "Beginner" ? "text-emerald-500" : title === "Intermediate" ? "text-yellow-500" : "text-red-500";
  
  return (
    <div className="p-5 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className={`text-xs font-black uppercase tracking-widest ${textColor}`}>{title}</h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ title, value, highlight = "text-slate-200" }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{title}</p>
      <p className={`text-2xl font-mono font-bold ${highlight}`}>{value}</p>
    </div>
  );
}

function getDifficultyStyles(diff: string) {
  switch (diff) {
    case 'Advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'Intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  }
}