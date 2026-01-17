
import React, { useState, useEffect } from 'react';
import { Trail, Accommodation } from '../../types';
import { mockDataService } from '../../services/mockService';
import { 
  X, Clock, MapPin, Gauge, Play, Glasses, Bed, Navigation,
  Lock, Sparkles, Building2, Loader2, Home, Caravan, MapIcon, Info, Search, Star,
  ShieldCheck, Bus, Car, ChevronRight, Activity, Zap, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from './PaymentModal';
import { stripeService } from '../../services/stripeService';

interface TrailDetailsModalProps {
  trail: Trail;
  onClose: () => void;
  onStartVr: () => void;
}

export const TrailDetailsModal: React.FC<TrailDetailsModalProps> = ({ trail, onClose, onStartVr }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'stay' | 'transport'>('overview');
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loadingAcc, setLoadingAcc] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  
  const [accFilter, setAccFilter] = useState<'All' | 'Airbnb' | 'Caravan' | 'Mobile Home' | 'Hotel'>('All');
  const [accSearchQuery, setAccSearchQuery] = useState('');
  const [selectedItemForPayment, setSelectedItemForPayment] = useState<{item: Trail | Accommodation, type: 'trail' | 'accommodation'} | null>(null);
  
  const [selectedTransport, setSelectedTransport] = useState<'uber' | 'transit' | 'drive'>('uber');
  const [routeDistance] = useState(12.5);
  
  // Simulated Live Transport Data
  const [liveTransport, setLiveTransport] = useState<any>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const owned = await mockDataService.isTrailPurchased(trail.id);
      setIsPurchased(owned);
    };
    checkStatus();
  }, [trail.id]);

  useEffect(() => {
    if (activeTab === 'stay' && accommodations.length === 0) {
      setLoadingAcc(true);
      mockDataService.getAccommodationsByTrailId(trail.id).then(data => {
        setAccommodations(data);
        setLoadingAcc(false);
      });
    }
  }, [activeTab, trail.id, accommodations.length]);

  // Simulate Live Fetching for Transport
  useEffect(() => {
    if (activeTab === 'transport') {
      setIsLiveLoading(true);
      
      const timer = setTimeout(() => {
        const trafficFactor = 0.85 + Math.random() * 0.6; // 0.85 to 1.45
        const demandFactor = 0.9 + Math.random() * 0.5;  // 0.9 to 1.4
        
        setLiveTransport({
          uber: { 
            mode: 'UberX', 
            price: (routeDistance * 2.5 * demandFactor).toFixed(2), 
            time: Math.round(routeDistance * 2.5 * trafficFactor), 
            co2: 'High', 
            icon: <Car className="w-5 h-5" />,
            status: demandFactor > 1.25 ? 'High Demand' : 'Standard Rates',
            statusColor: demandFactor > 1.25 ? 'text-scot-gold' : 'text-slate-500'
          },
          transit: { 
            mode: 'Bus (Lothian)', 
            price: '4.50', 
            time: Math.round(routeDistance * 4.5 * (trafficFactor * 0.9)), 
            co2: 'Low', 
            icon: <Bus className="w-5 h-5" />,
            status: trafficFactor > 1.3 ? 'Minor Delays' : 'On Time',
            statusColor: trafficFactor > 1.3 ? 'text-red-400' : 'text-green-400'
          },
          drive: { 
            mode: 'Self Drive', 
            price: (routeDistance * 0.4).toFixed(2), 
            time: Math.round(routeDistance * 2.2 * trafficFactor), 
            co2: 'Med', 
            icon: <Navigation className="w-5 h-5" />,
            status: trafficFactor > 1.2 ? 'Heavy Traffic' : 'Moderate Flow',
            statusColor: trafficFactor > 1.2 ? 'text-scot-gold' : 'text-slate-500'
          }
        });
        setIsLiveLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [activeTab, routeDistance]);

  const filteredAcc = accommodations.filter(acc => {
    const matchesType = accFilter === 'All' || acc.type === accFilter;
    const matchesSearch = acc.name.toLowerCase().includes(accSearchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handlePurchaseSuccess = async () => {
    if (selectedItemForPayment?.type === 'trail') {
      await mockDataService.purchaseTrail(trail.id);
      setIsPurchased(true);
    } else if (selectedItemForPayment?.type === 'accommodation') {
      await mockDataService.createBooking(selectedItemForPayment.item as Accommodation);
    }
    setSelectedItemForPayment(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      
      {selectedItemForPayment && (
        <PaymentModal 
          item={selectedItemForPayment.item} 
          type={selectedItemForPayment.type}
          onClose={() => setSelectedItemForPayment(null)} 
          onSuccess={handlePurchaseSuccess}
        />
      )}

      <div className="bg-scot-dark border border-white/10 w-full max-w-6xl h-[90vh] rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col relative scale-in-center">
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-50 bg-black/60 backdrop-blur-md p-3 rounded-full text-white border border-white/10 hover:bg-black/80 transition-all hover:scale-110 active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>

        {/* HERO SECTION */}
        <div className="h-72 md:h-96 relative flex-shrink-0">
             <img src={trail.imageUrl} alt={trail.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-scot-dark via-scot-dark/20 to-transparent"></div>
             <div className="absolute bottom-10 left-12 right-12">
                <div className="flex flex-wrap gap-2.5 mb-6">
                   <span className="text-[10px] uppercase font-black px-4 py-1.5 bg-white/20 text-white rounded-xl shadow-xl backdrop-blur-md tracking-[0.2em] border border-white/10">
                      {trail.category}
                   </span>
                   {trail.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-black px-4 py-1.5 bg-scot-blue text-white rounded-xl shadow-xl backdrop-blur-md tracking-[0.2em]">{tag}</span>
                   ))}
                   {!isPurchased && trail.price > 0 && (
                      <span className="text-[10px] uppercase font-black px-4 py-1.5 bg-scot-gold text-black rounded-xl shadow-xl flex items-center gap-2 tracking-[0.2em]">
                         <Lock className="w-3 h-3" /> Exclusive Access
                      </span>
                   )}
                </div>
                <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-2xl">{trail.title}</h2>
                <div className="flex items-center gap-8 text-slate-300 text-sm font-bold tracking-wide">
                  <span className="flex items-center gap-2.5"><MapPin className="w-5 h-5 text-scot-blue" /> {trail.distanceKm} km</span>
                  <span className="flex items-center gap-2.5"><Clock className="w-5 h-5 text-scot-blue" /> {trail.durationMinutes} min</span>
                  <span className="flex items-center gap-2.5"><Gauge className="w-5 h-5 text-scot-blue" /> {trail.difficulty}</span>
                </div>
             </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex border-b border-white/5 bg-white/5 px-8 overflow-x-auto scrollbar-hide">
          {(['overview', 'gallery', 'stay', 'transport'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`min-w-[140px] py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === tab ? 'border-scot-blue text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
              {tab === 'stay' && <Bed className="w-4 h-4" />}
              {tab === 'transport' && <Navigation className="w-4 h-4" />}
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-grow overflow-y-auto bg-slate-900/30 custom-scrollbar">
          
          {activeTab === 'overview' && (
            <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-16 animate-in slide-in-from-bottom-4 duration-500">
               <div className="md:col-span-2 space-y-12">
                 <div>
                   <h3 className="text-white font-serif text-3xl font-bold mb-6 flex items-center gap-3">
                     <Info className="w-8 h-8 text-scot-blue" /> Trail History
                   </h3>
                   <p className="text-slate-400 text-xl leading-relaxed font-light">{trail.description}</p>
                 </div>
                 
                 <div>
                    <h3 className="text-white font-serif text-3xl font-bold mb-8 flex items-center gap-3">
                       <MapIcon className="w-8 h-8 text-scot-blue" /> Waypoints
                    </h3>
                    <div className={`space-y-6 relative ${!isPurchased ? 'blur-2xl select-none' : ''}`}>
                      {trail.checkpoints.map((cp, idx) => (
                          <div key={cp.id} className="flex items-start gap-8 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 group hover:bg-white/10 transition-all hover:border-scot-blue/30">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-scot-blue/20 text-scot-blue flex items-center justify-center text-xl font-black mt-1 group-hover:bg-scot-blue group-hover:text-white transition-all">{idx + 1}</div>
                            <div>
                                <h5 className="text-white text-xl font-bold mb-2">{cp.name}</h5>
                                <p className="text-slate-500 text-sm leading-relaxed">{cp.description}</p>
                            </div>
                          </div>
                      ))}
                      {!isPurchased && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                           <div className="bg-scot-dark/80 backdrop-blur-2xl px-12 py-10 rounded-[3rem] border border-white/10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                              <Lock className="w-12 h-12 text-scot-gold mx-auto mb-6" />
                              <p className="text-white text-sm font-black uppercase tracking-widest mb-3">Expedition Locked</p>
                              <p className="text-xs text-slate-400 leading-relaxed">Secure access via Stripe (GBP) to view all interactive trail waypoints.</p>
                           </div>
                        </div>
                      )}
                    </div>
                 </div>
               </div>

               <div className="md:col-span-1">
                  <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 sticky top-10 shadow-2xl">
                     <h3 className="text-white font-serif text-2xl font-bold mb-8">{isPurchased ? 'Access Granted' : 'Purchase Pass'}</h3>
                     <div className="space-y-6">
                        {isPurchased ? (
                          <>
                            <button onClick={() => navigate(`/trail/${trail.id}`)} className="w-full bg-scot-blue hover:bg-blue-600 text-white py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-scot-blue/30 flex items-center justify-center gap-3">
                              <Play className="w-5 h-5 fill-current" /> Start AR View
                            </button>
                            {trail.panoramaUrl && (
                              <button onClick={onStartVr} className="w-full bg-white/5 hover:bg-white/10 text-white py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10">
                                <Glasses className="w-5 h-5" /> Immersion Mode
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="space-y-8">
                             <div className="p-8 bg-scot-gold/5 border border-scot-gold/20 rounded-[2rem] text-center">
                                <span className="text-[10px] text-scot-gold font-black uppercase tracking-[0.2em] block mb-3">One-time Access (GBP)</span>
                                <span className="text-4xl font-black text-white">{stripeService.formatCurrency(trail.price, 'GBP')}</span>
                             </div>
                             <button 
                               onClick={() => setSelectedItemForPayment({item: trail, type: 'trail'})}
                               className="w-full bg-scot-gold hover:bg-yellow-500 text-black py-6 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-2xl shadow-yellow-500/20 flex items-center justify-center gap-3"
                             >
                                <Sparkles className="w-5 h-5" /> Buy via Stripe
                             </button>
                             <div className="flex items-center justify-center gap-3 opacity-40">
                                <ShieldCheck className="w-5 h-5 text-scot-blue" />
                                <span className="text-[10px] font-black uppercase tracking-widest">PCI Secure (GBP Only)</span>
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="p-12 animate-in slide-in-from-bottom-4 duration-500">
               <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
                      <img src={trail.imageUrl} alt="Cinematic" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  {trail.galleryImages?.map((img, idx) => (
                    <div key={idx} className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                      <img src={img} alt={`Highland Capture ${idx}`} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'stay' && (
             <div className="p-12 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                   <div className="flex-1 bg-white/5 rounded-3xl p-6 border border-white/5">
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search Scottish stays..." 
                          value={accSearchQuery}
                          onChange={(e) => setAccSearchQuery(e.target.value)}
                          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-scot-blue"
                        />
                      </div>
                   </div>
                   <div className="flex bg-white/5 p-2 rounded-3xl border border-white/10">
                      {(['All', 'Airbnb', 'Hotel', 'Caravan'] as const).map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setAccFilter(cat as any)}
                          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${accFilter === cat ? 'bg-scot-blue text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {filteredAcc.map(acc => (
                     <div key={acc.id} className="bg-white dark:bg-[#1a2235] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 group flex flex-col sm:flex-row shadow-2xl transition-all hover:border-scot-blue/30">
                        <div className="sm:w-56 h-64 sm:h-auto overflow-hidden relative">
                           <img src={acc.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                           <div className="absolute top-4 left-4">
                              <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10">
                                 {acc.type}
                              </span>
                           </div>
                        </div>
                        <div className="p-10 flex flex-col justify-between flex-grow">
                           <div>
                              <div className="flex items-center gap-1 mb-3">
                                 {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(acc.rating/2) ? 'text-scot-gold fill-current' : 'text-slate-300'}`} />)}
                                 <span className="text-[10px] font-black text-slate-500 ml-2 uppercase tracking-widest">({acc.reviewCount})</span>
                              </div>
                              <h4 className="text-slate-900 dark:text-white font-serif text-2xl font-bold mb-4">{acc.name}</h4>
                              <div className="flex flex-wrap gap-2 mb-8">
                                 {acc.amenities.slice(0, 3).map(am => <span key={am} className="text-[9px] uppercase font-black text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10">{am}</span>)}
                              </div>
                           </div>
                           <div className="flex justify-between items-end border-t border-slate-100 dark:border-white/5 pt-6">
                              <div>
                                 <div className="text-2xl font-black text-slate-900 dark:text-white">{stripeService.formatCurrency(acc.pricePerNight, 'GBP')}</div>
                                 <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Per Night</span>
                              </div>
                              <button 
                                onClick={() => setSelectedItemForPayment({item: acc, type: 'accommodation'})}
                                className="bg-scot-blue hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-scot-blue/20 transition-all active:scale-95"
                              >
                                Book Stay
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'transport' && (
            <div className="p-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-serif text-2xl font-bold flex items-center gap-3">
                       <Activity className="w-6 h-6 text-scot-blue" /> Live Transport Hub
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Real-time demand and traffic estimations from {trail.location.lat.toFixed(2)}, {trail.location.lng.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-scot-blue/10 border border-scot-blue/20 rounded-xl text-scot-blue text-[10px] font-black uppercase tracking-widest">
                     <Zap className="w-3 h-3 animate-pulse" /> Live Feed Active
                  </div>
               </div>

               {isLiveLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-10 rounded-[3rem] border border-white/5 bg-white/5 animate-pulse h-64"></div>
                    ))}
                  </div>
               ) : liveTransport && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {Object.entries(liveTransport).map(([key, opt]: [string, any]) => (
                        <button 
                          key={key} 
                          onClick={() => setSelectedTransport(key as any)}
                          className={`p-10 rounded-[3rem] border transition-all text-left flex flex-col group relative overflow-hidden ${selectedTransport === key ? 'bg-scot-blue border-white/30 text-white shadow-[0_20px_50px_rgba(0,94,184,0.3)]' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                        >
                          <div className="flex justify-between items-start mb-8 z-10">
                            <div className={`p-4 rounded-2xl ${selectedTransport === key ? 'bg-white/20' : 'bg-white/5'}`}>{opt.icon}</div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${selectedTransport === key ? 'border-white/20 bg-white/10' : 'border-white/5 bg-black/20'}`}>{opt.co2} CO2</span>
                          </div>
                          <div className="z-10">
                            <h4 className="text-xl font-bold mb-2">{opt.mode}</h4>
                            <div className="text-3xl font-black mb-3">£{opt.price}</div>
                            <div className="flex items-center gap-2 mb-2">
                               <Clock className="w-4 h-4 opacity-60" />
                               <p className="text-xs font-medium opacity-80">{opt.time}m estimated</p>
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 mt-4 ${opt.statusColor}`}>
                               <div className={`w-1.5 h-1.5 rounded-full bg-current ${opt.status !== 'Standard Rates' && opt.status !== 'Moderate Flow' && opt.status !== 'On Time' ? 'animate-pulse' : ''}`}></div>
                               {opt.status}
                            </div>
                          </div>
                          {selectedTransport === key && (
                            <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                               <Zap className="w-32 h-32 text-white" />
                            </div>
                          )}
                        </button>
                    ))}
                  </div>
               )}
               
               <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-scot-blue/10 rounded-2xl">
                       <MapIcon className="w-6 h-6 text-scot-blue" />
                    </div>
                    <div>
                       <h5 className="text-white font-bold">Route Insights</h5>
                       <p className="text-slate-500 text-xs mt-0.5">Estimated route distance: {routeDistance} km from city center.</p>
                    </div>
                  </div>
                  <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2">
                     Open in Maps <ExternalLink className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
