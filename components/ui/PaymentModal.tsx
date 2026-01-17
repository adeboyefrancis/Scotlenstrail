
import React, { useState, useEffect } from 'react';
import { 
  X, CreditCard, ShieldCheck, Lock, Loader2, CheckCircle2, 
  Apple, Landmark, Sparkles, Globe, CreditCard as VisaIcon, 
  Zap, ChevronRight
} from 'lucide-react';
import { Trail, Accommodation } from '../../types';
import { stripeService } from '../../services/stripeService';

interface PaymentModalProps {
  item: Trail | Accommodation;
  type: 'trail' | 'accommodation';
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ item, type, onClose, onSuccess }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'klarna' | 'amex' | 'apple'>('card');
  const [isInitializing, setIsInitializing] = useState(true);

  // Constants - Strictly enforcing GBP
  const isTrail = type === 'trail';
  const currency = 'GBP'; 
  const price = isTrail 
    ? (item as Trail).price 
    : (item as Accommodation).pricePerNight * 1; 

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStripePayment = async () => {
    setStep('processing');
    
    try {
      // Strictly using GBP for the live Stripe interaction
      const result = await stripeService.initiateStripeCheckout(price, 'GBP');
      if (result.success) {
        setTimeout(() => {
          setStep('success');
          setTimeout(() => onSuccess(), 2500);
        }, 1500);
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Payment failed. Please check your account details.");
      setStep('details');
    }
  };

  const getTitle = () => isTrail ? (item as Trail).title : (item as Accommodation).name;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row h-full max-h-[640px] border border-white/10 relative scale-in-center">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: Order Summary */}
        <div className="w-full md:w-5/12 bg-slate-50 dark:bg-white/5 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5">
           <div>
              <div className="flex items-center gap-2 text-scot-blue mb-10">
                 <div className="p-2.5 bg-scot-blue rounded-xl shadow-lg shadow-scot-blue/20">
                    <Globe className="w-6 h-6 text-white" />
                 </div>
                 <span className="font-serif font-bold text-xl text-slate-900 dark:text-white">ScotLens</span>
              </div>

              <div className="space-y-8">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Order Details</span>
                    <div className="flex items-center gap-4">
                       <img 
                        src={item.imageUrl} 
                        className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-xl" 
                        alt="" 
                       />
                       <div>
                          <h4 className="font-bold text-sm leading-tight line-clamp-2 mb-1">{getTitle()}</h4>
                          <span className="text-[10px] text-scot-blue font-black uppercase tracking-widest">
                            {isTrail ? 'AR Expedition Pass' : 'Stay Reservation'}
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-xs text-slate-500">Subtotal (GBP)</span>
                       <span className="text-xs font-bold">{stripeService.formatCurrency(price, 'GBP')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-xs text-slate-500">Digital Service Tax</span>
                       <span className="text-xs font-black text-green-500 uppercase tracking-widest">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                       <span className="text-sm font-bold">Total</span>
                       <span className="text-2xl font-black text-scot-blue">
                         {stripeService.formatCurrency(price, 'GBP')}
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="hidden md:flex items-center gap-2.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <ShieldCheck className="w-5 h-5 text-scot-blue" />
              Secure live checkout
           </div>
        </div>

        {/* RIGHT PANEL: Multi-method Form */}
        <div className="w-full md:w-7/12 p-10 flex flex-col justify-center bg-white dark:bg-[#0f172a]">
           {isInitializing ? (
             <div className="flex flex-col items-center justify-center gap-5 py-16">
                <Loader2 className="w-12 h-12 text-scot-blue animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Stripe Elements...</p>
             </div>
           ) : step === 'details' ? (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <h3 className="font-bold text-xl">Payment Method</h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setPaymentMethod('card')}
                     className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'border-scot-blue bg-scot-blue/5 text-scot-blue shadow-lg shadow-scot-blue/5' : 'border-slate-100 dark:border-white/5 text-slate-500 hover:border-scot-blue/30'}`}
                   >
                     <VisaIcon className="w-6 h-6 mb-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Visa / MC</span>
                   </button>
                   <button 
                     onClick={() => setPaymentMethod('apple')}
                     className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'apple' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xl' : 'border-slate-100 dark:border-white/5 text-slate-500 hover:border-black/30'}`}
                   >
                     <Apple className="w-6 h-6 mb-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Apple Pay</span>
                   </button>
                   <button 
                     onClick={() => setPaymentMethod('amex')}
                     className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'amex' ? 'border-scot-blue bg-scot-blue/5 text-scot-blue shadow-lg shadow-scot-blue/5' : 'border-slate-100 dark:border-white/5 text-slate-500 hover:border-scot-blue/30'}`}
                   >
                     <Landmark className="w-6 h-6 mb-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Amex</span>
                   </button>
                   <button 
                     onClick={() => setPaymentMethod('klarna')}
                     className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'klarna' ? 'border-[#ffb3c7] bg-[#ffb3c7]/5 text-[#ff3d77] shadow-lg shadow-[#ffb3c7]/5' : 'border-slate-100 dark:border-white/5 text-slate-500 hover:border-[#ffb3c7]/30'}`}
                   >
                     <Zap className="w-6 h-6 mb-2" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Klarna</span>
                   </button>
                </div>

                <div className="space-y-6">
                   {paymentMethod === 'apple' ? (
                     <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-3xl text-center">
                        <Apple className="w-10 h-10 mx-auto mb-3 text-slate-900 dark:text-white" />
                        <h4 className="text-sm font-bold">Secure Apple Checkout</h4>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Use Touch ID or Face ID to confirm in GBP.</p>
                     </div>
                   ) : paymentMethod === 'klarna' ? (
                     <div className="bg-[#ffb3c7]/10 border border-[#ffb3c7]/20 p-6 rounded-3xl text-center">
                        <Zap className="w-10 h-10 text-[#ff3d77] mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Klarna Interest-Free</h4>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Split your {stripeService.formatCurrency(price, 'GBP')} total into 3 monthly payments.</p>
                     </div>
                   ) : (
                     <>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Card Verification (Simulation)</label>
                            <div className="relative">
                               <input 
                                  type="text" 
                                  disabled 
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-mono tracking-widest focus:outline-none"
                                  defaultValue={paymentMethod === 'amex' ? "3742 ••••• ••1005" : "4242 •••• •••• 4242"}
                               />
                               <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-scot-blue" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" disabled className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-mono" defaultValue="12 / 27" />
                            <input type="text" disabled className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-mono" defaultValue="•••" />
                          </div>
                        </div>
                     </>
                   )}
                </div>

                <div className="pt-2">
                   <button 
                    onClick={handleStripePayment}
                    className={`w-full group font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[2rem] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 ${
                      paymentMethod === 'apple' 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'bg-scot-blue hover:bg-blue-600 text-white shadow-scot-blue/30'
                    }`}
                   >
                     {paymentMethod === 'apple' ? 'Pay with' : 'Pay'} 
                     {paymentMethod === 'apple' && <Apple className="w-5 h-5 mb-0.5" />}
                     {!['apple'].includes(paymentMethod) && stripeService.formatCurrency(price, 'GBP')}
                     {!['apple'].includes(paymentMethod) && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                   </button>
                </div>

                <div className="flex items-center justify-center gap-6 py-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4" alt="Stripe" />
                   <div className="h-4 w-px bg-slate-300 dark:bg-white/10"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">PCI Secure v4.0</span>
                </div>
             </div>
           ) : step === 'processing' ? (
              <div className="py-16 flex flex-col items-center justify-center text-center h-full animate-in fade-in duration-500">
                 <div className="relative w-24 h-24 mb-10">
                    <Loader2 className="w-full h-full text-scot-blue animate-spin stroke-[3px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Lock className="w-8 h-8 text-scot-blue opacity-20" />
                    </div>
                 </div>
                 <h4 className="text-2xl font-bold mb-3">Authorizing GBP</h4>
                 <p className="text-slate-400 text-xs max-w-[220px] mx-auto leading-relaxed">Connecting to the live Stripe network for secure Pound Sterling authorization...</p>
              </div>
           ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center h-full animate-in zoom-in duration-500">
                 <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 text-white shadow-2xl shadow-green-500/30">
                    <CheckCircle2 className="w-12 h-12 stroke-[3px]" />
                 </div>
                 <h4 className="text-3xl font-black mb-3">Success!</h4>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 leading-relaxed px-6">
                   Your payment in Pounds Sterling has been processed. 
                   {isTrail ? " Trail expedition pass is now active in your hub." : " Your Highland stay reservation is confirmed."}
                 </p>
                 <div className="w-full bg-slate-50 dark:bg-white/5 p-5 rounded-3xl flex items-center justify-between border border-slate-100 dark:border-white/5">
                    <div className="text-left">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Receipt Ref.</span>
                       <span className="text-[10px] font-mono font-bold text-scot-blue">SL-GBP-LIVE-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-scot-blue opacity-40" />
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
