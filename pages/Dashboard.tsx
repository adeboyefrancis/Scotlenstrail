
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockService';
import { searchNearbyPlaces } from '../services/geminiService';
import { Trail, TrailCategory } from '../types';
import { 
  MapPin, Clock, Gauge, ChevronRight, LayoutGrid, Map as MapIcon, 
  Search as SearchIcon, Glasses, Lock, Sparkles, Filter, Activity, TrendingUp, Users, Info, Zap, 
  Navigation, ExternalLink, Loader2, MousePointer2, Compass, X
} from 'lucide-react';
import { Viewer360 } from '../components/ui/Viewer360';
import { TrailDetailsModal } from '../components/ui/TrailDetailsModal';
import { stripeService } from '../services/stripeService';
import { useToast } from '../components/ui/Layout';
import L from 'leaflet';

export const Dashboard: React.FC = () => {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TrailCategory | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  
  const [selectedTrailFor360, setSelectedTrailFor360] = useState<Trail | null>(null);
  const [selectedTrailForDetails, setSelectedTrailForDetails] = useState<Trail | null>(null);

  const { showToast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const navigate = useNavigate();

  // AI Discovery State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<{text: string, links: any[]} | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trailsData = await mockDataService.getTrails();
        setTrails(trailsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredTrails = trails.filter(trail => {
    const matchesSearch = trail.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trail.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trail.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || trail.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiResults(null);
    const center = mapInstance.current?.getCenter() || { lat: 56.4907, lng: -4.2026 };
    const results = await searchNearbyPlaces(searchQuery, center.lat, center.lng);
    setAiResults(results);
    setAiLoading(false);
    showToast("AI Scan Complete", "success");
  };

  const resetMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([56.4907, -4.2026], 7);
      showToast("Perspective Reset", "info");
    }
  };

  const locateUser = () => {
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapInstance.current?.setView([pos.coords.latitude, pos.coords.longitude], 12);
        showToast("Location Synchronized", "success");
      }, () => {
        showToast("Geolocation Denied", "error");
      });
    }
  };

  useEffect(() => {
    if (viewMode === 'map' && !loading && mapContainerRef.current && !mapInstance.current) {
      setTimeout(() => {
        if (!mapContainerRef.current) return;
        
        mapInstance.current = L.map(mapContainerRef.current, {
          center: [56.4907, -4.2026],
          zoom: 7,
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(mapInstance.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
        updateMarkers();
      }, 100);
    } else if (viewMode === 'map' && mapInstance.current) {
      updateMarkers();
    }
  }, [viewMode, loading]);

  const updateMarkers = () => {
    if (!mapInstance.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    const bounds = L.latLngBounds([]);

    filteredTrails.forEach(trail => {
      const pos: [number, number] = [trail.location.lat, trail.location.lng];
      const isTrending = trail.popularityScore > 90;
      const icon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div class="relative group cursor-pointer transition-all duration-300 transform hover:scale-125">
            <div class="absolute -inset-2 bg-${isTrending ? 'sc-gold' : 'sc-blue'}/20 rounded-full animate-ping"></div>
            <div class="w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-2xl overflow-hidden relative" 
                 style="background: ${isTrending ? 'linear-gradient(135deg, #c5a059, #eab308)' : 'linear-gradient(135deg, #005EB8, #3b82f6)'};">
               <img src="${trail.imageUrl}" class="w-full h-full object-cover opacity-60 absolute inset-0" />
               <div class="relative z-10">
                 ${isTrending ? '<span class="text-[8px] font-black text-white">★</span>' : '<div class="w-2 h-2 rounded-full bg-white"></div>'}
               </div>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r-4 border-b-4 border-white" 
                 style="background: ${isTrending ? '#eab308' : '#3b82f6'};"></div>
          </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 45]
      });

      const marker = L.marker(pos, { icon }).addTo(mapInstance.current!);
      marker.bindTooltip(`<div class="px-2 py-1 font-black text-[10px] uppercase tracking-widest text-white">${trail.title}</div>`, { 
        permanent: false, direction: 'top', className: 'custom-map-tooltip', offset: [0, -45] 
      });
      marker.on('click', () => setSelectedTrailForDetails(trail));
      markersRef.current.push(marker);
      bounds.extend(pos);
    });

    if (filteredTrails.length > 0 && mapInstance.current) {
      mapInstance.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 });
    }
  };

  const trendingTrails = [...trails].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 3);
  const categories = ['All', ...Object.values(TrailCategory)];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="bg-scot-blue/10 border border-scot-blue/20 px-3 py-1 rounded-lg flex items-center gap-2">
                 <Zap className="w-3 h-3 text-scot-blue animate-pulse" />
                 <span className="text-scot-blue font-black text-[9px] uppercase tracking-widest">Live Map Sync</span>
              </div>
              <span className="text-slate-500 font-black text-[9px] uppercase tracking-widest">{filteredTrails.length} Active Layers</span>
           </div>
           <h1 className="font-serif text-4xl font-bold text-white leading-tight">Interactive <span className="text-scot-blue">Geospatial</span> Hub</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative group flex-grow lg:flex-grow-0 flex gap-2">
             <div className="relative flex-grow">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search coordinates..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                  className="w-full lg:w-80 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-scot-blue transition-all"
                />
             </div>
             <button onClick={handleAiSearch} disabled={aiLoading} className="px-4 py-3 bg-scot-blue rounded-2xl text-white hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg">
                {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
             </button>
          </div>
          <div className="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-2xl">
             <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-scot-blue text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
               <LayoutGrid className="w-4 h-4" /> Grid
             </button>
             <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-scot-blue text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
               <MapIcon className="w-4 h-4" /> Map
             </button>
          </div>
        </div>
      </div>

      {/* Fix: Added missing X icon to the discovery results close button */}
      {aiResults && (
        <div className="mb-8 p-6 bg-white/10 border border-scot-blue/30 rounded-[2rem] backdrop-blur-2xl animate-in slide-in-from-top-4 relative shadow-2xl">
          <button onClick={() => setAiResults(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="p-5 bg-scot-blue/20 rounded-[1.5rem] text-scot-blue flex-shrink-0"><Sparkles className="w-8 h-8" /></div>
            <div>
               <h4 className="text-white font-bold text-xl mb-3">AI Discovery Insights</h4>
               <p className="text-slate-300 text-base leading-relaxed mb-6">{aiResults.text}</p>
               <div className="flex flex-wrap gap-3">
                  {aiResults.links.map((link: any, idx: number) => link.maps && (
                    <a key={idx} href={link.maps.uri} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-xl text-xs text-white hover:bg-scot-blue transition-all border border-white/10 shadow-lg">
                       <ExternalLink className="w-4 h-4" /> {link.maps.title}
                    </a>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-white font-serif text-xl font-bold mb-8 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-scot-blue" /> Live Popularity</h3>
              <div className="space-y-6">
                 {trendingTrails.map((trail, idx) => (
                    <div key={trail.id} className="group cursor-pointer" onClick={() => setSelectedTrailForDetails(trail)}>
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">#{idx + 1} {trail.title}</span>
                          <span className="text-scot-blue font-mono font-bold text-xs">{trail.popularityScore}%</span>
                       </div>
                       <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-scot-blue rounded-full transition-all duration-1000" style={{ width: `${trail.popularityScore}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Layer Filtering</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-scot-blue border-scot-blue text-white shadow-lg' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredTrails.map((trail) => (
                <div key={trail.id} className="group bg-scot-dark border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-scot-blue/50 transition-all duration-500 flex flex-col h-full cursor-pointer hover:shadow-2xl" onClick={() => setSelectedTrailForDetails(trail)}>
                  <div className="relative h-64 overflow-hidden bg-slate-800">
                    <img src={trail.imageUrl} alt={trail.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-scot-dark via-transparent to-transparent"></div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <h3 className="font-serif text-2xl font-bold text-white mb-3 group-hover:text-scot-blue transition-colors">{trail.title}</h3>
                    <div className="grid grid-cols-3 gap-6 py-6 border-y border-white/5 mb-8">
                      <div className="flex flex-col gap-1"><span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Time</span><div className="flex items-center gap-1.5 text-white font-bold"><Clock className="w-4 h-4 text-scot-blue" /> {trail.durationMinutes}m</div></div>
                      <div className="flex flex-col gap-1 border-x border-white/5 px-4"><span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Dist.</span><div className="flex items-center gap-1.5 text-white font-bold"><MapPin className="w-4 h-4 text-scot-blue" /> {trail.distanceKm}k</div></div>
                      <div className="flex flex-col gap-1 pl-4"><span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Skill</span><div className="flex items-center gap-1.5 text-white font-bold"><Gauge className="w-4 h-4 text-scot-blue" /> {trail.difficulty}</div></div>
                    </div>
                    <div className="flex items-center justify-between"><div className="text-lg font-black text-white">{trail.price === 0 ? 'FREE' : stripeService.formatCurrency(trail.price, trail.currency)}</div><ChevronRight className="w-5 h-5 text-scot-blue" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-full h-[85vh] bg-[#f8f9fa] rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl z-0">
               <div ref={mapContainerRef} className="w-full h-full" />
               <div className="absolute bottom-10 left-10 bg-black/70 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 max-w-xs pointer-events-none z-[1000] shadow-2xl">
                  <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><MapIcon className="w-3.5 h-3.5 text-scot-blue" /> Map Intel</h4>
                  <div className="space-y-4">
                     <div className="flex items-center gap-4"><div className="w-4 h-4 rounded-lg bg-scot-blue shadow-lg border border-white/40"></div><span className="text-[9px] text-slate-200 font-black uppercase tracking-widest">Active Trail</span></div>
                     <div className="flex items-center gap-4"><div className="w-4 h-4 rounded-lg bg-scot-gold shadow-lg border border-white/40"></div><span className="text-[9px] text-slate-200 font-black uppercase tracking-widest">Trending Hub</span></div>
                  </div>
               </div>
               <div className="absolute top-6 right-6 flex flex-col gap-4 z-[1000]">
                  <div className="bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
                     <button onClick={locateUser} className="p-3 text-white hover:bg-scot-blue rounded-xl transition-all" title="Locate Me"><Navigation className="w-5 h-5" /></button>
                     <button onClick={resetMap} className="p-3 text-white hover:bg-scot-blue rounded-xl transition-all" title="Compass Reset"><Compass className="w-5 h-5" /></button>
                     <button onClick={() => showToast("Layer info sync in progress", "info")} className="p-3 text-white hover:bg-scot-blue rounded-xl transition-all" title="Layer Info"><Info className="w-5 h-5" /></button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {selectedTrailFor360 && selectedTrailFor360.panoramaUrl && (
        <Viewer360 imageUrl={selectedTrailFor360.panoramaUrl} title={selectedTrailFor360.title} onClose={() => setSelectedTrailFor360(null)} />
      )}

      {selectedTrailForDetails && (
        <TrailDetailsModal
          trail={selectedTrailForDetails}
          onClose={() => setSelectedTrailForDetails(null)}
          onStartVr={() => {
             setSelectedTrailForDetails(null);
             if (selectedTrailForDetails.panoramaUrl) setSelectedTrailFor360(selectedTrailForDetails);
          }}
        />
      )}
    </div>
  );
};
