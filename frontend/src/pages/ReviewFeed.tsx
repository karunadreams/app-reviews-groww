import { useState } from 'react';
import { Star, Smartphone, Filter } from 'lucide-react';
import { reviewsData } from '../mockData';

function SentimentBadge({ type }: { type: string }) {
  let colorClass = "";
  if (type === 'Positive') colorClass = "bg-groww/20 text-groww border border-groww/30";
  if (type === 'Negative') colorClass = "bg-red-500/20 text-red-400 border border-red-500/30";
  if (type === 'Neutral') colorClass = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
      {type}
    </span>
  );
}

export default function ReviewFeed() {
  const [themeFilter, setThemeFilter] = useState('All Themes');
  const [sentimentFilter, setSentimentFilter] = useState('All Sentiments');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');

  const filteredReviews = reviewsData.filter(r => {
    const themeMatch = themeFilter === 'All Themes' || r.theme === themeFilter;
    const sentimentMatch = sentimentFilter === 'All Sentiments' || r.sentiment === sentimentFilter;
    const ratingMatch = ratingFilter === 'All Ratings' || r.rating.toString() === ratingFilter;
    return themeMatch && sentimentMatch && ratingMatch;
  });

  // Extract unique values for dropdowns
  const themes = ['All Themes', ...Array.from(new Set(reviewsData.map(r => r.theme)))];
  const sentiments = ['All Sentiments', 'Positive', 'Neutral', 'Negative'];
  const ratings = ['All Ratings', '5', '4', '3', '2', '1'];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold mb-2">Review Feed</h1>
        <p className="text-muted">Browse and filter individual user reviews.</p>
      </div>

      {/* Filters Bar */}
      <div className="groww-card py-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20">
        
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2 text-muted text-sm font-medium">
            <Filter size={16} /> Filters:
          </div>
          
          <select 
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className="flex shrink-0 items-center gap-2 bg-background border border-white/10 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors outline-none cursor-pointer"
          >
            {themes.map(t => <option key={t} value={t} className="bg-card">{t}</option>)}
          </select>

          <select 
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="flex shrink-0 items-center gap-2 bg-background border border-white/10 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors outline-none cursor-pointer"
          >
            {sentiments.map(s => <option key={s} value={s} className="bg-card">{s}</option>)}
          </select>

          <select 
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="flex shrink-0 items-center gap-2 bg-background border border-white/10 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors outline-none cursor-pointer"
          >
            {ratings.map(r => <option key={r} value={r} className="bg-card">{r === 'All Ratings' ? r : `${r} Stars`}</option>)}
          </select>
        </div>
        
        <div className="text-sm font-medium text-muted">
          Showing {filteredReviews.length} reviews
        </div>
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 gap-4 mt-2">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-muted border border-white/10 rounded-xl bg-card/30 border-dashed">
            No reviews match your selected filters.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="groww-card hover:-translate-y-0 p-5 flex flex-col gap-3">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex gap-0.5 text-groww">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} color={i < review.rating ? "currentColor" : "#ffffff20"} />
                    ))}
                  </div>
                  <div className="text-xs text-muted font-medium flex items-center gap-1">
                    <Smartphone size={12} /> {review.platform}
                  </div>
                </div>
                <div className="text-xs text-muted">{review.date}</div>
              </div>
              
              <p className="text-text/90 text-sm leading-relaxed">
                "{review.text}"
              </p>
              
              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/5">
                <SentimentBadge type={review.sentiment} />
                <span className="px-2 py-0.5 rounded-full bg-card text-[10px] font-bold uppercase tracking-wider text-muted border border-white/10">
                  {review.theme}
                </span>
              </div>
              
            </div>
          ))
        )}
      </div>

    </div>
  );
}
