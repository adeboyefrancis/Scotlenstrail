
import React, { useState, useEffect } from 'react';
import { Trail, Accommodation } from '../../types';
import { mockDataService } from '../../services/mockService';
import { 
  X, Clock, MapPin, Gauge, Play, Glasses, Camera, CreditCard, 
  ChevronRight, Calendar, Users, Star, Wifi, Coffee, Car, ShieldCheck, 
  Flame, Bed, Plane, Bus, Navigation, TrendingUp, BarChart3, ArrowRightCircle, ExternalLink,
  Lock, Sparkles, Building2, Loader2, Home, Caravan, MapIcon, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '../components/ui/PaymentModal';
import { stripeService } from '../services/stripeService';

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
  
  // Accommodation Filter State
  const [accFilter, setAccFilter] = useState<'All' | 'Airbnb' | 'Caravan' | 'Mobile Home' | 'Hotel'>('All');
  
  // Interaction State for Stripe
  const [selectedItemForPayment, setSelectedItemForPayment] = useState<{item: Trail | Accommodation, type: 'trail' | 'accommodation'} | null>(null);
  
  // Transport State
  const [selectedTransport, setSelectedTransport] = useState<'uber' | 'transit' | 'drive'>('uber');
  const [routeDistance, setRouteDistance] = useState(12.5); // Mock distance
  
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

  const filteredAcc = accommodations.filter(acc => 
    accFilter === 'All' || acc.type === accFilter
  );

  const handlePurchaseSuccess = async () => {
    if (selectedItemForPayment?.type === 'trail') {
      await mockDataService.purchaseTrail(trail.id);
      setIsPurchased(true);
    } else if (selectedItemForPayment?.type === 'accommodation') {
      await mockDataService.createBooking(selectedItemForPayment.item as Accommodation);
    }
    setSelectedItemForPayment(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
        ))}
        <span className="text-xs text-white font-bold ml-1">{rating}</span>
      </div>
    );
  };

  const transportOptions = {
    uber: { mode: 'UberX', price: (routeDistance * 2.5).toFixed(2), time: Math.round(routeDistance * 2.5), co2: 'High', color: 'bg-black', icon: <Car className="w-4 h-4" /> },
    transit: { mode: 'Bus/Transit', price: '4.50', time: Math.round(routeDistance * 4.5), co2: 'Low', color: 'bg-green-600', icon: <Bus className="w-4 h-4" /> },
    drive: { mode: 'Car', price: (routeDistance * 0.4).toFixed(2), time: Math.round(routeDistance * 2.2), co2: 'Med', color: 'bg-blue-600', icon: <Navigation className="w-4 h-4" /> }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* SEAMLESS STRIPE OVERLAY */}
      {selectedItemForPayment && (
        <PaymentModal 
          item={selectedItemForPayment.item} 
          type={selectedItemForPayment.type}
          onClose={() => setSelectedItemForPayment(null)} 
          onSuccess={handlePurchaseSuccess}
        />
      )}

      <div className="bg-scot-dark border border-white/10 w-full max-w-5xl h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative scale-in-center">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 bg-black/60 backdrop-blur-md p-2.5 rounded-full text-white border border-white/10 hover:bg-black/80 transition-all hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* HERO SECTION */}
        <div className="h-64 md:h-80 relative flex-shrink-0">
             <img src={trail.imageUrl} alt={trail.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-scot-dark via-scot-dark/40 to-transparent"></div>
             <div className="absolute bottom-6 left-10 right-10">
                <div className="flex flex-wrap gap-2 mb-4">
                   {trail.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-black px-3 py-1 bg-scot-blue text-white rounded-lg shadow-xl backdrop-blur-sm tracking-widest">{tag}</span>
                   ))}
                   {!isPurchased && trail.price > 0 && (
                      <span className="text-[10px] uppercase font-black px-3 py-1 bg-scot-gold text-black rounded-lg shadow-xl flex items-center gap-1.5 tracking-widest">
                         <Lock className="w-3 h-3" /> Premium Locked
                      </span>
                   )}
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-3 drop-shadow-2xl">{trail.title}</h2>
                <div className="flex items-center gap-6 text-slate-300 text-sm font-medium">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-scot-blue" /> {trail.distanceKm} km Trail</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-scot-blue" /> {trail.durationMinutes} min</span>
                  <span className="flex items-center gap-2"><Gauge className="w-4 h-4 text-scot-blue" /> {trail.difficulty} Intensity</span>
                </div>
             </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-white/5 bg-white/5 overflow-x-auto scrollbar-hide px-6">
          <button onClick={() => setActiveTab('overview')} className={`min-w-[120px] py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'overview' ? 'border-scot-blue text-white' : 'border-transparent text-slate-500 hover:text-white'}`}>The Trail</button>
          <button onClick={() => setActiveTab('gallery')} className={`min-w-[120px] py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'gallery' ? 'border-scot-blue text-white' : 'border-transparent text-slate-500 hover:text-white'}`}>Gallery</button>
          <button onClick={() => setActiveTab('stay')} className={`min-w-[160px] py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'stay' ? 'border-scot-gold text-scot-gold bg-scot-gold/5' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}><Bed className="w-4 h-4" /> Book a Stay</button>
          <button onClick={() => setActiveTab('transport')} className={`min-w-[160px] py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'transport' ? 'border-green-500 text-green-400 bg-green-900/10' : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}><Navigation className="w-4 h-4" /> Getting There</button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-grow overflow-y-auto bg-slate-900/30 relative custom-scrollbar">
          
          {activeTab === 'overview' && (
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12 animate-in slide-in-from-bottom-2 duration-500">
               <div className="md:col-span-2 space-y-10">
                 <div>
                   {/* Add missing Info icon import from lucide-react */}
                   <h3 className="text-white font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                     <Info className="w-6 h-6 text-scot-blue" /> Expedition Summary
                   </h3>
                   <p className="text-slate-400 text-lg leading-relaxed font-light">{trail.description}</p>
                 </div>
                 
                 <div>
                    <h3 className="text-white font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                       <MapIcon className="w-6 h-6 text-scot-blue" /> Trail Checkpoints
                    </h3>
                    <div className={`space-y-4 relative ${!isPurchased ? 'blur-md select-none pointer-events-none' : ''}`}>
                      {trail.checkpoints.map((cp, idx) => (
                          <div key={cp.id} className="flex items-start gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-scot-blue/20 text-scot-blue flex items-center justify-center text-lg font-black mt-1 group-hover:bg-scot-blue group-hover:text-white transition-colors">{idx + 1}</div>
                            <div>
                                <h5 className="text-white text-lg font-bold">{cp.name}</h5>
                                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{cp.description}</p>
                            </div>
                          </div>
                      ))}
                      {!isPurchased && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                           <div className="bg-scot-dark/80 backdrop-blur-xl px-10 py-8 rounded-[2rem] border border-white/10 text-center shadow-2xl">
                              <Lock className="w-10 h-10 text-scot-gold mx-auto mb-4" />
                              <p className="text-white text-sm font-black uppercase tracking-widest mb-2">Trail Access Locked</p>
                              <p className="text-xs text-slate-400">Secure full access via Stripe payment to view full details.</p>
                           </div>
                        </div>
                      )}
                    </div>
                 </div>
               </div>

               <div className="md:col-span-1">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 sticky top-0 shadow-xl">
                     <h3 className="text-white font-serif text-xl font-bold mb-6">{isPurchased ? 'Trail Unlocked' : 'Purchase Access'}</h3>
                     <div className="space-y-4">
                        {isPurchased ? (
                          <>
                            <button onClick={() => navigate(`/trail/${trail.id}`)} className="w-full bg-scot-blue hover:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-scot-blue/30 flex items-center justify-center gap-3">
                              <Play className="w-5 h-5 fill-current" /> Start Expedition
                            </button>
                            {trail.panoramaUrl && (
                              <button onClick={onStartVr} className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10">
                                <Glasses className="w-5 h-5" /> Experience in VR
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="space-y-6">
                             <div className="p-6 bg-scot-gold/5 border border-scot-gold/20 rounded-2xl text-center">
                                <span className="text-[10px] text-scot-gold font-black uppercase tracking-[0.2em] block mb-2">Lifetime Access</span>
                                <span className="text-3xl font-black text-white">{stripeService.formatCurrency(trail.price, trail.currency)}</span>
                             </div>
                             <button 
                               onClick={() => setSelectedItemForPayment({item: trail, type: 'trail'})}
                               className="w-full bg-scot-gold hover:bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-yellow-500/20 flex items-center justify-center gap-3"
                             >
                                <Sparkles className="w-5 h-5" /> Buy via Stripe
                             </button>
                             <div className="flex items-center justify-center gap-2 opacity-40 grayscale group hover:grayscale-0 transition-all">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">PCI Secure Payment</span>
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'stay' && (
            <div className="animate-in slide-in-from-bottom-2 duration-500 flex flex-col h-full">
               <div className="bg-scot-blue px-10 py-8 sticky top-0 z-10 shadow-2xl border-b border-white/10">
                  <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-4">
                       <div className="flex-1 bg-white rounded-2xl flex items-center px-6 py-3.5 text-slate-800 shadow-xl">
                          <MapPin className="w-5 h-5 text-scot-blue mr-3" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nearby Destination</span>
                            <span className="text-sm font-bold truncate">Highlands Area — {trail.title}</span>
                          </div>
                       </div>
                       <div className="flex-1 bg-white rounded-2xl flex items-center px-6 py-3.5 text-slate-800 shadow-xl">
                          <Calendar className="w-5 h-5 text-scot-blue mr-3" />
                          <div className="flex flex-col">
                             <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Duration</span>
                             <span className="text-sm font-bold">1 Night Demo Reservation</span>
                          </div>
                       </div>
                    </div>
                    
                    {/* Accommodation Category Filter */}
                    <div className="flex flex-wrap items-center gap-3">
                       <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mr-2">Search Type:</span>
                       {(['All', 'Airbnb', 'Caravan', 'Mobile Home', 'Hotel'] as const).map(cat => (
                         <button 
                            key={cat}
                            onClick={() => setAccFilter(cat)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${accFilter === cat ? 'bg-white text-scot-blue border-white shadow-lg' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                         >
                            {cat}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               <div className="p-10 max-w-5xl mx-auto w-full flex-grow">
                 {loadingAcc && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                       <Loader2 className="w-12 h-12 animate-spin text-scot-blue" />
                       <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Filtering Accommodations...</p>
                    </div>
                 )}
                 {!loadingAcc && (
                   <div className="grid grid-cols-1 gap-6">
                     {filteredAcc.map((acc) => (
                       <div key={acc.id} className="bg-white dark:bg-[#1a2235] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col md:flex-row group hover:border-scot-blue/50 transition-all shadow-xl">
                          <div className="md:w-72 h-52 relative flex-shrink-0 overflow-hidden">
                             <img src={acc.imageUrl} alt={acc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                             <div className="absolute top-4 left-4">
                                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest flex items-center gap-2">
                                   {acc.type === 'Airbnb' ? <Home className="w-3 h-3 text-red-400" /> : acc.type === 'Caravan' ? <Caravan className="w-3 h-3 text-scot-blue" /> : <Building2 className="w-3 h-3 text-green-400" />}
                                   {acc.type}
                                </span>
                             </div>
                          </div>
                          <div className="p-8 flex-grow flex flex-col justify-between">
                             <div className="flex justify-between items-start">
                                <div>
                                   <div className="flex items-center gap-3 mb-2">
                                      {renderStars(acc.rating)}
                                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">({acc.reviewCount} Reviews)</span>
                                   </div>
                                   <h4 className="text-slate-900 dark:text-white font-serif text-2xl font-bold mb-3 group-hover:text-scot-blue transition-colors">{acc.name}</h4>
                                   <div className="flex flex-wrap gap-2">
                                      {acc.amenities.slice(0, 4).map(am => (
                                        <span key={am} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 font-black uppercase tracking-tighter">{am}</span>
                                      ))}
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-3xl font-black text-slate-900 dark:text-white">{stripeService.formatCurrency(acc.pricePerNight, acc.currency)}</div>
                                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Per Night</p>
                                   <button 
                                    onClick={() => setSelectedItemForPayment({item: acc, type: 'accommodation'})}
                                    className="bg-scot-blue hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-scot-blue/20 active:scale-95 transition-all flex items-center gap-2"
                                   >
                                      Book via Stripe
                                   </button>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                     {filteredAcc.length === 0 && (
                        <div className="text-center py-20">
                           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Building2 className="w-8 h-8 text-slate-600" />
                           </div>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No {accFilter} listings found nearby.</p>
                        </div>
                     )}
                   </div>
                 )}
               </div>
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="p-10 animate-in slide-in-from-bottom-2 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {Object.entries(transportOptions).map(([key, opt]) => (
                     <button key={key} onClick={() => setSelectedTransport(key as any)} className={`p-8 rounded-[2rem] border transition-all text-left group ${selectedTransport === key ? 'bg-scot-blue border-white/20 text-white shadow-2xl' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}>
                        <div className="flex justify-between items-start mb-6">
                           <div className={`p-3 rounded-2xl ${selectedTransport === key ? 'bg-white/20' : 'bg-white/5'}`}>{opt.icon}</div>
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{opt.co2} CO2 Rating</span>
                        </div>
                        <h4 className="font-bold text-xl mb-1">{opt.mode}</h4>
                        <p className="text-2xl font-black mb-2">£{opt.price}</p>
                        <p className="text-xs opacity-60 font-medium">{opt.time} minutes travel</p>
                     </button>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="p-10 animate-in slide-in-from-bottom-2 duration-500">
               <div className="columns-2 md:columns-3 gap-6 space-y-6">
                  <div className="relative group rounded-[2rem] overflow-hidden break-inside-avoid">
                      <img src={trail.imageUrl} alt="Main" className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  {trail.galleryImages?.map((img, idx) => (
                    <div key={idx} className="relative group rounded-[2rem] overflow-hidden break-inside-avoid shadow-lg">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
