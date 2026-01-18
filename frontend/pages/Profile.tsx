
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDataService } from '../services/mockService';
import { UserActivity, UserBooking } from '../types';
import { 
  User as UserIcon, Calendar, MapPin, Award, Activity, 
  ChevronRight, Bed, History, Star, TrendingUp, Settings, LogOut,
  ShieldCheck, Clock, Map as MapIcon, CheckCircle, CreditCard, 
  Bell, Globe, Fingerprint, Lock, Eye, Zap, Trash2, Plus, Users,
  Sparkles, Camera, Gift, ArrowRight, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stripeService } from '../services/stripeService';
import { useToast } from '../components/ui/Layout';

type ProfileTab = 'overview' | 'trails' | 'stays' | 'settings';
type SettingsTab = 'security' | 'payments' | 'system';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('security');

  const [preferences, setPreferences] = useState({
    biometric: true,
    twoFactor: false,
    locationPrivacy: true,
    units: 'metric',
    notifications: {
      trailAlerts: true,
      partnerRewards: true,
      socialInvites: false
    }
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const [acts, bks] = await Promise.all([
          mockDataService.getUserActivities(),
          mockDataService.getUserBookings()
        ]);
        setActivities(acts);
        setBookings(bks);
      }
      setLoading(false);
    };
    loadUserData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    showToast("Signed out", "info");
  };

  const togglePref = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      const newVal = !preferences[key];
      setPreferences(prev => ({ ...prev, [key]: newVal }));
      showToast(`${key} ${newVal ? 'Enabled' : 'Disabled'}`, "success");
    }
  };

  const toggleNotif = (key: keyof typeof preferences.notifications) => {
    const newVal = !preferences.notifications[key];
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: newVal }
    }));
    showToast(`${key} Alert ${newVal ? 'Active' : 'Muted'}`, "info");
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl backdrop-blur-md sticky top-24">
            <div className="w-24 h-24 rounded-full bg-scot-blue/20 border-2 border-scot-blue flex items-center justify-center mb-6 overflow-hidden group relative">
              <UserIcon className="w-12 h-12 text-scot-blue" />
              <div onClick={() => setActiveTab('settings')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-1">{user.name}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-scot-gold/10 border border-scot-gold/20 text-scot-gold text-xs font-bold uppercase tracking-widest mb-6">
              <ShieldCheck className="w-3 h-3" /> Pro Explorer
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
               <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1">XP Level</div>
                  <div className="text-white font-bold text-lg">42</div>
               </div>
               <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Badges</div>
                  <div className="text-white font-bold text-lg">12</div>
               </div>
            </div>

            <div className="w-full pt-6 border-t border-white/5 space-y-2">
               <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors text-sm font-medium">
                 <span className="flex items-center gap-2"><MapIcon className="w-4 h-4 text-scot-blue" /> Trails Hub</span>
                 <ChevronRight className="w-4 h-4" />
               </button>
               <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-sm font-medium ${activeTab === 'settings' ? 'bg-scot-blue/20 text-scot-blue' : 'hover:bg-white/5 text-slate-300'}`}>
                 <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-scot-blue" /> Preferences</span>
                 <ChevronRight className="w-4 h-4" />
               </button>
               <button onClick={handleLogout} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-sm font-medium">
                 <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</span>
               </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden min-h-[600px] flex flex-col shadow-2xl backdrop-blur-md">
              <div className="flex border-b border-white/5 bg-white/5 overflow-x-auto scrollbar-hide">
                 {(['overview', 'trails', 'stays', 'settings'] as ProfileTab[]).map(tab => (
                   <button key={tab} onClick={() => setActiveTab(tab)} className={`min-w-[120px] flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab ? 'border-scot-blue text-white bg-scot-blue/10' : 'border-transparent text-slate-500 hover:text-white'}`}>
                     {tab}
                   </button>
                 ))}
              </div>

              <div className="p-6 md:p-10 flex-grow">
                 {loading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                       <Loader2 className="w-12 h-12 animate-spin text-scot-blue" />
                       <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Ledger...</p>
                    </div>
                 ) : (
                   <>
                    {activeTab === 'overview' && (
                       <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="bg-scot-blue/10 border border-scot-blue/20 p-6 rounded-[2rem] flex flex-col justify-between">
                                <Activity className="w-8 h-8 text-scot-blue mb-6" />
                                <div>
                                   <div className="text-white text-3xl font-black mb-1">{activities.length}</div>
                                   <div className="text-[10px] text-scot-blue font-black uppercase tracking-widest">Active Expeditions</div>
                                </div>
                             </div>
                             <div className="bg-scot-gold/10 border border-scot-gold/20 p-6 rounded-[2rem] flex flex-col justify-between">
                                <Award className="w-8 h-8 text-scot-gold mb-6" />
                                <div>
                                   <div className="text-white text-3xl font-black mb-1">8</div>
                                   <div className="text-[10px] text-scot-gold font-black uppercase tracking-widest">Rewards Unlocked</div>
                                </div>
                             </div>
                             <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[2rem] flex flex-col justify-between">
                                <Globe className="w-8 h-8 text-green-500 mb-6" />
                                <div>
                                   <div className="text-white text-3xl font-black mb-1">124km</div>
                                   <div className="text-[10px] text-green-500 font-black uppercase tracking-widest">Distance Logged</div>
                                </div>
                             </div>
                          </div>

                          <div>
                             <h3 className="text-white font-serif text-xl font-bold mb-8 flex items-center gap-3">
                                <History className="w-5 h-5 text-scot-blue" /> Spectral Discovery Timeline
                             </h3>
                             <div className="space-y-0 relative">
                                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/5"></div>
                                {activities.length > 0 ? activities.map((act, i) => (
                                   <div key={act.id} className="relative pl-16 pb-12 group last:pb-0">
                                      <div className={`absolute left-0 top-0 w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center shadow-xl transition-all group-hover:scale-110 ${i % 2 === 0 ? 'bg-scot-blue/20 text-scot-blue' : 'bg-scot-gold/20 text-scot-gold'}`}>
                                         {i % 3 === 0 ? <Camera className="w-6 h-6" /> : i % 3 === 1 ? <Sparkles className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                      </div>
                                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all cursor-pointer" onClick={() => navigate(`/trail/${act.trailId}`)}>
                                         <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-white font-bold">{act.trailTitle} Exploration</h4>
                                            <span className="text-[10px] text-slate-500 font-mono">{new Date(act.date).toLocaleDateString()}</span>
                                         </div>
                                         <p className="text-slate-400 text-sm mb-4">You discovered a hidden historical layer and captured 3 spectral logs near this waypoint.</p>
                                         <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                               <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                                  <div className="h-full bg-scot-blue" style={{ width: `${act.progressPercent}%` }}></div>
                                               </div>
                                               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{act.progressPercent}% Sync</span>
                                            </div>
                                            <button className="text-scot-blue hover:text-white transition-colors"><ArrowRight className="w-5 h-5" /></button>
                                         </div>
                                      </div>
                                   </div>
                                )) : (
                                  <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                                     <MapIcon className="w-12 h-12 text-slate-700 mx-auto mb-6" />
                                     <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No activity logged in this dimension.</p>
                                     <button onClick={() => navigate('/dashboard')} className="mt-6 text-scot-blue text-[10px] font-black uppercase tracking-widest hover:underline">Start a Trail</button>
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'trails' && (
                       <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                          <h3 className="text-white font-serif text-xl font-bold mb-6 flex items-center gap-3">
                             <MapIcon className="w-5 h-5 text-scot-blue" /> Purchased Expeditions
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {activities.map(act => (
                                <div key={act.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-scot-blue/30 transition-all group">
                                   <div className="flex justify-between items-start mb-6">
                                      <div className="p-4 bg-scot-blue/10 rounded-2xl text-scot-blue group-hover:bg-scot-blue group-hover:text-white transition-all">
                                         <MapIcon className="w-6 h-6" />
                                      </div>
                                      <div className="text-right">
                                         <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Status</span>
                                         <span className="text-scot-blue font-bold text-xs uppercase tracking-widest">{act.status.replace('_', ' ')}</span>
                                      </div>
                                   </div>
                                   <div>
                                      <h4 className="text-white font-serif text-xl font-bold mb-4">{act.trailTitle}</h4>
                                      <div className="w-full bg-white/5 h-2 rounded-full mb-3 overflow-hidden">
                                         <div className="h-full bg-scot-blue rounded-full" style={{ width: `${act.progressPercent}%` }}></div>
                                      </div>
                                      <div className="flex justify-between items-center">
                                         <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{act.progressPercent}% Complete</span>
                                         <button onClick={() => navigate(`/trail/${act.trailId}`)} className="text-white text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl hover:bg-scot-blue transition-all">Resume</button>
                                      </div>
                                   </div>
                                </div>
                             ))}
                             {activities.length === 0 && (
                                <div className="col-span-2 text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                                   <Lock className="w-12 h-12 text-slate-700 mx-auto mb-6" />
                                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No purchased trails found.</p>
                                </div>
                             )}
                          </div>
                       </div>
                    )}

                    {activeTab === 'stays' && (
                       <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                          <h3 className="text-white font-serif text-xl font-bold mb-6 flex items-center gap-3">
                             <Bed className="w-5 h-5 text-scot-blue" /> Local Stay Reservations
                          </h3>
                          <div className="space-y-6">
                             {bookings.length > 0 ? bookings.map(bk => (
                                <div key={bk.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-8 hover:border-scot-blue/30 transition-all">
                                   <img src={bk.imageUrl} className="w-24 h-24 rounded-2xl object-cover" alt="" />
                                   <div className="flex-grow">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className="text-white font-bold text-lg">{bk.accommodationName}</h4>
                                         <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${bk.status === 'CONFIRMED' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-slate-500/10 border-white/10 text-slate-400'}`}>
                                            {bk.status}
                                         </span>
                                      </div>
                                      <div className="flex flex-wrap gap-6 mt-4">
                                         <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="text-[11px] text-slate-400 font-bold">{new Date(bk.checkIn).toLocaleDateString()} - {new Date(bk.checkOut).toLocaleDateString()}</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-slate-500" />
                                            <span className="text-[11px] text-slate-400 font-bold">£{bk.priceTotal} Total</span>
                                         </div>
                                      </div>
                                   </div>
                                   <button className="w-full md:w-auto px-8 py-3 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-scot-blue transition-all border border-white/10">Manage</button>
                                </div>
                             )) : (
                                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                                   <Bed className="w-12 h-12 text-slate-700 mx-auto mb-6" />
                                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No stay reservations recorded.</p>
                                </div>
                             )}
                          </div>
                       </div>
                    )}

                    {activeTab === 'settings' && (
                       <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col md:flex-row gap-10">
                          <div className="md:w-1/4 space-y-2 border-r border-white/5 pr-6">
                             {(['security', 'payments', 'system'] as SettingsTab[]).map(tab => (
                               <button key={tab} onClick={() => setActiveSettingsTab(tab)} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeSettingsTab === tab ? 'bg-scot-blue text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{tab}</span>
                               </button>
                             ))}
                          </div>

                          <div className="flex-grow">
                             {activeSettingsTab === 'security' && (
                               <div className="space-y-6 animate-in fade-in">
                                  <h3 className="text-white font-serif text-xl font-bold mb-6">Access & Privacy</h3>
                                  {[
                                    { id: 'biometric', title: 'Biometric AR Unlock', icon: <Fingerprint className="w-6 h-6" /> },
                                    { id: 'twoFactor', title: 'Two-Factor Heritage Auth', icon: <ShieldCheck className="w-6 h-6" /> },
                                    { id: 'locationPrivacy', title: 'Location Privacy Masking', icon: <Eye className="w-6 h-6" /> }
                                  ].map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                      <div className="flex items-center gap-4">
                                         <div className="p-3 bg-scot-blue/10 rounded-2xl text-scot-blue">{item.icon}</div>
                                         <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                      </div>
                                      <button onClick={() => togglePref(item.id as any)} className={`w-14 h-8 rounded-full p-1 transition-all ${(preferences as any)[item.id] ? 'bg-scot-blue' : 'bg-slate-700'}`}>
                                         <div className={`w-6 h-6 bg-white rounded-full transition-transform ${(preferences as any)[item.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                      </button>
                                    </div>
                                  ))}
                               </div>
                             )}

                             {activeSettingsTab === 'payments' && (
                               <div className="space-y-8 animate-in fade-in">
                                  <div className="flex justify-between items-end mb-8">
                                     <h3 className="text-white font-serif text-xl font-bold">Payment Methods</h3>
                                     <button onClick={() => showToast("Linking Stripe Gateway...", "info")} className="flex items-center gap-2 bg-scot-blue text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-scot-blue/20">
                                        <Plus className="w-3 h-3" /> Add Card
                                     </button>
                                  </div>
                                  <div className="bg-gradient-to-r from-[#1a1f35] to-[#0f172a] border border-white/10 rounded-[2.5rem] p-8">
                                     <div className="flex justify-between items-start mb-10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Method</span>
                                        <button onClick={() => showToast("Security Lock Active", "error")} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                     </div>
                                     <div className="text-white font-mono text-xl tracking-widest mb-6">•••• •••• •••• 4242</div>
                                     <div className="text-xs font-bold text-slate-400">VISA / STRIPE GBP</div>
                                  </div>
                               </div>
                             )}

                             {activeSettingsTab === 'system' && (
                               <div className="space-y-8 animate-in fade-in">
                                  <h3 className="text-white font-serif text-xl font-bold">Measurement System</h3>
                                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
                                     <button onClick={() => { setPreferences(prev => ({ ...prev, units: 'metric' })); showToast("Units set to Metric", "info"); }} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${preferences.units === 'metric' ? 'bg-scot-blue text-white' : 'text-slate-500'}`}>Metric (KM)</button>
                                     <button onClick={() => { setPreferences(prev => ({ ...prev, units: 'imperial' })); showToast("Units set to Imperial", "info"); }} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${preferences.units === 'imperial' ? 'bg-scot-blue text-white' : 'text-slate-500'}`}>Imperial (MI)</button>
                                  </div>
                                  <div className="space-y-4 pt-4">
                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Notification Hub</label>
                                     {(['trailAlerts', 'partnerRewards', 'socialInvites'] as const).map(key => (
                                       <div key={key} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                         <span className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                         <button onClick={() => toggleNotif(key)} className={`w-12 h-6 rounded-full p-1 transition-all ${preferences.notifications[key] ? 'bg-scot-blue' : 'bg-slate-700'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences.notifications[key] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                         </button>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             )}
                          </div>
                       </div>
                    )}
                   </>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
