
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, Map as MapIcon, Award, ArrowRight, Activity, Users, MapPin, 
  BarChart3, Globe, Zap, Glasses, Sparkles, ShieldCheck, Camera, Compass
} from 'lucide-react';
import { mockDataService } from '../services/mockService';
import { Trail } from '../types';
import { Viewer360 } from '../components/ui/Viewer360';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'geo'>('analytics');
  const [stats, setStats] = useState({
    activeUsers: 1240,
    checkpointsClaimed: 8560,
    distanceWalked: 4320
  });
  
  const [featuredTrails, setFeaturedTrails] = useState<Trail[]>([]);
  const [selectedPanorama, setSelectedPanorama] = useState<Trail | null>(null);

  useEffect(() => {
    mockDataService.getTrails().then(data => {
      setFeaturedTrails(data.slice(0, 4));
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
        checkpointsClaimed: prev.checkpointsClaimed + Math.floor(Math.random() * 3),
        distanceWalked: prev.distanceWalked + Math.floor(Math.random() * 2)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { 
      title: 'AI History Guide', 
      desc: 'Real-time historical narration powered by Gemini AI as you walk.', 
      icon: <Sparkles className="w-6 h-6 text-scot-blue" />,
      color: 'bg-scot-blue/10'
    },
    { 
      title: '360° VR Scouting', 
      desc: 'Preview top trails in immersive VR before you even pack your bags.', 
      icon: <Glasses className="w-6 h-6 text-scot-gold" />,
      color: 'bg-scot-gold/10'
    },
    { 
      title: 'Partner Rewards', 
      desc: 'Unlock exclusive discounts at local Scottish pubs and heritage sites.', 
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      color: 'bg-green-500/10'
    },
    { 
      title: 'Live Social Pulse', 
      desc: 'See trending spots and active explorers in real-time on our map.', 
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-scot-dark transition-colors duration-300">
      
      {/* --- CINEMATIC HERO SECTION --- */}
      <div className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center animate-pulse-slow scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-50 dark:to-scot-dark z-10" />
        <div className="absolute inset-0 bg-black/20 z-10"></div>

        <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-3 px-5 py-2 mb-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-scot-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-scot-blue"></span>
            </span>
            <span className="text-white font-black text-[10px] tracking-[0.2em] uppercase">Live Interactive Network</span>
          </div>

          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl">
            See the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-scot-gold via-yellow-200 to-scot-gold">Hidden.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-14 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            Merge Scotland's ancient legends with modern Augmented Reality. 
            Discover the stories that stone and mist cannot tell.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group w-full sm:w-auto px-10 py-5 bg-scot-blue hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_20px_50px_rgba(0,94,184,0.4)] hover:shadow-[0_30px_70px_rgba(0,94,184,0.6)] flex items-center justify-center gap-3 hover:-translate-y-1"
            >
              Enter the Hub 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:border-white/40"
            >
              Create Account
            </button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
           <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-white rounded-full"></div>
           </div>
        </div>
      </div>

      {/* --- IMMERSIVE PREVIEWS SECTION --- */}
      <section className="py-32 px-4 bg-white dark:bg-scot-dark overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Virtual Highland Preview</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Experience our most popular trails in 360° immersion before you arrive. Use your mobile gyroscope to look around.</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-scot-blue font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group border-b border-scot-blue pb-2"
            >
              Explore Map <MapPin className="w-4 h-4 group-hover:animate-bounce" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredTrails.map((trail) => (
              <div 
                key={trail.id}
                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl transition-all hover:-translate-y-2 border border-slate-200 dark:border-white/10"
                onClick={() => trail.panoramaUrl && setSelectedPanorama(trail)}
              >
                <img src={trail.imageUrl} alt={trail.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute top-6 right-6">
                   <div className="bg-white/10 backdrop-blur-xl p-3 rounded-full border border-white/20 text-white">
                      <Glasses className="w-5 h-5" />
                   </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 text-scot-gold font-black uppercase text-[9px] tracking-widest mb-2">
                    <Activity className="w-3 h-3" /> {trail.activeVisitors} LIVE EXPLORERS
                  </div>
                  <h3 className="text-white text-2xl font-serif font-bold mb-4">{trail.title}</h3>
                  <button className="w-full py-3 bg-white text-scot-dark rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 group-hover:bg-scot-blue group-hover:text-white transition-colors">
                    Start Scouting <Compass className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-32 bg-slate-100 dark:bg-black/40 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
             <h2 className="font-serif text-4xl font-bold text-slate-900 dark:text-white mb-4">Sophisticated Exploration</h2>
             <p className="text-slate-500 max-w-xl mx-auto">Our technology suite bridges the gap between ancient heritage and modern interaction.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className={`${f.color} w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-slate-900 dark:text-white font-serif text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LIVE STATS CTA --- */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-scot-blue rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-[0_40px_100px_rgba(0,94,184,0.3)]">
           <div className="absolute top-0 right-0 p-10 opacity-10">
              <Globe className="w-64 h-64 text-white" />
           </div>
           
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                 <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Join the Global Pulse</h2>
                 <p className="text-blue-100 text-lg mb-10 leading-relaxed font-light">
                    Join over {stats.activeUsers.toLocaleString()} explorers currently walking the Scottish Highlands. Track your stats, claim rewards, and become a part of the legend.
                 </p>
                 <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-white text-scot-blue px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-transform"
                 >
                    Launch Dashboard
                 </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest block mb-1">Users Live</span>
                    <span className="text-white text-3xl font-black tabular-nums">{stats.activeUsers}</span>
                 </div>
                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest block mb-1">Rewards</span>
                    <span className="text-white text-3xl font-black tabular-nums">{stats.checkpointsClaimed}</span>
                 </div>
                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl col-span-2 text-center">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest block mb-1">Total Distance Explored</span>
                    <span className="text-white text-3xl font-black tabular-nums">{stats.distanceWalked.toLocaleString()} KM</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {selectedPanorama && (
        <Viewer360 
          imageUrl={selectedPanorama.panoramaUrl || ''} 
          title={selectedPanorama.title} 
          onClose={() => setSelectedPanorama(null)} 
        />
      )}
    </div>
  );
};
