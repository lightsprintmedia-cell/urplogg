/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Home, 
  FolderOpen, 
  Music, 
  MessageSquare, 
  FileText, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  ExternalLink,
  Newspaper,
  Trophy,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDropzone } from 'react-dropzone';
import ReactPlayer from 'react-player';

// Types
import { View, NewsItem, SportUpdate, StockData, ChatMessage } from './types';
import { sendMessage } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOGO_URL = "https://storage.googleapis.com/m-infra.appspot.com/v0/b/m-infra.appspot.com/o/ta2t6wtxgcxtculyx4cm65%2Flogo.png?alt=media&token=8e9e9e9e-9e9e-9e9e-9e9e-9e9e9e9e9e9e"; // Placeholder for the actual logo if needed, but I'll use the one from the prompt if I can find the URL. Actually I'll use a generic gradient logo for now or the one provided if I can get the URL. The prompt provided an image.

export default function App() {
  const [activeView, setActiveView] = useState<View>('home');
  const [address, setAddress] = useState('');
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com/search?q=');
  const [history, setHistory] = useState<string[]>([]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    let url = address;
    if (!url.startsWith('http')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(address)}`;
    }
    setBrowserUrl(url);
    setActiveView('browser');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a1a] text-white font-sans overflow-hidden">
      {/* Top Left Logo */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 pointer-events-none">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-lg">
          <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white/80">Urplogg</span>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 relative">
        <AnimatePresence mode="wait">
          {activeView === 'home' && <HomeView key="home" setView={setActiveView} />}
          {activeView === 'browser' && <BrowserView key="browser" url={browserUrl} />}
          {activeView === 'files' && <FileView key="files" />}
          {activeView === 'music' && <MusicView key="music" />}
          {activeView === 'chat' && <ChatView key="chat" />}
          {activeView === 'docs' && <DocView key="docs" />}
        </AnimatePresence>
      </main>

      {/* Footer Address Bar & Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#12122b]/90 backdrop-blur-xl border-t border-white/10 p-4 z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveView('home')}
              className={cn(
                "p-2 rounded-full transition-all hover:bg-white/10",
                activeView === 'home' ? "bg-indigo-600 text-white" : "text-gray-400"
              )}
            >
              <Home size={20} />
            </button>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-400 hover:text-white"><ChevronLeft size={20} /></button>
              <button className="p-2 text-gray-400 hover:text-white"><ChevronRight size={20} /></button>
              <button className="p-2 text-gray-400 hover:text-white"><RotateCcw size={18} /></button>
            </div>
          </div>

          {/* Address Bar */}
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Search or enter URL"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-500"
            />
          </form>

          {/* Feature Quick Links */}
          <div className="flex items-center gap-1">
            <NavButton icon={<FolderOpen size={20} />} active={activeView === 'files'} onClick={() => setActiveView('files')} label="Files" />
            <NavButton icon={<Music size={20} />} active={activeView === 'music'} onClick={() => setActiveView('music')} label="Music" />
            <NavButton icon={<MessageSquare size={20} />} active={activeView === 'chat'} onClick={() => setActiveView('chat')} label="AI Chat" />
            <NavButton icon={<FileText size={20} />} active={activeView === 'docs'} onClick={() => setActiveView('docs')} label="Docs" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-white/10 group relative",
        active ? "text-indigo-400" : "text-gray-400"
      )}
    >
      {icon}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// --- View Components ---

function HomeView({ setView }: { setView: (v: View) => void }) {
  const [stocks, setStocks] = useState<StockData[]>([
    { symbol: 'AAPL', price: 182.31, change: +1.2 },
    { symbol: 'TSLA', price: 175.05, change: -2.4 },
    { symbol: 'BTC', price: 62450.00, change: +0.8 },
    { symbol: 'ETH', price: 3450.12, change: +1.5 },
    { symbol: 'NVDA', price: 875.28, change: +3.2 },
  ]);

  const [sports, setSports] = useState([
    { league: "Premier League", team1: "Arsenal", team2: "Liverpool", score: "2 - 1", status: "78'", id: '1' },
    { league: "NBA", team1: "Lakers", team2: "Warriors", score: "112 - 108", status: "Final", id: '2' },
    { league: "NFL", team1: "Chiefs", team2: "Eagles", score: "24 - 21", status: "Q4 2:00", id: '3' },
    { league: "La Liga", team1: "Real Madrid", team2: "Barcelona", score: "0 - 0", status: "22'", id: '4' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(s => ({
        ...s,
        price: s.price + (Math.random() - 0.5) * 10,
        change: s.change + (Math.random() - 0.5) * 0.5
      })));

      setSports(prev => prev.map(s => {
        if (s.status === 'Final') return s;
        if (Math.random() > 0.8) {
          const parts = s.score.split(' - ');
          const team = Math.random() > 0.5 ? 0 : 1;
          parts[team] = (parseInt(parts[team]) + 1).toString();
          return { ...s, score: parts.join(' - ') };
        }
        return s;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const newsIcons = [
    { name: 'TokTok9ja', url: 'https://www.toktok9ja.com', icon: 'https://www.google.com/s2/favicons?domain=toktok9ja.com&sz=64' },
    { name: 'CNN', url: 'https://www.cnn.com', icon: 'https://www.google.com/s2/favicons?domain=cnn.com&sz=64' },
    { name: 'BBC', url: 'https://www.bbc.com', icon: 'https://www.google.com/s2/favicons?domain=bbc.com&sz=64' },
    { name: 'Reuters', url: 'https://www.reuters.com', icon: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=64' },
    { name: 'Legit.ng', url: 'https://www.legit.ng', icon: 'https://www.google.com/s2/favicons?domain=legit.ng&sz=64' },
    { name: 'Facebook', url: 'https://www.facebook.com', icon: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64' },
    { name: 'TikTok', url: 'https://www.tiktok.com', icon: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64' },
    { name: 'Instagram', url: 'https://www.instagram.com', icon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' },
    { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-6xl mx-auto space-y-8 pt-20"
    >
      {/* Live Ticker */}
      <div className="bg-indigo-600/20 border-y border-indigo-500/30 -mx-6 py-2 overflow-hidden whitespace-nowrap relative">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-flex gap-8 items-center"
        >
          {stocks.concat(stocks).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/90">{s.symbol}</span>
              <span className="text-xs text-gray-300">${s.price.toFixed(2)}</span>
              <span className={cn("text-[10px] font-bold", s.change > 0 ? "text-emerald-400" : "text-red-400")}>
                {s.change > 0 ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* News Icons */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Newspaper size={18} />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Quick Access News & Social</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {newsIcons.map((site) => (
            <a 
              key={site.name} 
              href={site.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
            >
              <img src={site.icon} alt={site.name} className="w-8 h-8 rounded-lg group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-white truncate w-full text-center">{site.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Live Updates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Live News Feed */}
        <div className="space-y-4">
          <SectionHeader icon={<Newspaper size={16} />} title="Live News Feed" />
          <div className="space-y-3">
            <NewsCard category="World" title="Global markets react to latest economic data as inflation cools..." source="Reuters" time="2h ago" />
            <NewsCard category="Tech" title="New AI breakthrough promises to revolutionize personal computing..." source="The Verge" time="1h ago" live />
            <NewsCard category="Politics" title="Major policy shift announced ahead of upcoming elections..." source="BBC News" time="30m ago" />
          </div>
        </div>

        {/* Sports Sidebar */}
        <div className="space-y-4">
          <SectionHeader icon={<Trophy size={16} />} title="Live Sports Sidebar" />
          <div className="space-y-3">
            {sports.map(s => (
              <SportCard key={s.id} {...s} />
            ))}
          </div>
        </div>

        {/* Market Watch Widget */}
        <div className="space-y-4">
          <SectionHeader icon={<TrendingUp size={16} />} title="Market Watch Widget" />
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-5 shadow-xl">
            {stocks.slice(0, 4).map((s, i) => (
              <StockItem key={i} {...s} />
            ))}
            <div className="pt-4 border-t border-white/10">
              <button className="w-full py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-600/30 transition-all">View All Markets</button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Trends */}
      <section className="space-y-4">
        <SectionHeader icon={<ImageIcon size={16} />} title="Social Trends & Memes" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SocialCard platform="TikTok" user="@trending_now" content="Check out this amazing new tech hack! 🚀 #tech #urplogg #innovation" image="https://picsum.photos/seed/tiktok/400/600" hashtags={["#tech", "#urplogg"]} />
          <SocialCard platform="Instagram" user="meme_lord" content="When the code finally works on the first try... 😂 #coding #memes" image="https://picsum.photos/seed/insta/400/400" hashtags={["#coding", "#memes"]} />
          <SocialCard platform="Facebook" user="Urplogg Community" content="Join our daily discussion on the future of digital management. #community #future" image="https://picsum.photos/seed/fb/400/300" hashtags={["#community", "#future"]} />
          <SocialCard platform="TikTok" user="@music_vibes" content="New playlist dropped! Listen now in the Music tab. 🎵 #music #vibes" image="https://picsum.photos/seed/tiktok2/400/600" hashtags={["#music", "#vibes"]} />
        </div>
      </section>
    </motion.div>
  );
}

function SocialCard({ platform, user, content, image, hashtags }: any) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex flex-col hover:bg-white/10 transition-all group">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold">
            {user[1].toUpperCase()}
          </div>
          <span className="text-[10px] font-medium text-gray-300">{user}</span>
        </div>
        <span className={cn(
          "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
          platform === 'TikTok' ? "bg-black text-white" : platform === 'Instagram' ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white" : "bg-blue-600 text-white"
        )}>
          {platform}
        </span>
      </div>
      <div className="aspect-[4/5] overflow-hidden relative">
        <img src={image} alt="Social" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[11px] text-gray-300 line-clamp-2">{content}</p>
        <div className="flex flex-wrap gap-1">
          {hashtags?.map((tag: string) => (
            <span key={tag} className="text-[9px] text-indigo-400 font-medium">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <h2 className="text-xs font-semibold uppercase tracking-wider">{title}</h2>
    </div>
  );
}

function NewsCard({ category, title, source, time, live }: any) {
  return (
    <div className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
      <div className="relative flex-shrink-0">
        <img src={`https://picsum.photos/seed/${title}/120/120`} className="w-20 h-20 rounded-xl object-cover" referrerPolicy="no-referrer" />
        {live && (
          <div className="absolute top-1 left-1 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
            <div className="w-1 h-1 bg-white rounded-full" />
            LIVE
          </div>
        )}
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">{category}</span>
          <span className="text-[9px] text-gray-500">{time}</span>
        </div>
        <h3 className="text-xs font-bold leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <span className="text-[10px] text-gray-500 font-medium">{source}</span>
      </div>
    </div>
  );
}

