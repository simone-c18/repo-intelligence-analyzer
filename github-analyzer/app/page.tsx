"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Error analyzing repo");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Repo Intelligence Analyzer</h1>
        
        <div className="flex gap-4">
          <input 
            className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 outline-none focus:border-blue-500"
            placeholder="Paste GitHub URL (e.g. facebook/react)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-bold transition"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-2">{result.name}</h2>
            <p className="text-gray-400 mb-6">{result.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900 rounded">
                <p className="text-sm text-gray-500 uppercase">Activity Score</p>
                <p className="text-2xl font-mono text-green-400">{result.activityScore}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded">
                <p className="text-sm text-gray-500 uppercase">Difficulty</p>
                <p className={`text-2xl font-bold ${result.difficulty === 'Advanced' ? 'text-red-400' : 'text-blue-400'}`}>
                  {result.difficulty}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}