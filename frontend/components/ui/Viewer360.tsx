
import React, { useRef, useState, useEffect } from 'react';
import { X, Move, Compass, Glasses, Smartphone, Rotate3d, Maximize2 } from 'lucide-react';

interface Viewer360Props {
  imageUrl: string;
  onClose: () => void;
  title: string;
}

export const Viewer360: React.FC<Viewer360Props> = ({ imageUrl, onClose, title }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  
  // View State
  const [bgPositionX, setBgPositionX] = useState(50); // %
  const [bgPositionY, setBgPositionY] = useState(50); // %
  const [isStereo, setIsStereo] = useState(false); // VR Split Screen
  const [useGyro, setUseGyro] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Handle Device Orientation (Gyroscope)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!useGyro) return;
      
      // Alpha: Rotation around Z axis (0-360) - Panorama X
      // Beta: Rotation around X axis (-180 to 180) - Panorama Y (Tilt)
      
      const alpha = e.alpha || 0;
      const beta = e.beta || 0;

      // Normalize Alpha (Compass) to 0-100%
      // Invert direction for natural "window" feel
      const xPos = 100 - ((alpha / 360) * 100);
      
      // Normalize Beta (Tilt) roughly -45 to 45 degrees to 0-100%
      // Clamped to avoid flipping
      const clampedBeta = Math.max(-45, Math.min(45, beta));
      const yPos = 50 + ((clampedBeta / 90) * 100);

      setBgPositionX(xPos);
      setBgPositionY(yPos);
    };

    if (useGyro && permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [useGyro, permissionGranted]);

  const requestGyroPermission = async () => {
    // iOS 13+ requires permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setUseGyro(true);
        } else {
          alert('Permission denied for VR motion controls.');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // Android / Older iOS
      setPermissionGranted(true);
      setUseGyro(true);
    }
  };

  const toggleStereo = () => {
    if (!useGyro && !isStereo) {
        // Automatically ask for gyro when entering VR mode for best experience
        requestGyroPermission();
    }
    setIsStereo(!isStereo);
  };

  // --- MOUSE / TOUCH DRAG LOGIC (Fallback) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (useGyro) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || useGyro) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    const sensitivity = 0.1;
    setBgPositionX(prev => (prev - (deltaX * sensitivity)) % 100);
    setBgPositionY(prev => Math.max(0, Math.min(100, prev - (deltaY * sensitivity))));
    
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (useGyro) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || useGyro) return;
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    const sensitivity = 0.2;
    
    setBgPositionX(prev => (prev - (deltaX * sensitivity)) % 100);
    setBgPositionY(prev => Math.max(0, Math.min(100, prev - (deltaY * sensitivity))));
    
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };

  // --- RENDER HELPERS ---
  const Viewport = ({ isLeftEye }: { isLeftEye?: boolean }) => (
    <div
      className={`relative w-full h-full cursor-move active:cursor-grabbing overflow-hidden ${isStereo ? 'border-2 border-black rounded-3xl' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
       {/* Instruction Overlay (Only show if not gyro and not dragging) */}
       {!isDragging && !useGyro && !isStereo && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full pointer-events-none z-10 flex flex-col items-center gap-2 border border-white/10 animate-pulse">
           <Move className="w-6 h-6 text-white" />
           <span className="text-xs text-white font-medium uppercase tracking-widest">Drag</span>
         </div>
       )}

       {/* Gyro Icon Overlay */}
       {useGyro && !isStereo && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-scot-blue/20 backdrop-blur-sm px-6 py-3 rounded-full pointer-events-none z-10 flex flex-col items-center gap-2 border border-scot-blue/50">
             <Rotate3d className="w-8 h-8 text-white animate-spin-slow" />
             <span className="text-xs text-white font-medium uppercase tracking-widest">Move Phone to Look</span>
          </div>
       )}

       {/* Reticle for VR (Center Focus) */}
       {isStereo && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full z-20 shadow-[0_0_4px_rgba(0,0,0,0.8)]"></div>
       )}

       {/* The Image Layer */}
       <div
         style={{
           backgroundImage: `url(${imageUrl})`,
           backgroundSize: 'cover', // Zoom in slightly
           // Adjust parallax for stereo effect (shift X slightly for left/right eye)
           backgroundPosition: `${bgPositionX + (isLeftEye ? -2 : isLeftEye === false ? 2 : 0)}% ${bgPositionY}%`, 
           backgroundRepeat: 'repeat-x',
           transition: isDragging ? 'none' : 'background-position 0.1s linear',
           transform: 'scale(1.2)' // Ensure coverage during tilt
         }}
         className="absolute inset-0 w-full h-full"
       />
       
       {/* Compass (Non-Stereo Only) */}
       {!isStereo && (
         <div className="absolute bottom-6 left-6 z-10 pointer-events-none opacity-50">
           <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center relative">
             <div className="text-[8px] absolute top-1 font-bold text-white">N</div>
             <div className="text-[8px] absolute bottom-1 font-bold text-white">S</div>
             <div className="text-[8px] absolute left-1 font-bold text-white">W</div>
             <div className="text-[8px] absolute right-1 font-bold text-white">E</div>
             <div 
               className="w-10 h-0.5 bg-red-500 absolute transition-transform duration-100"
               style={{ transform: `rotate(${bgPositionX * 3.6}deg)` }} // Approx conversion % to deg
             ></div>
           </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full ${isStereo ? 'h-full max-w-full p-0 bg-black' : 'max-w-6xl h-[70vh] p-4'} flex flex-col transition-all duration-300`}>
        
        {/* Header Controls */}
        <div className={`flex justify-between items-center ${isStereo ? 'fixed top-4 left-4 right-4 z-50 bg-black/0' : 'p-4 border-b border-white/10 bg-black/40 absolute top-0 left-0 right-0 z-20 backdrop-blur-sm'} rounded-t-2xl`}>
           
           {!isStereo && (
             <div className="flex items-center gap-2">
               <div className="p-1.5 bg-scot-blue rounded-lg">
                  <Compass className="w-5 h-5 text-white" />
               </div>
               <div>
                  <h3 className="text-white font-serif text-lg leading-none">{title}</h3>
                  <span className="text-xs text-slate-400">360° VR Preview</span>
               </div>
             </div>
           )}

           <div className={`flex gap-3 ${isStereo ? 'bg-black/40 backdrop-blur-md p-2 rounded-full mx-auto' : ''}`}>
             
             {/* Gyro Toggle */}
             {!isStereo && (
               <button 
                onClick={useGyro ? () => setUseGyro(false) : requestGyroPermission}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 px-3 ${useGyro ? 'bg-scot-blue text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                title="Toggle Motion Control"
               >
                 <Smartphone className="w-5 h-5" />
                 <span className="text-xs font-bold hidden sm:block">{useGyro ? 'Motion ON' : 'Motion OFF'}</span>
               </button>
             )}

             {/* VR Mode Toggle */}
             <button 
              onClick={toggleStereo}
              className={`p-2 rounded-full transition-colors flex items-center gap-2 px-3 ${isStereo ? 'bg-scot-gold text-black' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
              title="Toggle VR Headset Mode"
             >
               <Glasses className="w-5 h-5" />
               <span className="text-xs font-bold hidden sm:block">{isStereo ? 'Exit VR' : 'Enter VR'}</span>
             </button>

             {/* Close */}
             <button onClick={onClose} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors text-white">
               <X className="w-6 h-6" />
             </button>
           </div>
        </div>

        {/* Main Content Area */}
        <div className={`relative w-full h-full bg-scot-dark overflow-hidden shadow-2xl ${isStereo ? '' : 'rounded-b-2xl border border-white/10'}`}>
           {isStereo ? (
             <div className="flex w-full h-full">
               <div className="w-1/2 h-full border-r-4 border-black relative">
                  <Viewport isLeftEye={true} />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-bold tracking-widest uppercase pointer-events-none">Left Eye</div>
               </div>
               <div className="w-1/2 h-full relative">
                  <Viewport isLeftEye={false} />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-bold tracking-widest uppercase pointer-events-none">Right Eye</div>
               </div>
               
               {/* VR Alignment Line */}
               <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 z-40 pointer-events-none"></div>
             </div>
           ) : (
             <Viewport />
           )}
        </div>
      </div>
    </div>
  );
};
