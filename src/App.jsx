import React, { useRef, useState, useEffect } from 'react';
import { Camera, Plus, MousePointer2, RefreshCw, AlertTriangle } from 'lucide-react';

function AnimatedGauge({ value, color, bg, icon, label }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = display;
    let end = value;
    if (start === end) return;
    let raf;
    const step = () => {
      start += (end - start) * 0.15;
      if (Math.abs(end - start) < 1) start = end;
      setDisplay(Math.round(start));
      if (start !== end) raf = requestAnimationFrame(step);
    };
    step();
    return () => raf && cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [value]);
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div className={`flex-1 ${bg} border rounded-2xl p-6 flex flex-col items-center`}>
      <span className="text-sm mb-4">{label}</span>
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={r} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800/50" />
          <circle cx="48" cy="48" r={r} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={c} strokeDashoffset={c * (1 - display / 100)} className={color + " drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"} style={{ transition: 'stroke-dashoffset 0.7s' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{ color }}>{display}%</span>
      </div>
      <span className="text-xs mb-4">Risk Score: {display}%</span>
      <button className={`w-full ${color === 'text-green-400' ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-red-500/80 hover:bg-red-500'} rounded-full py-2 flex justify-center shadow-lg transition-colors`}>
        {icon}
      </button>
    </div>
  );
}

function SecurityDashboard() {
  const [scanAnim, setScanAnim] = useState(0);
  // ...existing code...
  const [url, setUrl] = useState("");
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => setScanAnim(a => (a + 1) % 100), 16);
    return () => clearInterval(interval);
  }, []);
  const scanBarStyle = {
    left: `${scanAnim}%`,
    width: '40%',
    opacity: 0.8,
    transition: 'left 0.2s',
  };

  // Handle file drop
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(",")[1];
        setImageData(base64);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(",")[1];
        setImageData(base64);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:5001/phishshield-2025/us-central1/analyzePhishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: url || undefined,
          imageData: imageData || undefined,
        }),
      });
      const data = await res.json();
      console.log('Backend result:', data);
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to analyze. " + err.message });
    }
    setLoading(false);
  };

  const handleClear = () => {
    setUrl("");
    setImageData(null);
    setResult(null);
  };

  // ...existing code...
  return (
        <div className="min-h-screen bg-[#050a14] text-white p-8 font-sans cyberpunk-grid-bg">

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <h1 className="text-5xl font-bold mb-12 tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
          Security Dashboard
        </h1>

        {/* Drop Zone with file input and drag-and-drop */}
        <div
          className="w-full max-w-2xl border-2 border-blue-500/30 bg-blue-900/10 rounded-3xl p-12 mb-12 flex flex-col items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.1)]"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h2 className="text-xl font-medium mb-6">Drop Zone</h2>
          <div className="relative mb-6 cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <div className="p-6 border-4 border-cyan-400 rounded-[2.5rem] shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Camera size={80} className="text-cyan-400" strokeWidth={1.5} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 border-2 border-cyan-400 rounded-full p-1 shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                <Plus size={24} className="text-cyan-400" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {imageData && (
              <img
                src={`data:image/png;base64,${imageData}`}
                alt="Screenshot Preview"
                className="mt-4 rounded-lg max-h-40 border border-cyan-400 shadow"
              />
            )}
          </div>
          <p className="text-gray-300 text-lg">Drag & Drop Screenshots Here or Click to Upload</p>
        </div>

        {/* Scanning Section - only show when loading */}
        {loading && (
          <div className="flex flex-col items-center mb-16 w-full max-w-xl">
            <h3 className="text-2xl font-light mb-4 tracking-widest italic">Scanning...</h3>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] relative">
              <div className="absolute h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-full animate-none" style={scanBarStyle}></div>
            </div>
          </div>
        )}

        {/* Bottom Panel */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full" onSubmit={handleSubmit}>
          {/* URL Input Box */}
          <div className="bg-[#111c30] border border-gray-700 rounded-xl p-6 flex flex-col justify-center">
            <label className="text-green-400 mb-3 block text-lg">Enter URL:</label>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="https://www.example.com"
                className="w-full bg-[#0d1424] border border-gray-600 rounded-md py-3 px-4 text-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                value={url}
                onChange={e => setUrl(e.target.value)}
                disabled={loading}
              />
              <MousePointer2 className="absolute right-3 top-3 text-gray-400 rotate-[-20deg]" size={20} />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full py-2 px-6 font-semibold shadow-lg hover:from-cyan-500 hover:to-blue-600 transition-colors disabled:opacity-50"
              disabled={loading || (!url && !imageData)}
            >
              {loading ? "Analyzing..." : "Submit"}
            </button>
            <button
              type="button"
              className="mt-2 text-xs text-gray-400 underline hover:text-cyan-400"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>

          {/* Risk Gauges and Result */}
          <div className="flex flex-col gap-4">
            {/* Show only the safe message if result is safe */}
            {result && !result.error && (result.risk_score === 0 || result.verdict === 'Safe') && (
              <div className="bg-[#181f2e] border border-gray-700 rounded-xl p-4 mb-2">
                <div className="text-green-400 font-semibold">This site or screenshot appears safe. No phishing or scam indicators detected.</div>
              </div>
            )}
            {/* Show verdict, explanation, red flags, and gauges only if result is not safe */}
            {result && !result.error && !(result.risk_score === 0 || result.verdict === 'Safe') && (
              <>
                <div className="bg-[#181f2e] border border-gray-700 rounded-xl p-4 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold ${result.verdict === 'Danger' ? 'text-red-400' : result.verdict === 'Caution' ? 'text-yellow-400' : 'text-green-400'}`}>{result.verdict}</span>
                    <span className="text-xs text-gray-400">({result.scam_category})</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{result.explanation_en}</div>
                  <div className="text-xs text-gray-400 mb-2">Red Flags: {result.red_flags?.join(', ')}</div>
                </div>
                <div className="flex gap-4">
                  <AnimatedGauge
                    value={typeof result.risk_score === 'number' ? result.risk_score : 0}
                    color={result.risk_score >= 70 ? "text-red-500" : "text-green-400"}
                    bg={result.risk_score >= 70 ? "bg-red-900/30 border-red-500/30" : "bg-green-900/30 border-green-500/30"}
                    icon={<RefreshCw size={20} className="text-white" />}
                    label="Risk Gauge"
                  />
                  <AnimatedGauge
                    value={typeof result.risk_score === 'number' ? result.risk_score : 0}
                    color={result.risk_score >= 70 ? "text-red-500" : "text-green-400"}
                    bg={result.risk_score >= 70 ? "bg-red-900/30 border-red-500/30" : "bg-green-900/30 border-green-500/30"}
                    icon={<AlertTriangle size={20} className="text-white" />}
                    label="Risk Gauge"
                  />
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SecurityDashboard;