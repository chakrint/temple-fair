"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TwinklingStars from "./TwinklingStars"; 
import { 
  Sparkles, Wallet, LogOut, Star, 
  Cloud, Candy, Flame, Stethoscope, // Common
  Cat, Bird, Sprout, // Rare (ใช้ Cat แทน Bear, Bird แทน Duck แก้ขัด icon)
  Rocket, Zap, Crown, // Legendary
  Hand // Icon มือ
} from "lucide-react";

// --- 1. Blockchain Config ---
const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"; // ✅ ตู้ Star Catcher ของคุณ

const CONTRACT_ABI = [
  "function catchStar() external"
];

// --- 2. ข้อมูลของสะสม & คำอวยพร (10 อย่าง) ---
const REWARDS_DB = [
  // 🟢 Common (ID 1-4)
  { id: 1, type: 'common', icon: Cloud, color: 'text-blue-300', 
    name: { th: "หมอนเมฆนุ่มนิ่ม", en: "Cloud Pillow" },
    desc: { th: "ขอให้คืนนี้หลับฝันดี ทิ้งความกังวลไว้ข้างหลัง พรุ่งนี้จะเป็นวันที่สดใสของคุณแน่นอน", en: "Sweet dreams tonight. Leave your worries behind, tomorrow will be bright." } 
  },
  { id: 2, type: 'common', icon: Candy, color: 'text-pink-400', 
    name: { th: "ลูกอมรสแสงดาว", en: "Starlight Candy" },
    desc: { th: "เติมความหวานให้ชีวิตสักนิด ยิ้มเข้าไว้นะ วันนี้คุณเก่งมากแล้วรู้ไหม?", en: "Add some sweetness to life. Keep smiling, you did great today!" } 
  },
  { id: 3, type: 'common', icon: Flame, color: 'text-orange-300', 
    name: { th: "เทียนหอมอุ่นใจ", en: "Cozy Candle" },
    desc: { th: "แม้ในคืนที่มืดมิดที่สุด แสงสว่างดวงเล็กๆ จากความหวัง จะคอยเป็นเพื่อนคุณเสมอ", en: "Even in the darkest night, a small light of hope will always be with you." } 
  },
  { id: 4, type: 'common', icon: Stethoscope, color: 'text-red-300', // ใช้ Stethoscope แทน Plaster
    name: { th: "พลาสเตอร์วิเศษ", en: "Magic Plaster" },
    desc: { th: "เป่าเพี้ยง! ความเจ็บปวดจงหายไป ขอให้หัวใจของคุณกลับมาแข็งแรงไวๆ นะ", en: "Pain, pain go away! May your heart be strong and heal quickly." } 
  },
  // 🔵 Rare (ID 5-7)
  { id: 5, type: 'rare', icon: Cat, color: 'text-yellow-600', // ใช้ Cat แทน Bear
    name: { th: "หมีน้อยนักบิน", en: "Pilot Bear" },
    desc: { th: "กัปตันหมีรายงานตัว! ไม่ว่าจะเจอพายุลูกใหญ่แค่ไหน ผมจะนั่งข้างๆ คุณเอง", en: "Captain Bear reporting! No matter the storm, I'll sit right by your side." } 
  },
  { id: 6, type: 'rare', icon: Bird, color: 'text-yellow-300', // ใช้ Bird แทน Duck
    name: { th: "เป็ดก๊าบอวกาศ", en: "Space Ducky" },
    desc: { th: "ลอยตุ๊บป่องแบบชิลๆ บางเรื่องในชีวิต ปล่อยเบลอบ้างก็ได้นะ", en: "Floating casually... Sometimes it's okay to just let things be." } 
  },
  { id: 7, type: 'rare', icon: Sprout, color: 'text-green-400', 
    name: { th: "ต้นกล้ากาแล็กซี", en: "Galaxy Sprout" },
    desc: { th: "ความฝันของคุณกำลังเติบโต รดน้ำด้วยความตั้งใจ แล้วรอดูวันที่มันบานสะพรั่งนะ", en: "Your dreams are growing. Water them with care and watch them bloom." } 
  },
  // 🟡 Legendary (ID 8-10)
  { id: 8, type: 'legendary', icon: Rocket, color: 'text-purple-500', 
    name: { th: "ยานอวกาศ DIY", en: "DIY Spaceship" },
    desc: { th: "ไม่มีฝันไหนใหญ่เกินเอื้อม! ยานลำนี้สร้างด้วยมือและหัวใจ มันจะพาคุณบินไปได้ไกลเท่าที่ใจฝัน", en: "No dream is too big! Built with heart, this ship will take you as far as you dare to dream." } 
  },
  { id: 9, type: 'legendary', icon: Zap, color: 'text-yellow-500', // ใช้ Zap แทน Dragon (พลัง)
    name: { th: "มังกรน้อยเฝ้าทรัพย์", en: "Baby Gold Dragon" },
    desc: { th: "พลังมังกรทองสถิต! เตรียมตัวรับความโชคดีและความมั่งคั่งที่กำลังพุ่งชนคุณอย่างจัง!", en: "Gold Dragon Power! Get ready for luck and prosperity coming your way!" } 
  },
  { id: 10, type: 'legendary', icon: Crown, color: 'text-yellow-400', 
    name: { th: "มงกุฎดวงดาว", en: "Stardust Crown" },
    desc: { th: "จงภูมิใจในตัวเอง เชื่อมั่นในคุณค่าที่มี เพราะคุณคือราชาในโลกของคุณเองเสมอ", en: "Be proud of who you are. You are always the ruler of your own world." } 
  },
];

