"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MiniKit } from '@worldcoin/minikit-js';
import { 
  Sparkles, Star, Cloud, Candy, Flame, Stethoscope, 
  Cat, Bird, Sprout, Rocket, Zap, Crown, 
  Hand, Heart, Coins, Sun, Moon, Circle, LogOut, Wallet, Share2, Download
} from "lucide-react";

import TwinklingStars from "@/components/TwinklingStars"; 

// --- 0. Config & Constants ---
const APP_VERSION = "V.2.6 (Floating Logic)";
const MOCK_WALLET = "0xMockWalletForChromeTesting";
const CONTRACT_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"; 
const DEV_WALLET = "0xaf4af9ed673b706ef828d47c705979f52351bd21"; 
const APP_URL = "https://temple-fair.vercel.app"; 

// --- 1. Database ของรางวัล ---
const REWARDS_DB = [
  { id: 1, type: 'common', img: "/cloudpillow.png", icon: Cloud, color: 'text-blue-300', name: { th: "หมอนเมฆนุ่มนิ่ม", en: "Cloud Pillow" }, desc: { th: "ขอให้คืนนี้หลับฝันดี ทิ้งความกังวลไว้ข้างหลัง", en: "Sweet dreams tonight. Leave your worries behind." } },
  { id: 2, type: 'common', img: "/starcandy.png", icon: Candy, color: 'text-pink-400', name: { th: "ลูกอมรสแสงดาว", en: "Starlight Candy" }, desc: { th: "เติมความหวานให้ชีวิตสักนิด ยิ้มเข้าไว้นะ", en: "Add some sweetness to life. Keep smiling!" } },
  { id: 3, type: 'common', img: "/cozycandle.png", icon: Flame, color: 'text-orange-300', name: { th: "เทียนหอมอุ่นใจ", en: "Cozy Candle" }, desc: { th: "แสงสว่างดวงเล็กๆ จะคอยเป็นเพื่อนคุณเสมอ", en: "A small light of hope will always be with you." } },
  { id: 4, type: 'common', img: "/MagicPlaster.png", icon: Stethoscope, color: 'text-red-300', name: { th: "พลาสเตอร์วิเศษ", en: "Magic Plaster" }, desc: { th: "เป่าเพี้ยง! ความเจ็บปวดจงหายไป", en: "Pain, pain go away! Heal quickly." } },
  { id: 5, type: 'rare', img: "/pilotbear.png", icon: Cat, color: 'text-yellow-600', name: { th: "หมีน้อยนักบิน", en: "Pilot Bear" }, desc: { th: "กัปตันหมีรายงานตัว! ผมจะนั่งข้างๆ คุณเอง", en: "Captain Bear reporting! I'll sit right by your side." } },
  { id: 6, type: 'rare', img: "/spaceducky.png", icon: Bird, color: 'text-yellow-300', name: { th: "เป็ดก๊าบอวกาศ", en: "Space Ducky" }, desc: { th: "ลอยตุ๊บป่องแบบชิลๆ ปล่อยเบลอบ้างก็ได้นะ", en: "Floating casually... Sometimes just let things be." } },
  { id: 7, type: 'rare', img: "/galaxysprout.png", icon: Sprout, color: 'text-green-400', name: { th: "ต้นกล้ากาแล็กซี", en: "Galaxy Sprout" }, desc: { th: "ความฝันของคุณกำลังเติบโต รดน้ำด้วยความตั้งใจนะ", en: "Your dreams are growing. Water them with care." } },
  { id: 8, type: 'legendary', img: "/Spaceship.png", icon: Rocket, color: 'text-purple-500', name: { th: "ยานอวกาศ DIY", en: "DIY Spaceship" }, desc: { th: "ไม่มีฝันไหนใหญ่เกินเอื้อม! ลุยเลย!", en: "No dream is too big! Let's go!" } },
  { id: 9, type: 'legendary', img: "/BabyGoldDragon.png", icon: Zap, color: 'text-yellow-500', name: { th: "มังกรน้อยเฝ้าทรัพย์", en: "Baby Gold Dragon" }, desc: { th: "พลังมังกรทองสถิต! รับความโชคดีไปเลย!", en: "Gold Dragon Power! Luck is coming your way!" } },
  { id: 10, type: 'legendary', img: "/StardustCrown.png", icon: Crown, color: 'text-yellow-400', name: { th: "มงกุฎดวงดาว", en: "Stardust Crown" }, desc: { th: "จงภูมิใจในตัวเอง คุณคือราชาในโลกของคุณ", en: "Be proud. You are the ruler of your own world." } },
];

