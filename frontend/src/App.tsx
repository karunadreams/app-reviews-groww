import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import ThemeClustering from './pages/ThemeClustering';
import ReviewFeed from './pages/ReviewFeed';
import WeeklyPulse from './pages/WeeklyPulse';
import Subscribe from './pages/Subscribe';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="clusters" element={<ThemeClustering />} />
          <Route path="feed" element={<ReviewFeed />} />
          <Route path="pulse" element={<WeeklyPulse />} />
          <Route path="subscribe" element={<Subscribe />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