function SportCard({ league, team1, team2, score, status }: any) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-gray-500 font-bold uppercase">{league}</span>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded", status.includes("'") ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400")}>
          {status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-white/10" />
          <span className="text-xs font-medium">{team1}</span>
        </div>
        <span className="text-xl font-bold tracking-widest">{score}</span>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-white/10" />
          <span className="text-xs font-medium">{team2}</span>
        </div>
      </div>
    </div>
  );
}

function StockItem({ symbol, price, change }: any) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <span className="text-sm font-bold">{symbol}</span>
        <span className="text-[10px] text-gray-500">Market Open</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">${price.toLocaleString()}</span>
        <span className={cn("text-[10px]", change > 0 ? "text-emerald-400" : "text-red-400")}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      </div>
    </div>
  );
}

function BrowserView({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [url]);

  const handleLoad = () => {
    setLoading(false);
    setProgress(100);
  };

  const domain = new URL(url).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full bg-white flex flex-col relative"
    >
      {/* Browser Tab UI */}
      <div className="bg-[#12122b] p-2 flex items-center gap-2 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-t-lg border-t border-x border-white/20 min-w-[150px] max-w-[250px]">
          <img src={favicon} alt="favicon" className="w-4 h-4" referrerPolicy="no-referrer" />
          <span className="text-xs font-medium truncate text-gray-200">{domain}</span>
        </div>
        <div className="flex-1" />
      </div>

      {/* Loading Bar */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            exit={{ opacity: 0 }}
            className="absolute top-[41px] left-0 right-0 h-1 bg-indigo-500 z-50 origin-left"
          />
        )}
      </AnimatePresence>

      <iframe 
        src={url} 
        onLoad={handleLoad}
        className="w-full h-full border-none"
        title="Browser"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </motion.div>
  );
}