// --- 2. Drifting Text Component ---
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

// --- 🌟 New Component: Floating Star (ดาวลอยแบบพิเศษ) ---
const FloatingStar = ({ onCatch, disabled }: { onCatch: () => void, disabled: boolean }) => {
    const [status, setStatus] = useState<'active' | 'cooldown'>('cooldown'); // เริ่มต้นที่ cooldown เพื่อสุ่มเวลาเกิด
    const [style, setStyle] = useState<any>({});

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (status === 'cooldown') {
            // 🕒 สุ่มเวลาเกิด 1-5 วินาที
            const delay = Math.random() * 4000 + 1000; 
            timeout = setTimeout(() => {
                // สุ่มตำแหน่งใหม่ตอนเกิด
                setStyle({
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 80 + 10}%`,
                    size: Math.random() * 0.5 + 0.8, // ขนาด 0.8 - 1.3
                });
                setStatus('active');
            }, delay);
        } 
        else if (status === 'active') {
            // ⏳ แสดงผล 33 วินาที แล้วหายไป (เข้า cooldown)
            timeout = setTimeout(() => {
                setStatus('cooldown');
            }, 33000);
        }

        return () => clearTimeout(timeout);
    }, [status]);

    const handleClick = () => {
        if (disabled) return;
        onCatch(); // เรียกฟังก์ชันจับ
        setStatus('cooldown'); // หายไปทันทีเมื่อถูกจับ
    };

    if (status === 'cooldown') return null;

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className="absolute pointer-events-auto outline-none group hover:z-50 transition-all"
            style={{ 
                left: style.left, 
                top: style.top,
                // ✅ Animation: หมุน 3 รอบ (1080deg) ใน 33 วินาที + Fade In/Out
                animation: `rotateFade 33s linear forwards` 
            }}
        >
            <Star 
                size={24 * style.size} 
                className="text-yellow-100 fill-yellow-50/80 drop-shadow-[0_0_15px_rgba(255,255,200,0.8)]" 
                strokeWidth={1.5} 
            />
            {/* Hand Icon show on hover */}
            <div className="opacity-0 group-hover:opacity-100 absolute -bottom-1 -right-1 transition-opacity duration-200 pointer-events-none">
                <Hand className="text-white drop-shadow-md rotate-[-20deg]" size={16} />
            </div>
        </button>
    );
};

// --- 3. Main Page Component ---
export default function StarCatcherApp() {
  const [lang, setLang] = useState<"th" | "en">("en");
  const [userAddress, setUserAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetItem, setTargetItem] = useState<{ type: string, id?: string | number } | null>(null);
  const [reward, setReward] = useState<any>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  
  const [runningStars, setRunningStars] = useState<any[]>([]); // เปลี่ยนชื่อตัวแปรให้ชัดเจน
  const [isSunBig, setIsSunBig] = useState(false);
  const [moonRotation, setMoonRotation] = useState(0);
  const [isFullMoon, setIsFullMoon] = useState(false);

  useEffect(() => {
    try {
        const appId = process.env.NEXT_PUBLIC_APP_ID || "app_staging_dummy";
        MiniKit.install(appId); 
    } catch (e) {
        console.warn("MiniKit install warning:", e);
    }
  }, []);

  // ✅ Running Stars Logic: สุ่ม 3-8 ดวง (ดาววิ่งเร็ว)
  useEffect(() => {
    const newStars = [];
    const RUNNING_STARS_MIN = 3;
    const RUNNING_STARS_MAX = 8;
    
    const count = Math.floor(Math.random() * (RUNNING_STARS_MAX - RUNNING_STARS_MIN + 1)) + RUNNING_STARS_MIN;
    const moveTypes = ['flyRight', 'flyUp', 'curvePath'];

    for (let i = 0; i < count; i++) {
        newStars.push({
            id: i,
            left: Math.random() * 90 + 5,
            top: Math.random() * 80 + 10,
            size: Math.random() * 0.5 + 0.5,
            animType: moveTypes[Math.floor(Math.random() * moveTypes.length)],
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 10
        });
    }
    setRunningStars(newStars);
  }, []);

  // Sun Logic
  useEffect(() => {
    setIsSunBig(true);
    const initialHide = setTimeout(() => setIsSunBig(false), 3000); 
    const interval = setInterval(() => {
      setIsSunBig(true);
      setTimeout(() => setIsSunBig(false), 3000); 
    }, 60 * 60 * 1000); 

    return () => {
        clearTimeout(initialHide);
        clearInterval(interval);
    };
  }, []);

  // Moon Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setMoonRotation((prev) => {
        if (prev >= 360) { setIsFullMoon(true); setTimeout(() => { setIsFullMoon(false); setMoonRotation(0); }, 5000); return 360; }
        return isFullMoon ? 360 : prev + 6; 
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFullMoon]);

  const toggleLang = () => setLang(prev => prev === "th" ? "en" : "th");
  const handleDisconnect = () => setUserAddress("");

  // --- 🎨 ระบบวาดการ์ด (Canvas Generator) ---
  const generateCardImage = async (rewardItem: any): Promise<File | null> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        const size = 1080;
        canvas.width = size;
        canvas.height = size;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#334155');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Decor
        ctx.fillStyle = '#ffffff';
        for(let i=0; i<50; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Load Image Helper
        const loadImage = (src: string) => {
            return new Promise<HTMLImageElement>((r) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = src;
                img.onload = () => r(img);
                img.onerror = () => r(img);
            });
        };

        // Load Images
        Promise.all([
            loadImage(rewardItem.img),
            loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APP_URL)}&color=000000&bgcolor=ffffff&margin=10`) 
        ]).then(([img, qrImg]) => {
            // Main Image
            const imgSize = 500;
            const x = (size - imgSize) / 2;
            const y = (size - imgSize) / 2 - 100;
            
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.shadowBlur = 50;
            ctx.drawImage(img, x, y, imgSize, imgSize);
            ctx.shadowBlur = 0;

            // Reward Name
            const name = lang === 'th' ? rewardItem.name.th : rewardItem.name.en;
            ctx.font = 'bold 80px sans-serif';
            ctx.fillStyle = '#fcd34d';
            ctx.textAlign = 'center';
            ctx.fillText(name, size/2, y + imgSize + 100);

            // Description
            const desc = lang === 'th' ? rewardItem.desc.th : rewardItem.desc.en;
            ctx.font = '40px sans-serif';
            ctx.fillStyle = '#e2e8f0';
            
            const qrSize = 150; 
            const qrPadding = 40;
            const words = desc.split(' ');
            let line = '';
            let lineY = y + imgSize + 180;
            const maxWidth = size - (qrSize + qrPadding * 2) - 100; 

            ctx.textAlign = 'left'; 
            const textX = 100; 

            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, textX, lineY);
                    line = words[n] + ' ';
                    lineY += 60;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, textX, lineY);

            // QR Code
            ctx.drawImage(qrImg, size - qrSize - qrPadding, size - qrSize - qrPadding, qrSize, qrSize);
            
            // App Logo
            ctx.textAlign = 'center';
            ctx.font = 'bold 24px monospace';
            ctx.fillStyle = '#64748b';
            ctx.fillText("Star Catcher", size - qrSize/2 - qrPadding, size - qrSize - qrPadding - 15);

            canvas.toBlob((blob) => {
                if(blob) {
                    const file = new File([blob], `card-${Date.now()}.png`, { type: 'image/png' });
                    resolve(file);
                } else {
                    resolve(null);
                }
            }, 'image/png');
        });
    });
  };

  const handleShare = async (fromModal = false) => {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : APP_URL;
    
    let shareData: any = {
        title: 'Star Catcher',
        text: lang === 'th' 
            ? `มาคว้าดาวกัน! ✨ เล่นฟรี ลุ้นรับของขวัญดิจิทัลน่ารักๆ 👇\n${shareUrl}`
            : `Catch stars with me! ✨ Play for free and collect cute digital items 👇\n${shareUrl}`,
        url: shareUrl
    };

    if (fromModal && reward) {
        setIsGeneratingCard(true);
        try {
            const file = await generateCardImage(reward);
            const itemName = lang === 'th' ? reward.name.th : reward.name.en;
            
            const blessingText = lang === 'th'
                ? `เพื่อนคุณส่งคำอวยพรมาให้พร้อมกับ "${itemName}" 🎁\nขอให้สิ่งดีๆ เกิดขึ้นกับคุณนะ! ✨\n\nมาลองคว้าดาวของคุณบ้างที่นี่เลย 👇\n${shareUrl}`
                : `Your friend sent you a blessing with "${itemName}" 🎁\nWishing you all the best! ✨\n\nCatch your own star here 👇\n${shareUrl}`;

            if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Gift from the Stars',
                    text: blessingText,
                });
            } else {
                shareData.text = blessingText;
                await navigator.share(shareData);
            }
        } catch (e) {
            console.log("Share dismissed/failed, falling back to clipboard");
            try {
                await navigator.clipboard.writeText(shareData.text);
                alert(lang === 'th' ? 'คัดลอกข้อความแล้ว! ส่งให้เพื่อนได้เลย' : 'Message copied! Ready to send.');
            } catch(err) {}
        } finally {
            setIsGeneratingCard(false);
        }
        return;
    }

    try {
        if (navigator.share) await navigator.share(shareData);
        else {
            await navigator.clipboard.writeText(shareData.text);
            alert(lang === 'th' ? 'คัดลอกลิงก์แล้ว!' : 'Link copied!');
        }
    } catch(e) {}
  };

  const handleDownload = async () => {
    if (!reward) return;
    setIsGeneratingCard(true);
    const file = await generateCardImage(reward);
    if(file) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = `StarCatcher-${reward.name.en.replace(/\s+/g, '-')}.png`;
        link.click();
    }
    setIsGeneratingCard(false);
  };

  const handleConnect = async () => {
    if (!MiniKit.isInstalled()) {
        console.log("Browser Mode: Mocking Login...");
        setUserAddress(MOCK_WALLET);
        alert("Running in Browser Mode: Logged in as Mock User!");
        return;
    }
    try {
        const res = await MiniKit.commands.walletAuth({
            nonce: crypto.randomUUID(),
            requestId: "0",
            expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        });
        if (res && (res as any).status === 'success') {
             const addr = (res as any).address || (res as any).commandPayload?.address || "0xConnectedUser";
             setUserAddress(addr);
        } else if (res) {
             const addr = (res as any).address || "0xConnectedUser";
             setUserAddress(addr);
        }
    } catch (error) {
        console.error("Login Error:", error);
    }
  };

  const handleItemClick = async (type: 'star' | 'sun' | 'moon' | 'floating', id?: string | number) => {
    if (!userAddress) { handleConnect(); return; }
    if (type === 'sun' && !isSunBig) return;
    if (type === 'moon' && !isFullMoon) return;
    
    // สำหรับ Floating Star (ไม่ต้องส่ง ID เพราะจัดการภายใน component)
    setTargetItem({ type, id });
    attemptCatch("FREE", type, id);
  };

  const attemptCatch = async (mode: "FREE" | "PAID", type: string, id?: string | number) => {
    setIsProcessing(true);
    setStatusMsg(mode === "FREE" ? "Catching..." : "Paying 1 SLG...");

    if (!MiniKit.isInstalled()) {
        setTimeout(() => {
             setIsProcessing(false);
             setStatusMsg("");
             if (mode === "PAID") setShowPayModal(false);
             finalizeCatch(type, id);
        }, 2000);
        return;
    }

    const txPayload = {
        transaction: [{
            address: CONTRACT_ADDRESS,
            abi: [], 
            functionName: mode === "FREE" ? "catchStarFree" : "catchStarPaid",
            args: []
        }]
    };

    try {
        const res = await MiniKit.commands.sendTransaction(txPayload);
        if (res && ((res as any).status === 'success' || (res as any).transactionHash)) {
            if (mode === "FREE") finalizeCatch(type, id);
            else { setShowPayModal(false); finalizeCatch(type, id); }
        } else {
             if (mode === "FREE") setShowPayModal(true);
        }
    } catch (error) {
        if (mode === "FREE") setShowPayModal(true);
        else alert("Transaction Failed");
    } finally {
        setIsProcessing(false);
        setStatusMsg("");
    }
  };

  const finalizeCatch = (type: string, id?: string | number) => {
      // ถ้าเป็นดาววิ่ง (star) ให้ลบออกจาก array
      if (type === 'star' && id !== undefined) setRunningStars((prev) => prev.filter((s) => s.id !== id));
      else if (type === 'sun') setIsSunBig(false);
      else if (type === 'moon') setIsFullMoon(false);
      // ถ้าเป็น floating ไม่ต้องทำอะไร (Component จัดการตัวเอง)

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

  const handleDonate = async () => {
    const amount = prompt("Enter SLG amount:");
    if(!amount) return;
    alert(`Thank you for donating ${amount} SLG! (Mock)`);
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
                <span className="max-w-[80px] truncate">{userAddress}</span> <LogOut size={12} className="hidden group-hover:block" />
            </button>
            )}
        </div>
      </header>

      {/* Main Area */}
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
        <div className="absolute top-20 right-10 pointer-events-auto z-40 animate-[float_20s_infinite_linear]">
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

        {/* 🌠 Running Stars (ดาววิ่ง 3-8 ดวง) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {runningStars.map((star) => (
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

        {/* ⭐ Floating Stars (ดาวลอยพิเศษ 3 ดวง) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* สร้างดาวลอย 3 ดวง */}
            <FloatingStar onCatch={() => handleItemClick('floating')} disabled={isProcessing} />
            <FloatingStar onCatch={() => handleItemClick('floating')} disabled={isProcessing} />
            <FloatingStar onCatch={() => handleItemClick('floating')} disabled={isProcessing} />
        </div>

        <div className="absolute bottom-6 right-6 pointer-events-auto z-40 flex flex-col items-end gap-3">
            <button onClick={() => handleShare(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all backdrop-blur-sm">
                <Share2 size={18} />
            </button>
            <button onClick={handleDonate} className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/80 text-pink-200 hover:text-white rounded-full border border-pink-500/50 transition-all text-xs font-bold backdrop-blur-sm">
                <Heart size={14} className="fill-pink-500 text-pink-500" /> {lang === 'th' ? "สนับสนุน" : "Donate"}
            </button>
            <span className="text-[10px] text-white/30 font-mono tracking-widest select-none">{APP_VERSION}</span>
        </div>

        {isProcessing && (
            <div className="absolute bottom-20 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-30">
                <Sparkles className="animate-spin text-yellow-400 w-4 h-4" />
                <span className="font-mono text-yellow-100 text-xs">{statusMsg}</span>
            </div>
        )}
      </main>

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

      {showModal && reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white text-gray-900 rounded-[2rem] p-8 w-full max-w-sm text-center relative shadow-[0_0_60px_rgba(255,255,255,0.4)] transform scale-100 animate-bounce-slow overflow-visible border-4 border-white/50">
            <div className="absolute -top-4 right-8 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                {reward.type}
            </div>
            
            <div className="absolute top-4 left-4 flex gap-2">
                <button onClick={handleDownload} disabled={isGeneratingCard} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all disabled:opacity-50" title="Save Card">
                    {isGeneratingCard ? <Sparkles size={14} className="animate-spin" /> : <Download size={14} />}
                </button>
                <button onClick={() => handleShare(true)} disabled={isGeneratingCard} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all disabled:opacity-50" title="Share Card">
                    {isGeneratingCard ? <Sparkles size={14} className="animate-spin" /> : <Share2 size={14} />}
                </button>
            </div>

            <div className="mb-6 mt-2 flex justify-center">
                {reward.img ? (
                    <img src={reward.img} alt={reward.name.en} className="w-40 h-40 object-contain drop-shadow-2xl animate-in zoom-in duration-300" />
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

      {/* ✅ Add New Animation Keyframes */}
      <style jsx global>{`
        .pause-on-hover:hover { animation-play-state: paused !important; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, -15px) rotate(5deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
        @keyframes flyRight { 0% { transform: translate(-10vw, 0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(100vw, 20px); opacity: 0; } }
        @keyframes flyUp { 0% { transform: translate(0, 100vh); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(-20px, -20vh); opacity: 0; } }
        @keyframes curvePath { 0% { transform: translate(-50px, 0); opacity: 0; } 20% { opacity: 1; } 50% { transform: translate(30vw, -100px); } 80% { opacity: 1; } 100% { transform: translate(60vw, 50px); opacity: 0; } }
        /* ✨ New Rotation & Fade Animation */
        @keyframes rotateFade {
            0% { opacity: 0; transform: rotate(0deg) scale(0.5); }
            10% { opacity: 1; transform: rotate(108deg) scale(1); } /* Fade in quickly */
            90% { opacity: 1; transform: rotate(972deg) scale(1); } /* Stay visible */
            100% { opacity: 0; transform: rotate(1080deg) scale(0.5); } /* Fade out + 3rd round */
        }
      `}</style>
    </div>
  );
}
