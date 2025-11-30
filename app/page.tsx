"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TwinklingStars from "./TwinklingStars"; 
import { 
  Sparkles, LogOut, Star, 
  Cloud, Candy, Flame, Stethoscope, 
  Cat, Bird, Sprout, 
  Rocket, Zap, Crown, 
  Hand, Sun, Moon, Circle 
} from "lucide-react";

// --- 1. Blockchain Config ---
const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"; 
const CONTRACT_ABI = [
  "function catchStar() external"
];

// --- 2. ข้อมูลของสะสม ---
const REWARDS_DB = [
  // Common
  { id: 1, type: 'common', icon: Cloud, color: 'text-blue-300', name: { th: "หมอนเมฆนุ่มนิ่ม", en: "Cloud Pillow" }, desc: { th: "ขอให้คืนนี้หลับฝันดี ทิ้งความกังวลไว้ข้างหลัง", en: "Sweet dreams tonight. Leave your worries behind." } },
  { id: 2, type: 'common', icon: Candy, color: 'text-pink-400', name: { th: "ลูกอมรสแสงดาว", en: "Starlight Candy" }, desc: { th: "เติมความหวานให้ชีวิตสักนิด ยิ้มเข้าไว้นะ", en: "Add some sweetness to life. Keep smiling!" } },
  { id: 3, type: 'common', icon: Flame, color: 'text-orange-300', name: { th: "เทียนหอมอุ่นใจ", en: "Cozy Candle" }, desc: { th: "แสงสว่างดวงเล็กๆ จะคอยเป็นเพื่อนคุณเสมอ", en: "A small light of hope will always be with you." } },
  { id: 4, type: 'common', icon: Stethoscope, color: 'text-red-300', name: { th: "พลาสเตอร์วิเศษ", en: "Magic Plaster" }, desc: { th: "เป่าเพี้ยง! ความเจ็บปวดจงหายไป", en: "Pain, pain go away! Heal quickly." } },
  // Rare
  { id: 5, type: 'rare', icon: Cat, color: 'text-yellow-600', name: { th: "หมีน้อยนักบิน", en: "Pilot Bear" }, desc: { th: "กัปตันหมีรายงานตัว! ผมจะนั่งข้างๆ คุณเอง", en: "Captain Bear reporting! I'll sit right by your side." } },
  { id: 6, type: 'rare', icon: Bird, color: 'text-yellow-300', name: { th: "เป็ดก๊าบอวกาศ", en: "Space Ducky" }, desc: { th: "ลอยตุ๊บป่องแบบชิลๆ ปล่อยเบลอบ้างก็ได้นะ", en: "Floating casually... Sometimes just let things be." } },
  { id: 7, type: 'rare', icon: Sprout, color: 'text-green-400', name: { th: "ต้นกล้ากาแล็กซี", en: "Galaxy Sprout" }, desc: { th: "ความฝันของคุณกำลังเติบโต รดน้ำด้วยความตั้งใจนะ", en: "Your dreams are growing. Water them with care." } },
  // Legendary
  { id: 8, type: 'legendary', icon: Rocket, color: 'text-purple-500', name: { th: "ยานอวกาศ DIY", en: "DIY Spaceship" }, desc: { th: "ไม่มีฝันไหนใหญ่เกินเอื้อม! ลุยเลย!", en: "No dream is too big! Let's go!" } },
  { id: 9, type: 'legendary', icon: Zap, color: 'text-yellow-500', name: { th: "มังกรน้อยเฝ้าทรัพย์", en: "Baby Gold Dragon" }, desc: { th: "พลังมังกรทองสถิต! รับความโชคดีไปเลย!", en: "Gold Dragon Power! Luck is coming your way!" } },
  { id: 10, type: 'legendary', icon: Crown, color: 'text-yellow-400', name: { th: "มงกุฎดวงดาว", en: "Stardust Crown" }, desc: { th: "จงภูมิใจในตัวเอง คุณคือราชาในโลกของคุณ", en: "Be proud. You are the ruler of your own world." } },
];

const DriftingText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [mounted, setMounted] = useState(false);
  const [driftStyles, setDriftStyles] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setMounted(true);
    setDriftStyles({ x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 });
  }, []);
  return (
    <div className={`transition-all duration-[2000ms] ease-out will-change-transform ${className}`} 
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? `translate(${driftStyles.x}px, ${driftStyles.y}px)` : 'translate(0, 0)' }}>
      {children}
    </div>
  );
};

