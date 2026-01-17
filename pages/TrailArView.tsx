
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockService';
import { generateTrailHistory } from '../services/geminiService';
import { Trail, Checkpoint } from '../types';
import { 
  ArrowLeft, Info, Loader2, Sparkles, MapPin, 
  X, Gift, CheckCircle, RefreshCw, Glasses, Camera, Scan, Share2,
  History, ChevronUp, ChevronDown, BookOpen, Quote
} from 'lucide-react';
import { Viewer360 } from '../components/ui/Viewer360';
import { useToast } from '../components/ui/Layout';

export const TrailArView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [trail, setTrail] = useState<Trail | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  
  // Interaction State
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [claimedCheckpoints, setClaimedCheckpoints] = useState<Set<string>>(new Set());
  const [showRewardSuccess, setShowRewardSuccess] = useState(false);
  
  // Capture State
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  // VR State
  const [isVrMode, setIsVrMode] = useState(false);

  // Gemini State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [aiFact, setAiFact] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const data = await mockDataService.getTrailById(id);
        if (data) setTrail(data);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setPermissionGranted(true);
      }
    } catch (err) {
      showToast("Camera access denied", "error");
    }
  };

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({ alpha: event.alpha || 0, beta: event.beta || 0, gamma: event.gamma || 0 });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handleAskAI = async () => {
    if (!trail) return;
    setGeminiLoading(true);
    setAiFact(null);
    const context = selectedCheckpoint ? `at ${selectedCheckpoint.name}` : `near ${trail.title}`;
    const fact = await generateTrailHistory(trail.title, context);
    setAiFact(fact);
    setGeminiLoading(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Exploring ${trail?.title}`,
          text: `Check out my AR discovery at ${selectedCheckpoint?.name || trail?.title}!`,
          url: window.location.href,
        });
        showToast("Shared successfully", "success");
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      showToast("Sharing not supported in this browser", "info");
    }
  };

  const handleSaveToArchive = () => {
    showToast("Added to Historical Archive", "success");
    setIsAiPanelOpen(false);
  };

  const handleClaimReward = (checkpointId: string) => {
    setClaimedCheckpoints(prev => new Set(prev).add(checkpointId));
    setShowRewardSuccess(true);
    showToast("Reward Discovered!", "success");
    setTimeout(() => setShowRewardSuccess(false), 3000);
  };

  const handleCapture = async () => {
    if (!trail) return;
    setIsCapturing(true);
    setShowFlash(true);

    try {
      let imageData = '';
      const canvas = canvasRef.current;
      if (permissionGranted && videoRef.current && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
          imageData = canvas.toDataURL('image/jpeg', 0.8);
        }
      } else {
        imageData = trail.panoramaUrl || trail.imageUrl;
      }

      setLastCapture(imageData);
      await mockDataService.addGalleryImage(trail.id, imageData);
      showToast("Capture Logged to Gallery", "success");
      setTimeout(() => setShowFlash(false), 200);
      setTimeout(() => setLastCapture(null), 4000);
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex flex-col items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-scot-blue" /></div>;
  if (!trail) return <div className="p-10 text-center text-white">Trail not found</div>;

  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="hidden" />
      {showFlash && <div className="absolute inset-0 z-[100] bg-white animate-out fade-out duration-300 pointer-events-none" />}
      {isVrMode && trail.panoramaUrl && <div className="absolute inset-0 z-50"><Viewer360 imageUrl={trail.panoramaUrl} title={trail.title} onClose={() => setIsVrMode(false)} /></div>}

      {!permissionGranted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
          <div className="p-8 bg-black/70 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-center max-w-sm">
            <Scan className="w-10 h-10 text-scot-blue mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Immersive AR Portal</h3>
            <p className="text-slate-400 text-sm mb-8">Connect your camera to see historical waypoints mapped to the real world.</p>
            <div className="flex flex-col gap-4">
              <button onClick={startCamera} className="w-full py-4 bg-scot-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Activate Lens</button>
              <button onClick={() => setPermissionGranted(true)} className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] border border-white/10">Simulate AR</button>
            </div>
          </div>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-0" />
      )}

      {permissionGranted && (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {trail.checkpoints.map((cp, index) => {
            const isClaimed = claimedCheckpoints.has(cp.id);
            const isSelected = selectedCheckpoint?.id === cp.id;
            return (
              <div key={cp.id} className={`absolute pointer-events-auto cursor-pointer transition-all duration-500`} style={{ top: `${35 + (index * 12) % 40}%`, left: `${20 + (index * 45) % 70}%` }} onClick={() => setSelectedCheckpoint(cp)}>
                <div className={`relative flex flex-col items-center ${isSelected ? 'scale-110 z-50' : 'z-20 hover:scale-110'}`}>
                  <div className={`mb-3 px-4 py-2 rounded-xl border backdrop-blur-xl shadow-2xl ${isClaimed ? 'bg-green-500/80' : cp.hasReward ? 'bg-scot-gold/90' : 'bg-scot-blue/80'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">{cp.name}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-4 border-white ${isClaimed ? 'bg-green-500' : cp.hasReward ? 'bg-scot-gold' : 'bg-scot-blue'}`}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start pointer-events-auto">
          <button onClick={() => navigate('/dashboard')} className="bg-black/60 backdrop-blur-xl p-3.5 rounded-2xl text-white border border-white/10 shadow-2xl"><ArrowLeft className="w-6 h-6" /></button>
          <button onClick={() => { setIsAiPanelOpen(true); if (!aiFact) handleAskAI(); }} className={`backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 transition-all ${isAiPanelOpen ? 'bg-scot-gold text-black shadow-scot-gold/30' : 'bg-black/60 text-white'}`}><History className="w-6 h-6" /></button>
        </div>

        {selectedCheckpoint && !isAiPanelOpen && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4 pointer-events-auto">
             <div className="bg-scot-dark border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in">
               <div className="p-8">
                 <h3 className="text-3xl font-serif font-bold text-white mb-2">{selectedCheckpoint.name}</h3>
                 <p className="text-slate-400 text-sm mb-8">{selectedCheckpoint.description}</p>
                 <div className="flex gap-4">
                   <button onClick={() => { setIsAiPanelOpen(true); handleAskAI(); }} className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl"><Sparkles className="w-5 h-5 text-scot-gold" /></button>
                   {selectedCheckpoint.hasReward && !claimedCheckpoints.has(selectedCheckpoint.id) ? (
                      <button onClick={() => handleClaimReward(selectedCheckpoint.id)} className="flex-1 bg-scot-gold text-black font-black uppercase py-4 rounded-2xl">Claim Reward</button>
                   ) : (
                      <button onClick={() => setSelectedCheckpoint(null)} className="flex-1 bg-scot-blue text-white font-black uppercase py-4 rounded-2xl">Keep Exploring</button>
                   )}
                 </div>
               </div>
             </div>
           </div>
        )}

        <div className="flex flex-col items-center gap-6 pointer-events-auto relative">
           {isAiPanelOpen && (
             <div className="w-full max-w-2xl bg-black/80 backdrop-blur-2xl border border-white/20 rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-20 z-[100] relative">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-white font-serif text-xl font-bold">AI Spectral Historian</h3>
                  <button onClick={() => setIsAiPanelOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
               </div>
               <div className="min-h-[200px] flex flex-col justify-center text-center">
                  {geminiLoading ? <Loader2 className="w-12 h-12 text-scot-blue animate-spin mx-auto" /> : aiFact ? (
                    <div className="animate-in fade-in space-y-8">
                       <p className="text-slate-200 text-lg leading-relaxed italic border-l-4 border-scot-blue pl-8 py-2 text-left">{aiFact}</p>
                       <div className="flex gap-4">
                          <button onClick={handleAskAI} className="flex-1 bg-white/5 text-white py-4 rounded-2xl border border-white/10 uppercase font-black text-[10px] tracking-widest">Re-Scan History</button>
                          <button onClick={handleSaveToArchive} className="flex-1 bg-scot-blue text-white py-4 rounded-2xl uppercase font-black text-[10px] tracking-widest">Save to Archive</button>
                       </div>
                    </div>
                  ) : <button onClick={handleAskAI} className="bg-scot-gold text-black font-black uppercase px-10 py-4 rounded-2xl">Reveal History</button>}
               </div>
             </div>
           )}

           <div className={`w-full max-w-xl bg-scot-dark border border-white/10 rounded-[3rem] p-5 shadow-2xl flex items-center gap-6 transition-all ${isAiPanelOpen ? 'opacity-0 scale-95' : 'opacity-100'}`}>
              <button onClick={handleCapture} disabled={isCapturing} className="w-20 h-20 rounded-full border-4 border-white/10 bg-white flex items-center justify-center transition-all active:scale-95">
                {isCapturing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8 text-scot-dark" />}
              </button>
              <div className="flex-grow">
                 <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">World Feed</span>
                    <span className="text-[10px] text-scot-blue font-mono font-bold">{claimedCheckpoints.size}/{trail.checkpoints.length} SPOTS</span>
                 </div>
                 <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 relative">
                   <div className="bg-gradient-to-r from-scot-blue to-scot-gold h-full rounded-full transition-all duration-1000" style={{ width: `${(claimedCheckpoints.size / trail.checkpoints.length) * 100}%` }}></div>
                 </div>
              </div>
              <button onClick={handleShare} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white border border-white/5"><Share2 className="w-5 h-5" /></button>
           </div>
        </div>
      </div>
    </div>
  );
};