function FileView() {
  const [files, setFiles] = useState<any[]>([]);
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
      url: URL.createObjectURL(f)
    }))]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 max-w-5xl mx-auto h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="text-indigo-400" />
          Digital Manager
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-all border border-white/10">SD Card</button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">Upload</button>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={cn(
          "flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-10 transition-all",
          isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 bg-white/5"
        )}
      >
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <FolderOpen size={40} className="text-gray-500" />
            </div>
            <div>
              <p className="text-lg font-medium">Drag & drop files here</p>
              <p className="text-sm text-gray-500">or click to browse your device</p>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group relative">
                <div className="aspect-square rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3">
                  {file.type.includes('image') ? (
                    <img src={file.url} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                  ) : file.type.includes('audio') ? (
                    <Music size={32} className="text-indigo-400" />
                  ) : (
                    <FileText size={32} className="text-indigo-400" />
                  )}
                </div>
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MusicView() {
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  const tracks = [
    { id: 1, title: 'Midnight City', artist: 'M83', duration: '4:03', cover: 'https://picsum.photos/seed/music1/200/200' },
    { id: 2, title: 'Starboy', artist: 'The Weeknd', duration: '3:50', cover: 'https://picsum.photos/seed/music2/200/200' },
    { id: 3, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', cover: 'https://picsum.photos/seed/music3/200/200' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 max-w-4xl mx-auto h-full flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center overflow-hidden">
          {currentTrack ? (
            <img src={currentTrack.cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Music size={64} className="text-white/50" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold">{currentTrack?.title || 'Select a track'}</h2>
          <p className="text-gray-400">{currentTrack?.artist || 'Urplogg Music'}</p>
          <div className="pt-4 flex items-center gap-4">
            <button 
              onClick={() => setPlaying(!playing)}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {playing ? <div className="w-4 h-4 bg-black rounded-sm" /> : <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-black ml-1" />}
            </button>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-indigo-500" />
            </div>
            <span className="text-xs text-gray-500">1:24 / {currentTrack?.duration || '0:00'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Your Library</h3>
        {tracks.map(track => (
          <div 
            key={track.id}
            onClick={() => setCurrentTrack(track)}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group",
              currentTrack?.id === track.id ? "bg-indigo-600/20 border border-indigo-500/30" : "bg-white/5 border border-transparent hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-4">
              <img src={track.cover} className="w-10 h-10 rounded-lg" referrerPolicy="no-referrer" />
              <div>
                <p className="text-sm font-medium">{track.title}</p>
                <p className="text-xs text-gray-500">{track.artist}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">{track.duration}</span>
          </div>
        ))}
      </div>
      
      {currentTrack && (
        <div className="hidden">
          {ReactPlayer && (
            <ReactPlayer 
              {...({
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                playing: playing,
                onEnded: () => setPlaying(false)
              } as any)}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}

function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm Urplogg AI. How can I help you today? You can switch between different AI models using the selector below.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Gemini');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const models = ['Gemini', 'Claude', 'ChatGPT', 'Groq'];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(input, messages, selectedModel.toLowerCase());
      setMessages(prev => [...prev, { role: 'model', content: response, timestamp: Date.now() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Error connecting to AI service.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-full flex flex-col p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="text-indigo-400" />
          AI Assistant
        </h2>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {models.map(m => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedModel === m ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Message ${selectedModel}...`}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Search size={20} className="rotate-90" />
        </button>
      </div>
    </motion.div>
  );
}

function DocView() {
  const [docs, setDocs] = useState<any[]>([
    { name: 'User_Manual.pdf', size: '1.2 MB', type: 'pdf' },
    { name: 'Project_Proposal.docx', size: '450 KB', type: 'word' },
    { name: 'Financial_Report_Q4.pdf', size: '2.8 MB', type: 'pdf' },
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-5xl mx-auto h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-indigo-400" />
          Document Viewer
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Documents</h3>
          {docs.map((doc, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", doc.type === 'pdf' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400")}>
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-[10px] text-gray-500">{doc.size}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-2 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-10 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
            <FileText size={40} className="text-gray-600" />
          </div>
          <div>
            <p className="text-lg font-medium">No document selected</p>
            <p className="text-sm text-gray-500">Select a document from the list or upload a new one to view it here.</p>
          </div>
          <button className="px-6 py-2 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">Open File</button>
        </div>
      </div>
    </motion.div>
  );
}
