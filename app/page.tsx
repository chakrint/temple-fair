"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TwinklingStars from "./TwinklingStars"; 
import { 
  Sparkles, LogOut, Star, Hand, Heart, Coins, Share2, User as UserIcon, X
} from "lucide-react";

// --- 1. Blockchain Config ---
const CONTRACT_ADDRESS = "PUT_YOUR_FINAL_CONTRACT_ADDRESS_HERE"; 
const DEV_WALLET = "PUT_YOUR_WALLET_ADDRESS_HERE"; 
const TOKEN_ADDRESS = "0x8a26fA986f360EA0B7CDad1E15C5698786b582BC"; 

// ABI
const CONTRACT_ABI = [
  "function catchStarFree() external",
  "function catchStarPaid() external",
  "function lastPlayed(address) view returns (uint256)"
];
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) external returns (bool)"
];

// --- 2. ข้อมูลของสะสม (Mapping รูปภาพ) ---
const REWARDS_DB = [
  // Common
  { id: 1, type: 'common', img: "/cloudpillow.png", name: { th: "หมอนเมฆนุ่มนิ่ม", en: "Cloud Pillow" } },
  { id: 2, type: 'common', img: "/starcandy.png", name: { th: "ลูกอมรสแสงดาว", en: "Star Candy" } },
  { id: 3, type: 'common', img: "/cozycandle.png", name: { th: "เทียนหอมอุ่นใจ", en: "Cozy Candle" } },
  { id: 4, type: 'common', img: "/MagicPlaster.png", name: { th: "พลาสเตอร์วิเศษ", en: "Magic Plaster" } },
  // Rare
  { id: 5, type: 'rare', img: "/pilotbear.png", name: { th: "หมีน้อยนักบิน", en: "Pilot Bear" } },
  { id: 6, type: 'rare', img: "/spaceducky.png", name: { th: "เป็ดก๊าบอวกาศ", en: "Space Ducky" } },
  { id: 7, type: 'rare', img: "/saturn.png", name: { th: "ดาวเสาร์เรืองแสง", en: "Glowing Saturn" } },
  // Legendary
  { id: 8, type: 'legendary', img: "/Spaceship.png", name: { th: "ยานอวกาศ DIY", en: "DIY Spaceship" } },
  { id: 9, type: 'legendary', img: "/BabyGoldDragon.png", name: { th: "มังกรน้อยเฝ้าทรัพย์", en: "Baby Gold Dragon" } },
  { id: 10, type: 'legendary', img: "/StardustCrown.png", name: { th: "มงกุฎดวงดาว", en: "Stardust Crown" } },
];

// --- 3. คลังคำอวยพร (Blessing Library) ---
const BLESSINGS = {
  common: [
    { th: "รอยยิ้มของคุณคือเครื่องสำอางที่สวยที่สุด ยิ้มเยอะๆ นะ", en: "Your smile is your best accessory. Wear it often." },
    { th: "พักผ่อนบ้างนะคนเก่ง วันนี้คุณทำดีที่สุดแล้ว", en: "Take a rest. You did your best today." },
    { th: "ความสุขเล็กๆ อยู่รอบตัว ลองมองหาดูสิ", en: "Little joys are everywhere. Look around." },
    { th: "ขอให้คืนนี้หลับฝันดี พรุ่งนี้ตื่นมาสดใสกว่าเดิม", en: "Sweet dreams. Wake up brighter tomorrow." },
    { th: "อุปสรรคมีไว้ให้ข้าม ไม่ได้มีไว้ให้แบก", en: "Obstacles are to be overcome, not carried." },
    { th: "กอดตัวเองแน่นๆ นะ คุณสมควรได้รับความรัก", en: "Hug yourself tight. You deserve love." },
    { th: "ฟ้าหลังฝนย่อมสวยงามเสมอ อดทนอีกนิดนะ", en: "Rainbows always follow the rain. Hang in there." }
  ],
  rare: [
    { th: "โอกาสดีๆ กำลังเดินทางมาหา เตรียมตัวให้พร้อม!", en: "Great opportunities are coming. Be ready!" },
    { th: "ความพยายามของคุณจะไม่สูญเปล่า ความสำเร็จรออยู่", en: "Your efforts are not in vain. Success awaits." },
    { th: "มิตรภาพที่ดีจะนำพาความโชคดีมาให้ รักษาเพื่อนดีๆ ไว้นะ", en: "Good friendship brings good luck. Cherish your friends." },
    { th: "การเปลี่ยนแปลงคือก้าวแรกของการเติบโต อย่ากลัวที่จะเริ่มใหม่", en: "Change is the first step of growth. Don't fear new beginnings." },
    { th: "เงินทองไหลมาเทมา ขอให้กระเป๋าตุงๆ นะ!", en: "May wealth flow to you. Wishing you prosperity!" }
  ],
  legendary: [
    { th: "ดั่งดวงดาราที่เจิดจรัส ช่วงเวลาแห่งความรุ่งโรจน์ของคุณได้มาถึงแล้ว!", en: "Like a shining star, your time of glory has arrived!" },
    { th: "พลังแห่งมังกรสถิตอยู่กับคุณ ไม่มีสิ่งใดที่คุณทำไม่ได้!", en: "The power of the dragon is with you. Nothing is impossible!" },
    { th: "โชคชะตาเข้าข้างคุณแล้ว จงกล้าที่จะฝันให้ใหญ่กว่าเดิม!", en: "Fortune favors you. Dare to dream bigger!" },
    { th: "คุณคือราชาในโลกของคุณเอง จงภูมิใจและเดินหน้าต่อไป!", en: "You are the king of your world. Be proud and move forward!" }
  ]
};

