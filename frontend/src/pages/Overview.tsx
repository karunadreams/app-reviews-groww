import { useOutletContext } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { Users, Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { volumeData, sentimentData, themeFrequencyData, ratingDistribution } from '../mockData';
import DataSourceBadge from '../components/DataSourceBadge';

function KPICard({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle?: string }) {
  return (
    <div className="groww-card flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-muted mb-1">{title}</h3>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <div className="text-xs font-medium mt-2 text-groww">
            {subtitle}
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-groww">
        {icon}
      </div>
    </div>
  );
}

export default function Overview() {
  const { weeks } = useOutletContext<{ weeks: number }>();
  
  // Dynamically slice the data based on selected weeks
  const activeVolumeData = volumeData.slice(-weeks);
  
  // Scale the total reviews purely for visual effect of the filter working
  const totalReviews = Math.floor(4280 * (weeks / 12)).toLocaleString();

  return (
    <div className="flex flex-col gap-6 pb-8">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Reviews" value={totalReviews} icon={<Users size={20} />} subtitle="+8% vs last period" />
        <KPICard title="Average Rating" value="3.6 ★" icon={<Star size={20} />} subtitle="-0.1 vs last period" />
        <KPICard title="Positive Sentiment" value="58%" icon={<ThumbsUp size={20} />} subtitle="+2% vs last period" />
        <KPICard title="Negative Sentiment" value="18%" icon={<ThumbsDown size={20} className="text-red-500" />} subtitle="-4% vs last period" />
        <KPICard title="Top Theme" value="Onboarding" icon={<MessageCircle size={20} />} subtitle="28% of all reviews" />
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="groww-card lg:col-span-2 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold mb-6">Review Volume (Last {weeks} Weeks)</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeVolumeData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="week" stroke="#9ba1a6" tick={{ fill: '#9ba1a6', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ba1a6" tick={{ fill: '#9ba1a6', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#13131A', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="AppStore" name="App Store" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="PlayStore" name="Play Store" stroke="#00D09C" strokeWidth={3} dot={{ fill: '#00D09C', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="groww-card flex flex-col h-[400px]">
          <h2 className="text-lg font-bold mb-2">Sentiment Breakdown</h2>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#13131A', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-white">58%</span>
              <span className="text-sm font-medium text-groww">Positive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Horizontal Bar Chart (Themes) */}
        <div className="groww-card flex flex-col h-[350px]">
          <h2 className="text-lg font-bold mb-6">Top 5 Discussed Themes</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={themeFrequencyData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#9ba1a6" tick={{ fill: '#9ba1a6', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#9ba1a6" tick={{ fill: '#9ba1a6', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#13131A', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#00D09C" radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vertical Bar Chart (Ratings) */}
        <div className="groww-card flex flex-col h-[350px]">
          <h2 className="text-lg font-bold mb-6">Rating Distribution</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="rating" stroke="#9ba1a6" tick={{ fill: '#9ba1a6', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ba1a6" tick={{ fill: '#9ba1a6', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#13131A', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rating === '5★' || entry.rating === '4★' ? '#00D09C' : entry.rating === '3★' ? '#eab308' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <DataSourceBadge weeks={weeks} />
    </div>
  );
}