export default function StarCatcherApp() {
  const [lang, setLang] = useState<"th" | "en">("en");
  const [userAddress, setUserAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reward, setReward] = useState<any>(null);

  // สร้างตำแหน่งดาว 20 ดวง (สุ่มตำแหน่ง)
  const [stars, setStars] = useState<{id: number, x: number, y: number, size: number}[]>([]);

  useEffect(() => {
    // Generate Stars positions once
    const newStars = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // 10% - 90%
      y: Math.random() * 60 + 10,
      size: Math.random() * 1.5 + 1 // Scale size
    }));
    setStars(newStars);
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

  // ฟังก์ชันจับดาว
  const catchStar = async () => {
    if (!userAddress) { handleConnect(); return; }
    setIsProcessing(true);
    setStatusMsg(lang === 'th' ? "กำลังเอื้อมมือไปจับ..." : "Reaching for the stars...");

    try {
      // 1. เรียก Blockchain
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.catchStar();
      setStatusMsg(lang === 'th' ? "จับได้แล้ว! กำลังแกะของขวัญ..." : "Star caught! Opening...");
      await tx.wait();

      // 2. จำลองการสุ่มของรางวัลหน้าบ้าน (เพื่อให้ UI แสดงผลทันที)
      // (ของจริง User ได้ NFT เข้ากระเป๋าไปแล้วตาม Logic Contract)
      const rand = Math.floor(Math.random() * 100);
      let selectedId = 1;
      if (rand < 60) selectedId = Math.floor(Math.random() * 4) + 1; // Common 1-4
      else if (rand < 90) selectedId = Math.floor(Math.random() * 3) + 5; // Rare 5-7
      else selectedId = Math.floor(Math.random() * 3) + 8; // Legendary 8-10

      const item = REWARDS_DB.find(r => r.id === selectedId);
      setReward(item);
      setShowModal(true);

    } catch (err: any) {
      console.error(err);
      const msg = err.reason || err.message;
      if (msg.includes("cooldown")) {
        alert(lang === 'th' ? "พักเหนื่อยก่อนนะ พรุ่งนี้ค่อยมาจับใหม่!" : "Please wait! Come back tomorrow.");
      } else {
        alert("Oops! Something went wrong.");
      }
    } finally {
      setIsProcessing(false);
      setStatusMsg("");
    }
  };

  return (
    // Cursor: Grab (มือแบ)
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white font-sans relative overflow-hidden cursor-grab active:cursor-grabbing selection:bg-pink-500">
      
      <TwinklingStars />

      {/* Navbar */}
      <header className="relative z-20 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Star className="text-yellow-300 fill-yellow-300 animate-pulse" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-300 drop-shadow-sm">
              Star<span className="text-white">Catcher</span>
            </h1>
            <p className="text-xs text-blue-200 tracking-wider uppercase opacity-80">
              {lang === 'th' ? "คว้าดาว เก็บฝัน" : "Catch a falling star"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
            <button onClick={toggleLang} className="px-3 py-1 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-xs font-bold transition-all">
                {lang === 'th' ? "EN" : "TH"}
            </button>
            {!userAddress ? (
            <button onClick={handleConnect} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform border border-white/20">
                {lang === 'th' ? "เชื่อมต่อ" : "Connect"}
            </button>
            ) : (
            <button onClick={handleDisconnect} className="px-4 py-2 bg-white/10 rounded-full font-bold text-sm flex items-center gap-2 border border-white/20 hover:bg-red-500/20 group transition-all">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse group-hover:bg-red-400"></div>
                {userAddress.slice(0,6)}... <LogOut size={14} className="hidden group-hover:block" />
            </button>
            )}
        </div>
      </header>

      {/* Main Sky Area */}
      <main className="relative z-10 w-full h-[80vh] flex flex-col items-center justify-center text-center">
        
        {/* Title */}
        <div className="mb-12 pointer-events-none select-none">
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] mb-4">
                {lang === 'th' ? "อธิษฐาน แล้วคว้าดาวเลย!" : "Make a Wish & Catch a Star!"}
            </h2>
            <p className="text-blue-200 text-lg max-w-md mx-auto leading-relaxed">
                {lang === 'th' 
                 ? "ดวงดาวแต่ละดวงซ่อนของขวัญและคำอวยพรไว้ กดที่ดาวดวงไหนก็ได้เพื่อรับพลังบวกกลับไปนะ" 
                 : "Every star holds a gift and a blessing. Pick one to receive positive energy."}
            </p>
        </div>

        {/* Floating Stars (Buttons) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {stars.map((star) => (
                <button
                    key={star.id}
                    onClick={catchStar}
                    disabled={isProcessing}
                    className="absolute pointer-events-auto transition-transform hover:scale-125 active:scale-90 group outline-none"
                    style={{ 
                        left: `${star.x}%`, 
                        top: `${star.y}%`,
                        animation: `float ${Math.random() * 3 + 3}s infinite ease-in-out`
                    }}
                >
                    {/* Star Icon */}
                    <Star 
                        size={24 * star.size} 
                        className={`
                            drop-shadow-[0_0_15px_rgba(255,255,0,0.6)]
                            ${isProcessing ? 'text-gray-500 opacity-50' : 'text-yellow-200 fill-yellow-100 hover:text-white hover:fill-white'}
                            transition-colors duration-300
                        `} 
                        strokeWidth={1.5}
                    />
                    {/* Hand Icon on Hover (Visual Feedback) */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 -right-4 transition-opacity duration-200 pointer-events-none">
                        <Hand className="text-white drop-shadow-md rotate-[-20deg]" size={24} />
                    </div>
                </button>
            ))}
        </div>

        {/* Loading */}
        {isProcessing && (
            <div className="absolute bottom-10 bg-black/60 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10">
                <Sparkles className="animate-spin text-yellow-400" />
                <span className="font-mono text-yellow-100">{statusMsg}</span>
            </div>
        )}

      </main>

      {/* Reward Modal */}
      {showModal && reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white text-gray-900 rounded-[2.5rem] p-8 w-full max-w-sm text-center relative shadow-[0_0_60px_rgba(255,255,255,0.4)] transform scale-100 animate-bounce-slow overflow-visible border-4 border-white/50">
            
            {/* Rarity Badge */}
            <div className="absolute -top-4 right-8 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                {reward.type}
            </div>

            {/* Icon */}
            <div className="mb-6 mt-2 flex justify-center">
                <div className={`p-6 rounded-full bg-gray-50 border-4 border-gray-100 shadow-inner ${reward.color}`}>
                    <reward.icon size={80} strokeWidth={1.5} />
                </div>
            </div>

            {/* Name */}
            <h2 className={`text-2xl font-black mb-2 ${reward.color} drop-shadow-sm`}>
                {lang === 'th' ? reward.name.th : reward.name.en}
            </h2>

            {/* Message/Wish */}
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

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