export default function StarCatcherApp() {
  const [lang, setLang] = useState<"th" | "en">("en");
  const [userAddress, setUserAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reward, setReward] = useState<any>(null);
  
  // --- Game State ---
  const [stars, setStars] = useState<any[]>([]);
  
  // Sun State
  const [isSunBig, setIsSunBig] = useState(false); // สถานะดวงอาทิตย์โต
  const [sunTimer, setSunTimer] = useState(0);

  // Moon State
  const [moonRotation, setMoonRotation] = useState(0); // องศาการหมุน
  const [isFullMoon, setIsFullMoon] = useState(false); // สถานะจันทร์เต็มดวง

  // 1. Setup Stars (Random Speed & Direction)
  useEffect(() => {
    const newStars = Array.from({ length: 40 }, (_, i) => {
      const types = ['float', 'float', 'flyRight', 'flyUp', 'curvePath'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      // ✅ สุ่มความเร็ว (5s - 25s) ให้แตกต่างกันชัดเจน
      let duration = Math.random() * 20 + 5; 

      return {
        id: i,
        left: Math.random() * 100, 
        top: Math.random() * 100, 
        size: Math.random() * 1.5 + 0.8,
        animType: randomType,
        duration: duration,
        delay: Math.random() * 10 
      };
    });
    setStars(newStars);
  }, []);

  // 2. Sun Logic (Loop ทุก 2 นาที + เปิดครั้งแรก)
  useEffect(() => {
    // ฟังก์ชันขยายดวงอาทิตย์
    const activateSun = () => {
      setIsSunBig(true);
      setTimeout(() => setIsSunBig(false), 5000); // ขยาย 5 วินาทีแล้วหด
    };

    // ทำทันทีเมื่อเปิดเว็บ
    activateSun();

    // ทำซ้ำทุก 2 นาที (120,000 ms)
    const interval = setInterval(activateSun, 120000);
    return () => clearInterval(interval);
  }, []);

  // 3. Moon Logic (หมุนครบ 1 นาที -> เต็มดวง 5 วิ)
  useEffect(() => {
    const interval = setInterval(() => {
      setMoonRotation((prev) => {
        if (prev >= 360) {
          // ครบรอบ (1 นาที) -> เป็น Full Moon
          setIsFullMoon(true);
          setTimeout(() => {
            setIsFullMoon(false);
            setMoonRotation(0); // Reset กลับไปหมุนใหม่
          }, 5000); // เป็น Full Moon 5 วินาที
          return 360; 
        }
        return isFullMoon ? 360 : prev + 6; // หมุนทีละ 6 องศา (6 * 60วิ = 360)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFullMoon]);


  // Web3 Connection
  const handleConnect = async () => {
    if ((window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
      } catch (err) { alert("Connection Failed"); }
    } else { alert("Please install Wallet!"); }
  };
  const handleDisconnect = () => setUserAddress("");
  const toggleLang = () => setLang(prev => prev === "th" ? "en" : "th");

  // --- Main Gameplay Function ---
  const catchItem = async (type: 'star' | 'sun' | 'moon', id?: number) => {
    if (!userAddress) { handleConnect(); return; }
    
    // เช็คเงื่อนไขพิเศษ
    if (type === 'sun' && !isSunBig) return; // ถ้าอาทิตย์ไม่ใหญ่ กดไม่ได้
    if (type === 'moon' && !isFullMoon) return; // ถ้าไม่เต็มดวง กดไม่ได้

    setIsProcessing(true);
    setStatusMsg(lang === 'th' ? "กำลังคว้า..." : "Catching...");

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.catchStar(); // ใช้ฟังก์ชันเดิม (ประหยัด Gas)
      setStatusMsg(lang === 'th' ? "จับได้แล้ว! กำลังลุ้น..." : "Caught! Opening...");
      await tx.wait();

      // ลบดาวออกจากจอ (ถ้าเป็นดาว)
      if (type === 'star' && id !== undefined) {
        setStars((prev) => prev.filter((s) => s.id !== id));
      } else if (type === 'sun') {
        setIsSunBig(false); // จับอาทิตย์ได้แล้ว หดทันที
      } else if (type === 'moon') {
        setIsFullMoon(false); // จับจันทร์ได้แล้ว กลับไปหมุนต่อ
      }

      // --- Logic การสุ่มของรางวัล (จำลองหน้าบ้าน) ---
      let selectedId = 1;
      const rand = Math.random() * 100;

      if (type === 'sun') {
        // ☀️ อาทิตย์ = การันตี Legendary (8-10)
        selectedId = Math.floor(Math.random() * 3) + 8;
      } else if (type === 'moon') {
        // 🌙 จันทร์ = การันตี Rare ขึ้นไป (5-10)
        selectedId = Math.floor(Math.random() * 6) + 5;
      } else {
        // ⭐ ดาวปกติ = สุ่มตามเรทปกติ (เน้น Common)
        if (rand < 70) selectedId = Math.floor(Math.random() * 4) + 1;
        else if (rand < 95) selectedId = Math.floor(Math.random() * 3) + 5;
        else selectedId = Math.floor(Math.random() * 3) + 8;
      }

      const item = REWARDS_DB.find(r => r.id === selectedId);
      setReward(item);
      setShowModal(true);

    } catch (err: any) {
      console.error(err);
      alert("Oops! Something went wrong.");
    } finally {
      setIsProcessing(false);
      setStatusMsg("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden cursor-grab active:cursor-grabbing selection:bg-pink-500">
      
      <TwinklingStars />

      {/* Navbar */}
      <header className="relative z-30 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
            <Star className="text-yellow-300 fill-yellow-300" size={20} />
          </div>
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-pink-200">
            Star<span className="text-white">Catcher</span>
          </h1>
        </div>
        <div className="flex gap-3">
            <button onClick={toggleLang} className="px-3 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-xs font-bold transition-all">
                {lang === 'th' ? "EN" : "TH"}
            </button>
            {!userAddress ? (
            <button onClick={handleConnect} className="px-5 py-2 bg-white text-black rounded-full font-bold text-xs hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg">
                {lang === 'th' ? "Connect" : "Connect"}
            </button>
            ) : (
            <button onClick={handleDisconnect} className="px-4 py-2 bg-white/10 rounded-full font-bold text-xs flex items-center gap-2 border border-white/20 hover:bg-red-500/20 group transition-all">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse group-hover:bg-red-400"></div>
                {userAddress.slice(0,6)}... <LogOut size={12} className="hidden group-hover:block" />
            </button>
            )}
        </div>
      </header>

      {/* Main Sky Area */}
      <main className="relative z-20 w-full h-[85vh] flex flex-col items-center justify-start pt-12 text-center pointer-events-none">
        
        {/* Title */}
        <div className="relative z-20 mb-8">
             <DriftingText className="mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-wide">
                    {lang === 'th' ? "อธิษฐาน แล้วคว้าดาวเลย!" : "Make a Wish & Catch a Star"}
                </h2>
             </DriftingText>
             <DriftingText>
                <p className="text-blue-100/70 text-sm max-w-sm mx-auto font-light tracking-wider">
                    {lang === 'th' ? "กดที่ดาวเพื่อรับของขวัญและคำอวยพร" : "Pick a star to receive a gift and blessing"}
                </p>
             </DriftingText>
        </div>

        {/* ☀️ The SUN (ซ้ายบน) */}
        <div className="absolute top-10 left-4 md:left-20 pointer-events-auto z-40">
            <button 
                onClick={() => catchItem('sun')}
                disabled={isProcessing}
                className={`transition-all duration-500 flex flex-col items-center group
                    ${isSunBig ? 'scale-150 cursor-pointer' : 'scale-75 cursor-default opacity-50 grayscale-[50%]'}
                `}
            >
                <Sun 
                    size={64} 
                    className={`
                        ${isSunBig ? 'text-orange-400 fill-yellow-500 animate-spin-slow drop-shadow-[0_0_30px_rgba(255,165,0,0.8)]' : 'text-yellow-700 fill-yellow-900'}
                    `} 
                />
                {isSunBig && (
                    <span className="mt-2 text-[8px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                        JACKPOT!
                    </span>
                )}
            </button>
        </div>

        {/* 🌙 The MOON (ขวาบน) */}
        <div className="absolute top-10 right-4 md:right-20 pointer-events-auto z-40">
            <button 
                onClick={() => catchItem('moon')}
                disabled={isProcessing}
                className={`transition-all duration-700 flex flex-col items-center group
                    ${isFullMoon ? 'scale-125 cursor-pointer' : 'scale-90 cursor-default opacity-80'}
                `}
                style={{ transform: isFullMoon ? 'none' : `rotate(${moonRotation}deg)` }}
            >
                {isFullMoon ? (
                    // Full Moon
                    <>
                        <Circle size={56} className="text-yellow-100 fill-yellow-50 drop-shadow-[0_0_25px_rgba(255,255,200,0.8)] animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-black text-yellow-900">OPEN</span>
                        </div>
                    </>
                ) : (
                    // Crescent Moon
                    <Moon size={48} className="text-blue-200 fill-blue-900/50" />
                )}
            </button>
        </div>

        {/* ⭐ Floating Stars (Buttons) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {stars.map((star) => (
                <button
                    key={star.id}
                    onClick={() => catchItem('star', star.id)}
                    disabled={isProcessing}
                    className="absolute pointer-events-auto outline-none group pause-on-hover hover:z-50 transition-transform duration-300"
                    style={{ 
                        left: `${star.left}%`, 
                        top: `${star.top}%`,
                        // ✅ สุ่มความเร็ว (Duration) ให้แต่ละดวงไม่เท่ากัน
                        animation: `${star.animType} ${star.duration}s infinite linear ${star.delay}s`
                    }}
                >
                    <Star 
                        size={24 * star.size} 
                        className={`
                            drop-shadow-[0_0_15px_rgba(255,255,0,0.6)]
                            ${star.animType === 'flyRight' || star.animType === 'flyUp' ? 'text-cyan-100 fill-white animate-pulse' : 'text-yellow-100 fill-yellow-50/50'}
                            group-hover:text-white group-hover:fill-white group-hover:scale-125
                            transition-all duration-200
                        `} 
                        strokeWidth={1.5}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -bottom-1 -right-1 transition-opacity duration-200 pointer-events-none">
                        <Hand className="text-white drop-shadow-md rotate-[-20deg]" size={20} />
                    </div>
                </button>
            ))}
        </div>

        {/* Loading */}
        {isProcessing && (
            <div className="absolute bottom-20 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-30">
                <Sparkles className="animate-spin text-yellow-400 w-4 h-4" />
                <span className="font-mono text-yellow-100 text-xs">{statusMsg}</span>
            </div>
        )}

      </main>

      {/* Reward Modal */}
      {showModal && reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white text-gray-900 rounded-[2rem] p-8 w-full max-w-sm text-center relative shadow-[0_0_60px_rgba(255,255,255,0.4)] transform scale-100 animate-bounce-slow overflow-visible border-4 border-white/50">
            
            <div className="absolute -top-4 right-8 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                {reward.type}
            </div>

            <div className="mb-6 mt-2 flex justify-center">
                <div className={`p-6 rounded-full bg-gray-50 border-4 border-gray-100 shadow-inner ${reward.color}`}>
                    <reward.icon size={80} strokeWidth={1.5} />
                </div>
            </div>

            <h2 className={`text-2xl font-black mb-2 ${reward.color} drop-shadow-sm`}>
                {lang === 'th' ? reward.name.th : reward.name.en}
            </h2>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8 relative">
                <div className="absolute -top-3 left-4 text-4xl text-gray-200">“</div>
                <p className="text-gray-600 text-sm font-medium italic leading-relaxed relative z-10">
                    {lang === 'th' ? reward.desc.th : reward.desc.en}
                </p>
                <div className="absolute -bottom-6 right-4 text-4xl text-gray-200">”</div>
            </div>

            <button 
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black hover:scale-[1.02] transition-all shadow-lg text-lg flex items-center justify-center gap-2"
            >
                <Sparkles size={18} /> {lang === 'th' ? "เก็บใส่กระเป๋า" : "Keep it"}
            </button>
          </div>
        </div>
      )}

      {/* ✅ CSS Animation */}
      <style jsx global>{`
        .pause-on-hover:hover { animation-play-state: paused !important; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, -15px) rotate(5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
        @keyframes flyRight { 0% { transform: translate(-10vw, 0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(100vw, 20px); opacity: 0; } }
        @keyframes flyUp { 0% { transform: translate(0, 100vh); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(-20px, -20vh); opacity: 0; } }
        @keyframes curvePath { 0% { transform: translate(-50px, 0); opacity: 0; } 20% { opacity: 1; } 50% { transform: translate(30vw, -100px); } 80% { opacity: 1; } 100% { transform: translate(60vw, 50px); opacity: 0; } }
      `}</style>
    </div>
  );
}
