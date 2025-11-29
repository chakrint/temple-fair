"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// ✅ นำเข้า Component ดาววิบวับ (ต้องมีไฟล์ TwinklingStars.tsx อยู่ในโฟลเดอร์เดียวกัน)
import TwinklingStars from "./TwinklingStars"; 
import { Sparkles, Wallet, RefreshCw, Banknote, History, User, CarFront, Gem, CreditCard, Scroll, Globe, ExternalLink, LogOut } from "lucide-react";

// --- 1. Blockchain Config ---
const GAME_ADDRESS = "0x12b03ebca6de358c564c58c73fd0fff05a9deda0"; 
const TOKEN_ADDRESS = "0x8a26fA986f360EA0B7CDad1E15C5698786b582BC"; 
const TICKET_PRICE = "100"; 

// ABI
const GAME_ABI = [
  "function enterGame() external",
  "function refund() external",
  "function players(uint256) view returns (address)",
  "function getPlayersCount() view returns (uint256)" 
];

const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)"
];

const translations = {
  th: {
    title: "สอยดาว", titleSuffix: "มังกรทอง", subtitle: "WorldLucky Temple Fair",
    connect: "เชื่อมต่อกระเป๋า", verified: "ยืนยันตัวตนแล้ว", disconnect: "ออก",
    adminHall: "ศาลาอำนวยการ", coinName: "เหรียญสลึง (SALUNG)",
    exchangeTitle: "ช่องทางซื้อเหรียญ", rate: "ซื้อ $SLG ผ่าน PUF / DEX", swapBtn: "ไปที่ PUF.io",
    gameTitle: "สอยดาวลุ้นโชค", round: "รอบที่ ๘๙", waiting: "รอผู้เล่น",
    labelLuckyNum: "เลขมงคล", labelTaken: "จองแล้ว", priceLabel: "บูชา 100 สลึง",
    rewardTitle: "✨ ของรางวัลใหญ่ประจำรอบ ✨",
    prize1: "รางวัลที่ ๑", prize1Name: "รถซุปเปอร์คาร์",
    prize2: "รางวัลที่ ๒", prize2Name: "สร้อยคอทองคำ",
    prize3: "รางวัลที่ ๓", prize3Name: "บัตรกำนัล",
    valuePrefix: "มูลค่า", unit: "สลึง",
    consolationTitle: "รางวัลปลอบใจ", consolationItems: "🍬 ลูกอมปีศาจแดง / 🍜 บะหมี่อวกาศ / 📒 สมุดคัมภีร์",
    logTitle: "สถานะระบบ",
    modalTitle: "ยืนยันการบูชา?", modalDesc: "ท่านต้องการเลือกเลขมงคล", modalCost: "ทำบุญ: 100 สลึง",
    btnCancel: "ยกเลิก", btnConfirm: "ยืนยัน (จ่าย 100 SLG)", 
    approving: "กำลังอนุมัติเหรียญ...", processing: "กำลังทำรายการ...",
    errNoMoney: "สลึงไม่พอ! ไปหาสลึงมาซื้อตั๋วก่อน 🪙",
    errWrongNet: "⚠️ ผิดเครือข่าย! กรุณาสลับกระเป๋าเป็น World Chain"
  },
  en: {
    title: "Golden Dragon", titleSuffix: "Lucky Star", subtitle: "WorldLucky Temple Fair",
    connect: "Connect Wallet", verified: "Verified Human", disconnect: "Logout",
    adminHall: "Administration Hall", coinName: "Salung Coins",
    exchangeTitle: "Buy Salung", rate: "Get $SLG on PUF / DEX", swapBtn: "Go to PUF.io",
    gameTitle: "Lucky Star Draw", round: "Round 89", waiting: "Waiting",
    labelLuckyNum: "Lucky No.", labelTaken: "Taken", priceLabel: "Offering 100 SLG",
    rewardTitle: "✨ Grand Prizes ✨",
    prize1: "1st Place", prize1Name: "Super Car",
    prize2: "2nd Place", prize2Name: "Gold Necklace",
    prize3: "3rd Place", prize3Name: "Voucher",
    valuePrefix: "Value", unit: "SLG",
    consolationTitle: "Consolation Prizes", consolationItems: "🍬 Devil Candy / 🍜 Space Noodle / 📒 Mystic Log",
    logTitle: "System Status",
    modalTitle: "Confirm Offering?", modalDesc: "You are choosing lucky number", modalCost: "Cost: 100 Salung",
    btnCancel: "Cancel", btnConfirm: "Confirm (Pay 100 SLG)", 
    approving: "Approving Token...", processing: "Processing...",
    errNoMoney: "Not enough Salung! Go get some first.",
    errWrongNet: "⚠️ Wrong Network! Switch to World Chain."
  }
};