// Component: Drifting Text
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
  const [userName, setUserName] = useState(""); // ✅ เก็บชื่อผู้เล่น
  const [statusMsg, setStatusMsg] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetItem, setTargetItem] = useState<{ type: string, id?: number } | null>(null);
  
  // Reward State
  const [reward, setReward] = useState<any>(null);
  const [blessing, setBlessing] = useState<{th: string, en: string} | null>(null);

  const [stars, setStars] = useState<any[]>([]);

  // Setup Stars & Logic (เหมือนเดิม)
  useEffect(() => {
    const generateStar = (id: number) => {
      const types = ['float', 'float', 'flyRight', 'flyUp', 'curvePath'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      let duration = Math.random() * 20 + 5;
      return {
        id,
        left: Math.random() * 100, top: Math.random() * 100, 
        size: Math.random() * 1.5 + 0.8,
        animType: randomType, duration, delay: Math.random() * 10
      };
    };
    setStars(Array.from({ length: 35 }, (_, i) => generateStar(i)));
  }, []);

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

  const handleItemClick = async (type: 'star', id: number) => {
    if (!userAddress) { handleConnect(); return; }
    if (!userName) { 
        const name = prompt(lang === 'th' ? "กรุณาใส่ชื่อของคุณ:" : "Please enter your name:");
        if (name) setUserName(name);
        else return;
    }
    setTargetItem({ type, id });
    attemptCatch("FREE", type, id);
  };

  const attemptCatch = async (mode: "FREE" | "PAID", type: string, id?: number) => {
    setIsProcessing(true);
    setStatusMsg(mode === "FREE" ? "Trying free catch..." : "Premium Catch (1 SLG)...");

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

      if (mode === "FREE") {
        try {
            const tx = await contract.catchStarFree();
            await tx.wait();
            finalizeCatch(type, id);
        } catch (error) {
            setShowPayModal(true); 
            setIsProcessing(false);
            setStatusMsg("");
            return;
        }
      } else {
        const price = ethers.parseEther("1"); 
        const allowance = await token.allowance(userAddress, CONTRACT_ADDRESS);
        if (allowance < price) {
            setStatusMsg("Approving 1 SLG...");
            const txApprove = await token.approve(CONTRACT_ADDRESS, price);
            await txApprove.wait();
        }
        setStatusMsg("Catching...");
        const tx = await contract.catchStarPaid();
        await tx.wait();
        setShowPayModal(false);
        finalizeCatch(type, id);
      }
    } catch (err) {
      alert("Transaction Failed");
      setIsProcessing(false);
      setStatusMsg("");
    }
  };

  const finalizeCatch = (type: string, id?: number) => {
      if (type === 'star' && id !== undefined) {
        setStars((prev) => prev.filter((s) => s.id !== id));
      }

      // 1. สุ่มของรางวัล
      const rand = Math.random() * 100;
      let selectedId = 1;
      let rarity = "common";

      if (rand < 60) { selectedId = Math.floor(Math.random() * 4) + 1; rarity = "common"; }
      else if (rand < 90) { selectedId = Math.floor(Math.random() * 3) + 5; rarity = "rare"; }
      else { selectedId = Math.floor(Math.random() * 3) + 8; rarity = "legendary"; }

      const item = REWARDS_DB.find(r => r.id === selectedId);
      setReward(item);

      // 2. สุ่มคำอวยพรตามความหายาก
      const pool = BLESSINGS[rarity as keyof typeof BLESSINGS];
      const randomBlessing = pool[Math.floor(Math.random() * pool.length)];
      setBlessing(randomBlessing);

      setShowModal(true);
      setIsProcessing(false);
      setStatusMsg("");
  };

  // ✅ ฟังก์ชันแชร์
  const handleShare = () => {
    const text = lang === 'th'
        ? `ฉัน ${userName} ได้รับ "${reward.name.th}" จาก Galaxy Toys! 🧸✨\n"${blessing?.th}"\nมาเล่นด้วยกันสิ!`
        : `I, ${userName}, got "${reward.name.en}" from Galaxy Toys! 🧸✨\n"${blessing?.en}"\nJoin me now!`;
    
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
    window.open(url, '_blank');
  };

  const handleDonate = async () => { /* ... Logic เดิม ... */ };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden cursor-grab active:cursor-grabbing selection:bg-pink-500">
      <TwinklingStars />

      {/* Navbar with Name Input */}
      <header className="relative z-30 p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full border border-white/20">
            <Star className="text-yellow-300 fill-yellow-300" size={20} />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-pink-200">
              Star<span className="text-white">Catcher</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
            {/* ช่องกรอกชื่อ */}
            <div className="flex items-center bg-white/10 rounded-full px-3 py-1 border border-white/20">
                <UserIcon size={14} className="text-blue-200 mr-2" />
                <input 
                    type="text" 
                    placeholder={lang === 'th' ? "ชื่อของคุณ..." : "Your Name..."}
                    className="bg-transparent text-sm text-white focus:outline-none w-24 md:w-32 placeholder-white/50"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
            </div>

            <button onClick={toggleLang} className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-xs font-bold">
                {lang === 'th' ? "EN" : "TH"}
            </button>
            
            {!userAddress ? (
                <button onClick={handleConnect} className="px-4 py-2 bg-white text-black rounded-full font-bold text-xs">Connect</button>
            ) : (
                <button onClick={handleDisconnect} className="px-4 py-2 bg-white/10 rounded-full font-bold text-xs flex items-center gap-2 border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {userAddress.slice(0,4)}...
                </button>
            )}
        </div>
      </header>

      {/* Main Area */}
      <main className="relative z-20 w-full h-[85vh] flex flex-col items-center justify-start pt-12 text-center pointer-events-none">
        <div className="relative z-20">
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

        {/* Stars */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {stars.map((star) => (
                <button
                    key={star.id}
                    onClick={() => handleItemClick('star', star.id)}
                    disabled={isProcessing}
                    className="absolute pointer-events-auto outline-none group pause-on-hover hover:z-50 transition-all duration-300"
                    style={{ 
                        left: `${star.left}%`, top: `${star.top}%`,
                        animation: `${star.animType} ${star.duration}s infinite linear ${star.delay}s`
                    }}
                >
                    <Star size={24 * star.size} className="text-yellow-100 fill-yellow-50/50 group-hover:text-white group-hover:fill-white drop-shadow-[0_0_15px_rgba(255,255,0,0.6)]" strokeWidth={1.5} />
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

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in">
            <div className="bg-gradient-to-b from-gray-900 to-black border border-yellow-500/30 p-8 rounded-3xl max-w-sm text-center shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">{lang === 'th' ? "โควต้าฟรีหมดแล้ว!" : "Free Quota Used!"}</h3>
                <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowPayModal(false)} className="flex-1 py-3 border border-gray-600 rounded-xl text-gray-400 text-sm font-bold">{lang === 'th' ? "รอดีกว่า" : "Wait"}</button>
                    <button onClick={() => attemptCatch("PAID", "star", targetItem?.id)} className="flex-1 py-3 bg-yellow-500 text-black rounded-xl text-sm font-bold">{lang === 'th' ? "ใช้ 1 SLG" : "Pay 1 SLG"}</button>
                </div>
            </div>
        </div>
      )}

      {/* ✅ Reward Modal (รูปจริง + คำอวยพร + ปุ่มแชร์) */}
      {showModal && reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm text-center relative shadow-[0_0_60px_rgba(255,255,255,0.2)] transform scale-100 animate-bounce-slow overflow-visible border-4 border-gray-200">
            
            {/* ปุ่มปิด */}
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>

            {/* 🖼️ รูปของรางวัล (Image Asset) */}
            <div className="mt-4 mb-4 flex justify-center">
                <div className="relative w-48 h-48 drop-shadow-2xl hover:scale-110 transition-transform duration-500">
                    <img src={reward.img} alt="Reward" className="w-full h-full object-contain filter drop-shadow-lg" />
                    <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-spin-slow" size={32} />
                </div>
            </div>

            {/* ชื่อของรางวัล */}
            <h2 className="text-2xl font-black mb-2 text-gray-800">
                {lang === 'th' ? reward.name.th : reward.name.en}
            </h2>

            {/* 💌 คำอวยพร (Personalized) */}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6 relative">
                <p className="text-gray-600 text-sm font-medium italic leading-relaxed">
                    "{userName ? `${userName}, ` : ""}
                    {lang === 'th' ? blessing?.th : blessing?.en}"
                </p>
            </div>

            {/* ปุ่มกด */}
            <div className="flex gap-3">
                <button onClick={handleShare} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-md">
                    <Share2 size={18} /> {lang === 'th' ? "แชร์" : "Share"}
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-md">
                    {lang === 'th' ? "เก็บใส่กระเป๋า" : "Keep it"}
                </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .pause-on-hover:hover { animation-play-state: paused !important; }
        @keyframes float { 0% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, -15px) rotate(5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
        @keyframes flyRight { 0% { transform: translate(-10vw, 0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(100vw, 20px); opacity: 0; } }
        @keyframes flyUp { 0% { transform: translate(0, 100vh); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(-20px, -20vh); opacity: 0; } }
        @keyframes curvePath { 0% { transform: translate(-50px, 0); opacity: 0; } 20% { opacity: 1; } 50% { transform: translate(30vw, -100px); } 80% { opacity: 1; } 100% { transform: translate(60vw, 50px); opacity: 0; } }
      `}</style>
    </div>
  );
}
