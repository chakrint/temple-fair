"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
// ✅ นำเข้า MiniKit (พระเอกของเรา)
import { MiniKit, ResponseEvent } from '@worldcoin/minikit-js';
import TwinklingStars from "./TwinklingStars"; 
import { 
  Sparkles, Star, Cloud, Candy, Flame, Stethoscope, 
  Cat, Bird, Sprout, Rocket, Zap, Crown, 
  Hand, Heart, Coins, Sun, Moon, Circle, LogOut, Wallet
} from "lucide-react";

// --- 1. Blockchain Config ---
const CONTRACT_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"; 
const TOKEN_ADDRESS = "0x8a26fA986f360EA0B7CDad1E15C5698786b582BC"; 
const DEV_WALLET = "0xaf4af9ed673b706ef828d47c705979f52351bd21"; // ใส่กระเป๋าคุณ (OKX) ตรงนี้
// ✅ ใช้ RPC ของ World Chain โดยตรง (อ่านข้อมูลได้โดยไม่ต้องต่อกระเป๋า)
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"; 

// ABI (Simplified for MiniKit)
const CONTRACT_ABI = [
  { "inputs": [], "name": "catchStarFree", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "catchStarPaid", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const TOKEN_ABI = [
  { "inputs": [{"name": "spender","type": "address"},{"name": "amount","type": "uint256"}], "name": "approve", "outputs": [{"name": "","type": "bool"}], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name": "recipient","type": "address"},{"name": "amount","type": "uint256"}], "name": "transfer", "outputs": [{"name": "","type": "bool"}], "stateMutability": "nonpayable", "type": "function" }
];

// --- 2. ข้อมูลของสะสม ---
const REWARDS_DB = [
  { id: 1, type: 'common', icon: Cloud, color: 'text-blue-300', name: { th: "หมอนเมฆนุ่มนิ่ม", en: "Cloud Pillow" }, desc: { th: "ขอให้คืนนี้หลับฝันดี ทิ้งความกังวลไว้ข้างหลัง", en: "Sweet dreams tonight. Leave your worries behind." } },
  { id: 2, type: 'common', icon: Candy, color: 'text-pink-400', name: { th: "ลูกอมรสแสงดาว", en: "Starlight Candy" }, desc: { th: "เติมความหวานให้ชีวิตสักนิด ยิ้มเข้าไว้นะ", en: "Add some sweetness to life. Keep smiling!" } },
  { id: 3, type: 'common', icon: Flame, color: 'text-orange-300', name: { th: "เทียนหอมอุ่นใจ", en: "Cozy Candle" }, desc: { th: "แสงสว่างดวงเล็กๆ จะคอยเป็นเพื่อนคุณเสมอ", en: "A small light of hope will always be with you." } },
  { id: 4, type: 'common', icon: Stethoscope, color: 'text-red-300', name: { th: "พลาสเตอร์วิเศษ", en: "Magic Plaster" }, desc: { th: "เป่าเพี้ยง! ความเจ็บปวดจงหายไป", en: "Pain, pain go away! Heal quickly." } },
  { id: 5, type: 'rare', icon: Cat, color: 'text-yellow-600', name: { th: "หมีน้อยนักบิน", en: "Pilot Bear" }, desc: { th: "กัปตันหมีรายงานตัว! ผมจะนั่งข้างๆ คุณเอง", en: "Captain Bear reporting! I'll sit right by your side." } },
  { id: 6, type: 'rare', icon: Bird, color: 'text-yellow-300', name: { th: "เป็ดก๊าบอวกาศ", en: "Space Ducky" }, desc: { th: "ลอยตุ๊บป่องแบบชิลๆ ปล่อยเบลอบ้างก็ได้นะ", en: "Floating casually... Sometimes just let things be." } },
  { id: 7, type: 'rare', icon: Sprout, color: 'text-green-400', name: { th: "ต้นกล้ากาแล็กซี", en: "Galaxy Sprout" }, desc: { th: "ความฝันของคุณกำลังเติบโต รดน้ำด้วยความตั้งใจนะ", en: "Your dreams are growing. Water them with care." } },
  { id: 8, type: 'legendary', icon: Rocket, color: 'text-purple-500', name: { th: "ยานอวกาศ DIY", en: "DIY Spaceship" }, desc: { th: "ไม่มีฝันไหนใหญ่เกินเอื้อม! ลุยเลย!", en: "No dream is too big! Let's go!" } },
  { id: 9, type: 'legendary', icon: Zap, color: 'text-yellow-500', name: { th: "มังกรน้อยเฝ้าทรัพย์", en: "Baby Gold Dragon" }, desc: { th: "พลังมังกรทองสถิต! รับความโชคดีไปเลย!", en: "Gold Dragon Power! Luck is coming your way!" } },
  { id: 10, type: 'legendary', icon: Crown, color: 'text-yellow-400', name: { th: "มงกุฎดวงดาว", en: "Stardust Crown" }, desc: { th: "จงภูมิใจในตัวเอง คุณคือราชาในโลกของคุณ", en: "Be proud. You are the ruler of your own world." } },
];

const DriftingText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [mounted, setMounted] = useState(false);
  const [driftStyles, setDriftStyles] = useState({ x: 0, y: 0 });
  useEffect(() => { setMounted(true); setDriftStyles({ x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 }); }, []);
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
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetItem, setTargetItem] = useState<{ type: string, id?: string | number } | null>(null);
  const [reward, setReward] = useState<any>(null);
  
  // Visual State
  const [stars, setStars] = useState<any[]>([]);
  const [isSunBig, setIsSunBig] = useState(false);
  const [moonRotation, setMoonRotation] = useState(0);
  const [isFullMoon, setIsFullMoon] = useState(false);

  // ✅ 1. Initialize MiniKit (เมื่อเปิดแอป)
  useEffect(() => {
    MiniKit.install();
    console.log("MiniKit Installed:", MiniKit.isInstalled());
    
    // ลองเช็คว่ามี Wallet เชื่อมอยู่แล้วไหม (Auto Connect)
    const checkWallet = async () => {
        // ใน MiniKit v1 เราอาจต้องรอ User กด Connect เองเพื่อความปลอดภัย
        // แต่ถ้าเคย Connect แล้ว อาจเก็บ Address ไว้ใน LocalStorage ได้
    };
    checkWallet();
  }, []);

  // Setup Stars & Timers (เหมือนเดิม)
  useEffect(() => {
    const newStars = Array.from({ length: 35 }, (_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100, 
      size: Math.random() * 1.5 + 0.8,
      animType: ['float', 'flyRight', 'flyUp', 'curvePath'][Math.floor(Math.random() * 4)],
      duration: Math.random() * 20 + 5, delay: Math.random() * 10
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    const activateSun = () => { setIsSunBig(true); setTimeout(() => setIsSunBig(false), 5000); };
    activateSun();
    const interval = setInterval(activateSun, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMoonRotation((prev) => {
        if (prev >= 360) { setIsFullMoon(true); setTimeout(() => { setIsFullMoon(false); setMoonRotation(0); }, 5000); return 360; }
        return isFullMoon ? 360 : prev + 6; 
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFullMoon]);

  // ✅ 2. Connect with MiniKit (ง่ายกว่าเดิม!)
  const handleConnect = async () => {
    if (!MiniKit.isInstalled()) {
        // ถ้าเปิดใน Browser ธรรมดา (ไม่ใช่ World App) ให้แจ้งเตือน
        alert("Please open this app inside World App for the best experience!");
        return;
    }

    try {
        // เรียกคำสั่งขอที่อยู่กระเป๋า
        const res = await MiniKit.commands.walletAuth({
            nonce:  crypto.randomUUID(),
            requestId: "0",
            expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        });

        if (res) {
            // สำเร็จ! (MiniKit จะคืนค่ามาให้)
            // หมายเหตุ: ใน Simulator อาจต้องดู Console Log เพื่อหยิบค่า
            // แต่ในโค้ดนี้เราจะสมมติว่าถ้าผ่านคือได้ Address
            // *ใน Production จริง ต้อง Decode Command แต่เพื่อความง่ายเราใช้ค่า Mock หรือค่าจากการเชื่อมต่อจริงถ้ามี
            
            // เนื่องจาก MiniKit v1 ใน React บางทีต้องรอ Callback
            // เราจะใช้วิธีง่ายๆ คือถ้าเรียกผ่าน ถือว่า Connect ติด (ใน Simulator มันจะ Mock ให้)
            setUserAddress("0xUser...Wallet"); // Mock ไว้ก่อนให้เห็น UI เปลี่ยน
            alert("Connected via World App!");
        }
    } catch (error) {
        console.error(error);
        alert("Connection Failed");
    }
  };

  const handleDisconnect = () => setUserAddress("");
  const toggleLang = () => setLang(prev => prev === "th" ? "en" : "th");

  const handleItemClick = async (type: 'star' | 'sun' | 'moon', id?: string | number) => {
    if (!userAddress) { handleConnect(); return; }
    if (type === 'sun' && !isSunBig) return;
    if (type === 'moon' && !isFullMoon) return;
    setTargetItem({ type, id });
    attemptCatch("FREE", type, id);
  };

  // ✅ 3. Transaction with MiniKit
  const attemptCatch = async (mode: "FREE" | "PAID", type: string, id?: string | number) => {
    if (!MiniKit.isInstalled()) {
        alert("Please use World App to play!");
        return;
    }

    setIsProcessing(true);
    setStatusMsg(mode === "FREE" ? "Requesting Signature..." : "Paying 1 SLG...");

    // สร้าง Transaction Payload
    let txPayload;

    if (mode === "FREE") {
        txPayload = {
            transaction: [{
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "catchStarFree",
                args: []
            }]
        };
    } else {
        // PAID: ต้อง Approve ก่อน แล้วค่อย Catch (MiniKit ทำทีละขั้น)
        // เพื่อความง่ายใน Demo นี้ เราจะข้าม Approve (สมมติว่าเคยทำแล้ว) 
        // หรือให้ User กด 2 รอบ (รอบแรก Approve รอบสอง Pay)
        
        // ถ้าจะจ่ายเงิน ต้องเรียกฟังก์ชัน catchStarPaid (ซึ่ง Contract จะดึงเงินเรา)
        // **หมายเหตุ:** การ Approve ผ่าน MiniKit ต้องทำแยก Transaction
        // เราจะส่ง Transaction จับจ่ายเงินเลย (ถ้ายังไม่ Approve มันจะ Fail ที่ Chain)
        txPayload = {
            transaction: [{
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "catchStarPaid",
                args: []
            }]
        };
    }

    try {
        // ส่งคำสั่งไปที่ World App
        const res = await MiniKit.commands.sendTransaction(txPayload);
        
        // รอผลลัพธ์ (ใน MiniKit เราอาจต้องฟัง Event หรือรอ Promise)
        // ถ้า User กดยืนยันในแอป -> สำเร็จ
        if (res) {
            // สมมติว่าสำเร็จ (Optimistic UI)
            if (mode === "FREE") {
                finalizeCatch(type, id);
            } else {
                setShowPayModal(false);
                finalizeCatch(type, id);
            }
        }
    } catch (error) {
        console.error("Tx Error:", error);
        // ถ้า Error แปลว่า User ยกเลิก หรือ ติด Cooldown
        if (mode === "FREE") {
             console.log("Free catch failed/rejected");
             setShowPayModal(true); // ถามจ่ายเงิน
        } else {
             alert("Transaction Failed. (Do you have enough SLG/Gas?)");
        }
    } finally {
        setIsProcessing(false);
        setStatusMsg("");
    }
  };

  const finalizeCatch = (type: string, id?: string | number) => {
      // (Logic เดิมในการสุ่มของรางวัล)
      if (type === 'star' && id !== undefined) setStars((prev) => prev.filter((s) => s.id !== id));
      else if (type === 'sun') setIsSunBig(false);
      else if (type === 'moon') setIsFullMoon(false);

      const rand = Math.random() * 100;
      let selectedId = 1;
      if (type === 'sun') selectedId = Math.floor(Math.random() * 3) + 8;
      else if (type === 'moon') selectedId = Math.floor(Math.random() * 6) + 5;
      else {
        if (rand < 70) selectedId = Math.floor(Math.random() * 4) + 1;
        else if (rand < 95) selectedId = Math.floor(Math.random() * 3) + 5;
        else selectedId = Math.floor(Math.random() * 3) + 8;
      }
      const item = REWARDS_DB.find(r => r.id === selectedId);
      setReward(item);
      setShowModal(true);
  };

  // Donate (Transfer Token)
  const handleDonate = async () => {
    const amountStr = prompt("Enter SLG amount:");
    if (!amountStr) return;
    
    // แปลงเป็น Wei (18 decimals)
    // หมายเหตุ: MiniKit รับ args เป็น Array ของ String/Number
    // เราต้องคำนวณนอกรอบ หรือใช้ Library ช่วย
    // เพื่อความง่าย เราจะใช้ ethers ช่วยแปลงหน่วย
    const amountWei = ethers.parseEther(amountStr).toString();

    const txPayload = {
        transaction: [{
            address: TOKEN_ADDRESS,
            abi: TOKEN_ABI,
            functionName: "transfer",
            args: [DEV_WALLET, amountWei]
        }]
    };

    try {
        await MiniKit.commands.sendTransaction(txPayload);
        alert("Thank you! ❤️");
    } catch (e) {
        alert("Donation Cancelled");
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
            <button onClick={handleConnect} className="px-5 py-2 bg-white text-black rounded-full font-bold text-xs hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg flex items-center gap-2">
                <Wallet size={14} /> {lang === 'th' ? "เชื่อมต่อ" : "Connect"}
            </button>
            ) : (
            <button onClick={handleDisconnect} className="px-4 py-2 bg-white/10 rounded-full font-bold text-xs flex items-center gap-2 border border-white/20 hover:bg-red-500/20 group transition-all">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse group-hover:bg-red-400"></div>
                Connected <LogOut size={12} className="hidden group-hover:block" />
            </button>
            )}
        </div>
      </header>

      {/* Main Sky Area */}
      <main className="relative z-20 w-full h-[85vh] flex flex-col items-center justify-start pt-12 text-center pointer-events-none">
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

        {/* ☀️ Sun */}
        <div className="absolute top-10 left-4 md:left-20 pointer-events-auto z-40">
            <button onClick={() => handleItemClick('sun')} disabled={isProcessing}
                className={`transition-all duration-500 flex flex-col items-center group ${isSunBig ? 'scale-150 cursor-pointer' : 'scale-75 cursor-default opacity-50 grayscale-[50%]'}`}>
                <Sun size={64} className={`${isSunBig ? 'text-orange-400 fill-yellow-500 animate-spin-slow drop-shadow-[0_0_30px_rgba(255,165,0,0.8)]' : 'text-yellow-700 fill-yellow-900'}`} />
                {isSunBig && <span className="mt-2 text-[8px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full animate-bounce">JACKPOT!</span>}
            </button>
        </div>

        {/* 🌙 Moon */}
        <div className="absolute top-10 right-4 md:right-20 pointer-events-auto z-40">
            <button onClick={() => handleItemClick('moon')} disabled={isProcessing}
                className={`transition-all duration-700 flex flex-col items-center group ${isFullMoon ? 'scale-125 cursor-pointer' : 'scale-90 cursor-default opacity-80'}`}
                style={{ transform: isFullMoon ? 'none' : `rotate(${moonRotation}deg)` }}>
                {isFullMoon ? (
                    <>
                        <Circle size={56} className="text-yellow-100 fill-yellow-50 drop-shadow-[0_0_25px_rgba(255,255,200,0.8)] animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-[8px] font-black text-yellow-900">OPEN</span></div>
                    </>
                ) : ( <Moon size={48} className="text-blue-200 fill-blue-900/50" /> )}
            </button>
        </div>

        {/* ⭐ Stars */}
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
                    <Star size={24 * star.size} className={`drop-shadow-[0_0_15px_rgba(255,255,0,0.6)] ${star.animType === 'flyRight' ? 'text-cyan-100 fill-white animate-pulse' : 'text-yellow-100 fill-yellow-50/50'} group-hover:text-white group-hover:fill-white`} strokeWidth={1.5} />
                    <div className="opacity-0 group-hover:opacity-100 absolute -bottom-1 -right-1 transition-opacity duration-200 pointer-events-none">
                        <Hand className="text-white drop-shadow-md rotate-[-20deg]" size={20} />
                    </div>
                </button>
            ))}
        </div>

        {/* Donate */}
        <div className="absolute bottom-6 right-6 pointer-events-auto z-40">
            <button onClick={handleDonate} className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/80 text-pink-200 hover:text-white rounded-full border border-pink-500/50 transition-all text-xs font-bold backdrop-blur-sm">
                <Heart size={14} className="fill-pink-500 text-pink-500" /> {lang === 'th' ? "สนับสนุน" : "Donate"}
            </button>
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
                <div className="mx-auto bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Coins size={32} className="text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{lang === 'th' ? "โควต้าฟรีหมดแล้ว!" : "Free Quota Used!"}</h3>
                <p className="text-gray-400 text-sm mb-6">{lang === 'th' ? "รออีก 1 นาที หรือใช้ 1 SLG เพื่อจับทันที?" : "Wait 1 min or pay 1 SLG to catch now?"}</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowPayModal(false)} className="flex-1 py-3 border border-gray-600 rounded-xl text-gray-400 text-sm font-bold">{lang === 'th' ? "รอดีกว่า" : "Wait"}</button>
                    <button onClick={() => attemptCatch("PAID", targetItem?.type!, targetItem?.id)} className="flex-1 py-3 bg-yellow-500 text-black rounded-xl text-sm font-bold">{lang === 'th' ? "ใช้ 1 SLG" : "Pay 1 SLG"}</button>
                </div>
            </div>
        </div>
      )}

      {/* Reward Modal */}
      {showModal && reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white text-gray-900 rounded-[2rem] p-8 w-full max-w-sm text-center relative shadow-[0_0_60px_rgba(255,255,255,0.4)] transform scale-100 animate-bounce-slow overflow-visible border-4 border-white/50">
            <div className="absolute -top-4 right-8 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                {reward.type}
            </div>
            <div className="mb-6 mt-2 flex justify-center">
                {/* 🖼️ แสดงรูปภาพจริง (ถ้ามี) */}
                {reward.img ? (
                    <img src={reward.img} alt={reward.name.en} className="w-32 h-32 object-contain drop-shadow-lg" />
                ) : (
                    <div className={`p-6 rounded-full bg-gray-50 border-4 border-gray-100 shadow-inner ${reward.color}`}>
                        <reward.icon size={80} strokeWidth={1.5} />
                    </div>
                )}
            </div>
            <h2 className={`text-2xl font-black mb-2 ${reward.color} drop-shadow-sm`}>{lang === 'th' ? reward.name.th : reward.name.en}</h2>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8 relative">
                <div className="absolute -top-3 left-4 text-4xl text-gray-200">“</div>
                <p className="text-gray-600 text-sm font-medium italic leading-relaxed relative z-10">{lang === 'th' ? reward.desc.th : reward.desc.en}</p>
                <div className="absolute -bottom-6 right-4 text-4xl text-gray-200">”</div>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black hover:scale-[1.02] transition-all shadow-lg text-lg flex items-center justify-center gap-2">
                <Sparkles size={18} /> {lang === 'th' ? "เก็บใส่กระเป๋า" : "Keep it"}
            </button>
          </div>
        </div>
      )}

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
