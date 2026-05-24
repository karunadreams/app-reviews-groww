import { ArrowRight } from 'lucide-react';
import { clusterData } from '../mockData';

function SentimentBadge({ type }: { type: string }) {
  let colorClass = "";
  if (type === 'Mostly Positive') colorClass = "bg-groww/20 text-groww border border-groww/30";
  if (type === 'Mostly Negative') colorClass = "bg-red-500/20 text-red-400 border border-red-500/30";
  if (type === 'Mixed') colorClass = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colorClass}`}>
      {type}
    </span>
  );
}

export default function ThemeClustering() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Theme Clustering</h1>
        <p className="text-muted">AI-powered categorization of 4,280 reviews into actionable product themes.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {clusterData.map((cluster) => (
          <div key={cluster.id} className="groww-card flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left Side: Meta info */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{cluster.emoji}</div>
                <h2 className="text-xl font-bold">{cluster.name}</h2>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="text-3xl font-black text-white">{cluster.percentage}%</div>
                <div className="text-sm text-muted font-medium">of total reviews<br/>in last 12W</div>
              </div>
              
              <div className="mt-2">
                <SentimentBadge type={cluster.sentiment} />
              </div>
            </div>

            {/* Right Side: Quotes & CTA */}
            <div className="w-full md:w-2/3 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Top Verbatim Quotes</h3>
                <div className="space-y-3">
                  {cluster.quotes.map((quote, idx) => (
                    <div key={idx} className="p-4 bg-background/50 border-l-2 border-groww rounded-r-xl italic text-text/90 text-sm">
                      "{quote}"
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 self-start">
                <button className="flex items-center gap-2 text-sm font-semibold text-groww hover:text-groww-dark transition-colors">
                  View all {cluster.name} reviews <ArrowRight size={16} />
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