export default function SalungTempleApp() {
  const [lang, setLang] = useState<"th" | "en">("th");
  const t = translations[lang];

  // Web3 State
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [salungBalance, setSalungBalance] = useState("0");
  const [wldBalance, setWldBalance] = useState("0");
  const [statusMsg, setStatusMsg] = useState(""); 

  // Game UI State
  const [players, setPlayers] = useState<number[]>([]); 
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const luckyNumbers = [999, 168, 789, 888, 456, 111, 234, 555, 987, 123, 777, 654];

  // 1. Connect Wallet Logic
  const handleConnect = async () => {
    if ((window as any).ethereum) {
      try {
        const _provider = new ethers.BrowserProvider((window as any).ethereum);
        const _signer = await _provider.getSigner();
        const _address = await _signer.getAddress();
        
        setProvider(_provider);
        setSigner(_signer);
        setUserAddress(_address);
        
        fetchBalances(_signer, _address);
      } catch (err) {
        console.error("Connect error:", err);
        alert("Connection Failed");
      }
    } else {
      alert("Please install OKX Wallet or MetaMask!");
    }
  };

  const handleDisconnect = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress("");
    setSalungBalance("0");
    setWldBalance("0");
    alert("Disconnected / ออกจากระบบแล้ว");
  };

  const fetchBalances = async (signer: any, address: string) => {
    try {
        const ethBal = await signer.provider.getBalance(address);
        setWldBalance(parseFloat(ethers.formatEther(ethBal)).toFixed(4)); 

        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
        const slgBal = await tokenContract.balanceOf(address);
        setSalungBalance(parseFloat(ethers.formatEther(slgBal)).toLocaleString());
    } catch (e) {
        console.log("Error fetching balance", e);
    }
  };

  const confirmPurchase = async () => {
    if (!signer || selectedSlot === null) return;
    setIsProcessing(true);
    setStatusMsg(t.approving);

    try {
      const network = await provider?.getNetwork();
      if (network?.chainId !== 480n) { 
         alert(t.errWrongNet);
         setIsProcessing(false);
         setStatusMsg("");
         return;
      }

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const gameContract = new ethers.Contract(GAME_ADDRESS, GAME_ABI, signer);
      
      const priceWei = ethers.parseEther(TICKET_PRICE);
      const myBalance = await tokenContract.balanceOf(userAddress);
      
      if (myBalance < priceWei) {
        alert(t.errNoMoney);
        setIsProcessing(false);
        setStatusMsg("");
        return; 
      }

      const allowance = await tokenContract.allowance(userAddress, GAME_ADDRESS);
      
      if (allowance < priceWei) {
        setStatusMsg(lang === "th" ? "กำลังขออนุญาตใช้เหรียญ..." : "Approving Token...");
        const txApprove = await tokenContract.approve(GAME_ADDRESS, priceWei);
        await txApprove.wait(); 
      }

      setStatusMsg(t.processing);
      const txEnter = await gameContract.enterGame();
      await txEnter.wait();

      alert("Success! สาธุ บุญรักษาครับ 🙏");
      setPlayers([...players, selectedSlot]); 
      fetchBalances(signer, userAddress); 
      setShowModal(false);
      setSelectedSlot(null);

    } catch (err: any) {
      console.error(err);
      if (err.code === "BAD_DATA" || err.message?.includes("could not decode")) {
         alert("Error reading data. Please ensure you are on World Chain.");
      } else if (err.reason) {
         alert("Error: " + err.reason);
      } else {
         alert("Transaction Failed / Rejected");
      }
    } finally {
      setIsProcessing(false);
      setStatusMsg("");
    }
  };

  const handleBuyTicket = (index: number) => {
    if (players.includes(index)) return; 
    if (!userAddress) {
        handleConnect();
        return;
    }
    setSelectedSlot(index);
    setShowModal(true);
  };

  const toggleLang = () => setLang(prev => prev === "th" ? "en" : "th");

  return (
    // ✅ พื้นหลังสีดำสนิท
    <div className="min-h-screen bg-black text-amber-100 font-serif selection:bg-yellow-500 selection:text-red-900 relative overflow-hidden">
      
      {/* ✅ เรียกใช้ Component ดาววิบวับ */}
      <TwinklingStars />
      
      {/* Navbar */}
      <header className="relative z-10 border-b-4 border-yellow-600 bg-red-900/80 backdrop-blur-md sticky top-0 shadow-[0_4px_20px_rgba(234,179,8,0.3)]">
        <div className="max-w-4xl mx-auto px-4 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-b from-yellow-400 to-yellow-700 rounded-full border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse-slow">
              <Sparkles size={24} className="text-red-900" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {t.title}<span className="text-red-500 ml-1">{t.titleSuffix}</span>
              </h1>
              <p className="text-[10px] md:text-xs text-yellow-300/80">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="px-3 py-1 rounded-full bg-red-950 border border-yellow-600/50 text-xs font-bold text-yellow-400 hover:bg-red-900 transition-colors flex items-center gap-1 min-w-[50px] justify-center">
              <Globe size={12} /> {lang === "th" ? "EN" : "TH"}
            </button>
            {!userAddress ? (
              <button onClick={handleConnect} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-yellow-300 to-yellow-600 text-red-950 font-bold rounded-full hover:from-yellow-200 hover:to-yellow-500 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] border-2 border-yellow-200 text-sm">
                <Wallet size={16} /> {t.connect}
              </button>
            ) : (
              <button 
                onClick={handleDisconnect}
                className="group flex items-center gap-2 px-3 py-1 border-2 border-emerald-500/50 rounded-full bg-emerald-950/30 hover:bg-red-950/50 hover:border-red-500 transition-all cursor-pointer"
                title="Click to Disconnect"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981] group-hover:bg-red-500 group-hover:shadow-none"></div>
                <span className="text-emerald-300 text-xs font-bold hidden md:inline group-hover:hidden">
                    {userAddress.slice(0,6)}...{userAddress.slice(-4)}
                </span>
                <span className="text-red-400 text-xs font-bold hidden group-hover:flex items-center gap-1">
                    <LogOut size={12} /> {t.disconnect}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-900 to-red-950 border-2 border-yellow-600/50 relative overflow-hidden group shadow-[0_0_25px_rgba(220,38,38,0.2)]">
            <div className="absolute -right-10 -top-10 text-yellow-600/10 rotate-12"><Scroll size={120} /></div>
            <h2 className="text-yellow-300/70 text-sm mb-2 flex items-center gap-2 uppercase tracking-widest font-bold">
              <User size={16} /> {t.adminHall}
            </h2>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-4xl font-black text-yellow-400 drop-shadow-md">{salungBalance}</p>
                <p className="text-yellow-200 text-sm">{t.coinName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400 drop-shadow-md">{wldBalance}</p>
                <p className="text-emerald-200/70 text-sm">ETH (Gas)</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border-2 border-emerald-600/50 flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.2)] relative overflow-hidden">
             <div className="absolute -left-10 -bottom-10 text-emerald-600/10 -rotate-12"><Banknote size={120} /></div>
            <div className="relative z-10">
              <h2 className="text-emerald-300 text-sm mb-2 flex items-center gap-2 font-bold">
                <ExternalLink size={16} /> {t.exchangeTitle}
              </h2>
              <p className="text-xs text-emerald-100/70 mb-3 bg-emerald-800/50 px-2 py-1 rounded inline-block">
                {t.rate}
              </p>
              <a href="https://puf.io" target="_blank" rel="noopener noreferrer" className="block text-center px-5 py-2 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg border border-emerald-400">
                {t.swapBtn}
              </a>
            </div>
          </div>
        </section>

        {/* Game Board */}
        <section className="space-y-4 bg-red-950/50 p-4 rounded-3xl border-4 border-yellow-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-yellow-400 drop-shadow">
              <Sparkles size={24} className="text-red-500" />
              {t.gameTitle} <span className="text-base md:text-lg text-yellow-200/80 hidden md:inline">{t.round}</span>
            </h2>
            <div className="px-4 py-1 bg-red-600 text-yellow-200 border-2 border-yellow-400 rounded-full text-xs md:text-sm font-bold animate-bounce">
              {t.waiting} ( {players.length} / 12 )
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 p-2">
            {luckyNumbers.map((num, idx) => {
              const isTaken = players.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleBuyTicket(idx)}
                  disabled={isTaken}
                  className={`
                    relative h-36 rounded-xl border-[3px] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group shadow-lg
                    ${isTaken 
                      ? "bg-red-950/80 border-red-900 cursor-not-allowed opacity-60 grayscale contrast-125" 
                      : "bg-gradient-to-b from-red-800 via-red-900 to-black border-yellow-500 hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:-translate-y-1" 
                    }
                  `}
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-20 mix-blend-overlay">
                     <span className="text-[10rem] transform -rotate-12 filter blur-[2px] text-red-500">🐉</span>
                  </div>
                  {isTaken ? (
                    <>
                      <div className="w-16 h-16 bg-red-950 rounded-full border-2 border-red-800 flex items-center justify-center mb-2 relative z-10 grayscale">
                        <User size={32} className="text-red-500/50" />
                      </div>
                      <span className="text-xs text-red-300/50 font-bold relative z-10">{t.labelTaken} #{idx+1}</span>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] text-yellow-200 mb-2 font-bold uppercase tracking-widest relative z-10 border-b-2 border-yellow-500/30 pb-1">
                        {t.labelLuckyNum}
                      </div>
                      <div className="text-4xl md:text-5xl font-black relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform">{num}</div>
                      <div className="mt-3 text-[10px] md:text-xs text-yellow-100 bg-red-700/80 px-2 py-1 rounded-full border border-yellow-500/50 relative z-10 shadow-sm whitespace-nowrap">{t.priceLabel}</div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ✅ Prizes Section (พื้นหลังขาวสะอาด ตามที่ขอ) */}
        <section className="bg-white rounded-2xl border-4 border-yellow-600/30 p-6 relative overflow-hidden shadow-xl text-gray-900">
            <div className="text-center text-yellow-800 font-black uppercase tracking-wider mb-6">{t.rewardTitle}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {/* รางวัลที่ 2 */}
                <div>
                    <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full border-2 border-yellow-400 flex items-center justify-center mb-4 shadow-sm">
                        <Gem size={32} className="text-yellow-600" />
                    </div>
                    <h3 className="font-bold text-gray-800">{t.prize2Name}</h3>
                     <div className="text-red-600 font-bold text-sm">{t.valuePrefix} 240 {t.unit}</div>
                </div>
                {/* รางวัลที่ 1 */}
                <div>
                    <div className="relative w-28 h-28 mx-auto bg-gradient-to-tr from-blue-100 to-cyan-50 rounded-full border-4 border-blue-300 flex items-center justify-center mb-4 shadow-lg animate-pulse-slow">
                        <CarFront size={48} className="text-blue-900" />
                        <div className="absolute -top-3 -right-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-400 shadow-sm">
                        TOP PRIZE
                        </div>
                    </div>
                    <h3 className="font-black text-xl text-gray-900">{t.prize1Name}</h3>
                    <div className="text-red-600 font-black text-lg">{t.valuePrefix} 750 {t.unit}</div>
                </div>
                {/* รางวัลที่ 3 */}
                <div>
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full border-2 border-red-400 flex items-center justify-center mb-4 shadow-sm">
                        <CreditCard size={32} className="text-red-600" />
                    </div>
                    <h3 className="font-bold text-gray-800">{t.prize3Name}</h3>
                    <div className="text-red-600 font-bold text-sm">{t.valuePrefix} 120 {t.unit}</div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-200 px-4 text-gray-600 text-xs font-bold rounded-full">{t.consolationTitle}</div>
                <p className="text-sm text-gray-700 flex items-center justify-center gap-3 font-medium mt-2">{t.consolationItems}</p>
            </div>
        </section>

        {/* Status Log */}
        <section className="bg-red-950/40 rounded-xl p-4 font-mono text-xs text-amber-200/60 border-2 border-red-900 h-32 overflow-hidden relative shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-yellow-600/80 border-b border-red-900 pb-1 font-bold">
                <History size={14} /> {t.logTitle}
            </div>
            <ul className="space-y-1 opacity-80 font-serif">
                {statusMsg && <li className="text-yellow-400 animate-pulse">&gt;&gt; {statusMsg}</li>}
                <li>[System] Contract: {GAME_ADDRESS.slice(0,6)}...</li>
                <li>[System] Ready.</li>
            </ul>
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-red-900 to-black border-4 border-yellow-600 rounded-3xl p-8 w-full max-w-sm relative shadow-[0_0_60px_rgba(234,179,8,0.3)] text-center">
            <h3 className="text-2xl font-black text-yellow-300 mb-2 drop-shadow">{t.modalTitle}</h3>
            <p className="text-amber-100/80 mb-6 text-lg">
              {t.modalDesc} <br/>
              <span className="text-4xl font-black text-yellow-500 drop-shadow-lg my-4 block">{luckyNumbers[selectedSlot!]}</span>
              <span className="text-red-300">{t.modalCost}</span>
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border-2 border-red-700 text-red-300 hover:bg-red-950/50 font-bold transition-colors" disabled={isProcessing}>
                {t.btnCancel}
              </button>
              <button onClick={confirmPurchase} disabled={isProcessing} className="flex-1 py-3 rounded-xl bg-gradient-to-b from-yellow-500 to-yellow-700 text-red-950 font-black hover:from-yellow-400 hover:to-yellow-600 shadow-lg border-2 border-yellow-300 transition-all hover:scale-105 disabled:opacity-50">
                {isProcessing ? t.processing : t.btnConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}