"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// ✅ ยังใช้ TwinklingStars ได้ครับ พอมันอยู่บนพื้นหลังสว่าง จะดูเหมือนประกายวิบวับน่ารักๆ
import TwinklingStars from "./TwinklingStars"; 
// ✅ เปลี่ยนไอคอนใหม่หมดให้เป็นแนวของเล่น น่ารักๆ
import { Sparkles, Wallet, Gift, Puzzle, Rocket, Star, Smile, Baby, Gamepad2, Globe, LogOut } from "lucide-react";

// --- 1. Blockchain Config (เหมือนเดิม) ---
const GAME_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"; 
const TOKEN_ADDRESS = "0x8a26fA986f360EA0B7CDad1E15C5698786b582BC"; 
const TICKET_PRICE = "100"; 

// ABI (เหมือนเดิม)
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

// --- 2. คำศัพท์ฉบับ "Toyland Theme" (น่ารัก สดใส ไม่ใช่การพนัน) ---
const translations = {
  th: {
    title: "Toyland", titleSuffix: "Adventure", subtitle: "สะสมของเล่นสุดมหัศจรรย์บน World Chain!",
    connect: "เชื่อมต่อกระเป๋าของเล่น", verified: "ยืนยันตัวหนูแล้ว", disconnect: "กลับบ้าน",
    adminHall: "กล่องเก็บของเล่นหนู", coinName: "เหรียญของเล่น (TOY COIN)",
    exchangeTitle: "เติมเหรียญเพิ่ม", rate: "แลกเหรียญที่ PUF.io นะ", swapBtn: "ไปแลกเหรียญ",
    
    gameTitle: "ภารกิจตามหาของเล่น", round: "ด่านที่ ๘๙", waiting: "รอเพื่อนๆ...",
    labelLuckyNum: "ปุ่มกด", labelTaken: "เพื่อนกดแล้ว", 
    priceLabel: "ใช้ 100 เหรียญ",

    rewardTitle: "✨ ของเล่นในตำนานประจำด่าน ✨",
    prize1: "รางวัลใหญ่สุด", prize1Name: "หุ่นยนต์ยักษ์โรโบ", // Giant Robot
    prize2: "รางวัลรอง", prize2Name: "ตุ๊กตาหมีซุปเปอร์", // Super Teddy Bear
    prize3: "รางวัลสาม", prize3Name: "ชุดตัวต่อวิเศษ", // Magic Puzzle Set
    
    valuePrefix: "มูลค่า", unit: "เหรียญ",
    consolationTitle: "ของรางวัลปลอบใจน่ารักๆ", consolationItems: "🍭 ลูกอมสายรุ้ง / 🧸 สติ๊กเกอร์หมี / 🎈 ลูกโป่งวิเศษ",
    
    logTitle: "สถานะตู้ของเล่น",
    modalTitle: "จะกดปุ่มนี้เหรอ?", modalDesc: "หนูต้องการใช้เหรียญกดปุ่มหมายเลข", modalCost: "ต้องใช้: 100 เหรียญของเล่น",
    btnCancel: "ไมเอาดีกว่า", btnConfirm: "กดเลย! (จ่าย 100)", 
    approving: "กำลังหยอดเหรียญ...", processing: "ตู้กำลังทำงาน...",
    errNoMoney: "เหรียญไม่พอจ้า! ไปหาเหรียญของเล่นมาเพิ่มก่อนนะ 🪙",
    errWrongNet: "⚠️ ผิดที่แล้ว! กลับไปที่ World Chain ก่อนนะเด็กดี"
  },
  en: {
    title: "Toyland", titleSuffix: "Adventure", subtitle: "Collect magical toys on World Chain!",
    connect: "Connect Toy Wallet", verified: "Verified Kid", disconnect: "Go Home",
    adminHall: "My Toy Box", coinName: "Toy Coins ($SLG)",
    exchangeTitle: "Get More Coins", rate: "Swap at PUF.io", swapBtn: "Go Swap",
    
    gameTitle: "Toy Hunt Mission", round: "Level 89", waiting: "Waiting for friends...",
    labelLuckyNum: "Button", labelTaken: "Taken!", 
    priceLabel: "Use 100 Coins",

    rewardTitle: "✨ Legendary Toys of the Level ✨",
    prize1: "Top Prize", prize1Name: "Giant Robo-Rex",
    prize2: "2nd Prize", prize2Name: "Super Teddy Bear",
    prize3: "3rd Prize", prize3Name: "Magic Puzzle Set",
    
    valuePrefix: "Value", unit: "Coins",
    consolationTitle: "Cute Consolation Prizes", consolationItems: "🍭 Rainbow Pop / 🧸 Bear Sticker / 🎈 Magic Balloon",
    
    logTitle: "Toy Machine Status",
    modalTitle: "Press this button?", modalDesc: "You are using coins to press button number", modalCost: "Cost: 100 Toy Coins",
    btnCancel: "No thanks", btnConfirm: "Press it! (Pay 100)", 
    approving: "Inserting coin...", processing: "Machine is working...",
    errNoMoney: "Not enough Toy Coins! Go find some more.",
    errWrongNet: "⚠️ Wrong place! Switch back to World Chain, kiddos."
  }
};

export default function SalungTempleApp() {
  const [lang, setLang] = useState<"th" | "en">("en"); // เริ่มต้น EN เพื่อความปลอดภัยตอนตรวจ
  const t = translations[lang];

  // Web3 State (เหมือนเดิม)
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

  // 1. Connect Wallet Logic (เหมือนเดิม)
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
      alert("Please install World App Wallet or MetaMask!");
    }
  };

  const handleDisconnect = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress("");
    setSalungBalance("0");
    setWldBalance("0");
    alert("Bye bye!");
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

  // 2. Buy Ticket Logic (เหมือนเดิม)
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
        setStatusMsg(lang === "th" ? "กำลังหยอดเหรียญ..." : "Approving...");
        const txApprove = await tokenContract.approve(GAME_ADDRESS, priceWei);
        await txApprove.wait(); 
      }

      setStatusMsg(t.processing);
      const txEnter = await gameContract.enterGame();
      await txEnter.wait();

      alert("Yay! You pressed the button! 🎉");
      setPlayers([...players, selectedSlot]); 
      fetchBalances(signer, userAddress); 
      setShowModal(false);
      setSelectedSlot(null);

    } catch (err: any) {
      console.error(err);
      if (err.code === "BAD_DATA" || err.message?.includes("could not decode")) {
         alert("Oops! Wrong network. Please use World Chain.");
      } else if (err.reason) {
         alert("Error: " + err.reason);
      } else {
         alert("Something went wrong. Try again!");
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
    // ✅ พื้นหลังใหม่: ท้องฟ้าสดใส (Blue Gradient) แทนสีดำ
    // ✅ ฟอนต์ใหม่: ใช้ sans-serif (เช่น ui-sans-serif, system-ui) ให้ดูนุ่มนวลขึ้น
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-blue-200 to-pink-100 text-blue-900 font-sans selection:bg-pink-300 selection:text-white relative overflow-hidden">
      
      {/* ดาววิบวับ (บนพื้นสว่างจะดูเหมือนประกายเวทมนตร์) */}
      <TwinklingStars />
      
      {/* Navbar สไตล์ของเล่น (ขอบมนๆ สีสดใส) */}
      <header className="relative z-10 border-b-[6px] border-pink-400 bg-white/80 backdrop-blur-md sticky top-0 shadow-lg rounded-b-[2rem] mx-2 mt-2">
        <div className="max-w-4xl mx-auto px-6 h-20 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-bounce-slow">
            <div className="p-3 bg-gradient-to-tr from-yellow-300 to-orange-400 rounded-full border-4 border-white shadow-md">
              <Gamepad2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500 drop-shadow-sm" style={{ fontFamily: '"Comic Sans MS", "Arial Rounded MT Bold", sans-serif' }}>
                {t.title}<span className="text-orange-500 ml-2">{t.titleSuffix}</span>
              </h1>
              <p className="text-sm text-blue-600/80 font-bold">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLang} className="px-4 py-2 rounded-full bg-blue-100 border-4 border-blue-300 text-sm font-black text-blue-600 hover:bg-blue-200 transition-all flex items-center gap-2 shadow-sm hover:scale-105">
              <Globe size={16} /> {lang === "th" ? "EN" : "TH"}
            </button>
            {!userAddress ? (
              <button onClick={handleConnect} className="hidden md:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black rounded-full hover:from-green-500 hover:to-blue-600 transition-all shadow-md border-4 border-white text-sm hover:scale-105 hover:-rotate-2">
                <Wallet size={20} /> {t.connect}
              </button>
            ) : (
              <button 
                onClick={handleDisconnect}
                className="group flex items-center gap-2 px-4 py-2 border-4 border-green-400 rounded-full bg-green-100 hover:bg-red-100 hover:border-red-400 transition-all cursor-pointer shadow-sm"
                title="Click to Disconnect"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse group-hover:bg-red-500"></div>
                <span className="text-green-700 text-sm font-black hidden md:inline group-hover:hidden">
                    {userAddress.slice(0,6)}...
                </span>
                <span className="text-red-600 text-sm font-black hidden group-hover:flex items-center gap-1">
                    <LogOut size={16} /> {t.disconnect}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Dashboard (กล่องสไตล์ตัวต่อ Lego) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-400 to-blue-300 border-[6px] border-white text-white relative overflow-hidden group shadow-xl hover:scale-[1.02] transition-transform">
            <div className="absolute -right-8 -top-8 text-white/20 rotate-12"><Smile size={140} /></div>
            <h2 className="text-blue-100 text-lg mb-2 flex items-center gap-2 font-black bg-blue-500/30 inline-block px-3 py-1 rounded-full">
              <Baby size={20} /> {t.adminHall}
            </h2>
            <div className="flex justify-between items-end relative z-10 mt-4">
              <div>
                <p className="text-5xl font-black drop-shadow-md" style={{ fontFamily: '"Comic Sans MS", sans-serif' }}>{salungBalance}</p>
                <p className="text-blue-100 font-bold">{t.coinName}</p>
              </div>
              <div className="text-right bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <p className="text-2xl font-black">{wldBalance}</p>
                <p className="text-blue-100 text-sm font-bold">ETH Gas</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-pink-400 to-orange-300 border-[6px] border-white text-white flex items-center justify-between shadow-xl relative overflow-hidden hover:scale-[1.02] transition-transform">
             <div className="absolute -left-8 -bottom-8 text-white/20 -rotate-12"><Rocket size={140} /></div>
            <div className="relative z-10">
              <h2 className="text-white text-lg mb-2 flex items-center gap-2 font-black bg-pink-500/30 inline-block px-3 py-1 rounded-full">
                <RefreshCw size={20} /> {t.exchangeTitle}
              </h2>
              <p className="text-sm text-white font-bold mb-4 bg-white/20 px-3 py-1 rounded-full inline-block">
                {t.rate}
              </p>
              <a href="https://puf.io" target="_blank" rel="noopener noreferrer" className="block text-center px-6 py-3 bg-white text-pink-600 hover:bg-yellow-200 hover:text-orange-600 rounded-full text-lg font-black transition-all shadow-md border-4 border-pink-200 hover:scale-105 hover:rotate-2">
                {t.swapBtn} 🚀
              </a>
            </div>
          </div>
        </section>

        {/* Game Board (กระดานของเล่น) */}
        <section className="space-y-6 bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] border-[8px] border-yellow-400 shadow-2xl relative overflow-hidden">
          {/* พื้นหลังลายตัวการ์ตูนจางๆ */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
              <span className="text-[15rem]">🧸</span>
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 text-blue-700 drop-shadow-sm" style={{ fontFamily: '"Comic Sans MS", sans-serif' }}>
              <Star size={32} className="text-yellow-500 fill-yellow-400 animate-spin-slow" />
              {t.gameTitle} <span className="text-lg bg-blue-200 text-blue-700 px-3 py-1 rounded-full hidden md:inline">{t.round}</span>
            </h2>
            <div className="px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white border-4 border-white rounded-full text-sm md:text-base font-black shadow-md animate-bounce">
              {t.waiting} ( {players.length} / 12 )
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-2 relative z-10">
            {luckyNumbers.map((num, idx) => {
              const isTaken = players.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleBuyTicket(idx)}
                  disabled={isTaken}
                  className={`
                    relative h-36 rounded-[1.5rem] border-[5px] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group shadow-lg
                    ${isTaken 
                      ? "bg-gray-200 border-gray-400 cursor-not-allowed opacity-80 grayscale" 
                      : "bg-gradient-to-b from-yellow-200 to-orange-200 border-yellow-400 hover:border-blue-400 hover:from-blue-200 hover:to-purple-200 hover:shadow-xl hover:-translate-y-2 hover:rotate-2" 
                    }
                  `}
                >
                  {/* ลบพื้นหลังมังกรออก ใส่เป็นไอคอนน่ารักๆ แทน */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-10">
                     <span className="text-[8rem]">{isTaken ? '🔒' : '🎮'}</span>
                  </div>

                  {isTaken ? (
                    <>
                      <div className="w-16 h-16 bg-gray-300 rounded-full border-4 border-gray-400 flex items-center justify-center mb-2 relative z-10">
                        <Baby size={32} className="text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-600 font-black relative z-10 bg-gray-300 px-2 rounded-full">{t.labelTaken}</span>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-orange-600 mb-1 font-black uppercase tracking-widest relative z-10 bg-orange-100 px-3 py-0.5 rounded-full">
                        {t.labelLuckyNum}
                      </div>
                      <div className="text-4xl md:text-5xl font-black relative z-10 text-blue-800 drop-shadow-sm group-hover:scale-110 transition-transform" style={{ fontFamily: '"Comic Sans MS", sans-serif' }}>
                        {num}
                      </div>
                      <div className="mt-2 text-xs text-white bg-pink-500 px-3 py-1.5 rounded-full border-2 border-white relative z-10 shadow-sm whitespace-nowrap font-bold group-hover:bg-blue-500">
                        {t.priceLabel}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Prizes Section (Safe Mode - Toy Style) */}
        <section className="bg-white rounded-[2.5rem] border-[8px] border-blue-300 p-8 relative overflow-hidden shadow-xl text-blue-900">
            <div className="text-center text-2xl text-blue-700 font-black uppercase tracking-wider mb-8 bg-blue-100 inline-block px-6 py-2 rounded-full mx-auto block shadow-sm" style={{ fontFamily: '"Comic Sans MS", sans-serif' }}>
                {t.rewardTitle}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {/* รางวัลที่ 2 - Super Teddy */}
                <div className="bg-pink-50 p-4 rounded-[2rem] border-4 border-pink-200 shadow-md hover:scale-105 transition-transform">
                    <div className="w-24 h-24 mx-auto bg-pink-200 rounded-full border-4 border-pink-400 flex items-center justify-center mb-4 shadow-inner">
                        <Gift size={48} className="text-pink-600 fill-pink-300" />
                    </div>
                    <h3 className="font-black text-lg text-pink-700">{t.prize2Name}</h3>
                     <div className="text-pink-500 font-bold text-sm bg-pink-100 px-3 py-1 rounded-full inline-block mt-2">{t.valuePrefix} 240 {t.unit}</div>
                </div>
                {/* รางวัลที่ 1 - Giant Robot (ตรงกลาง ใหญ่สุด) */}
                <div className="bg-blue-50 p-4 rounded-[2rem] border-4 border-blue-300 shadow-lg scale-110 z-10 hover:scale-115 transition-transform relative">
                    <div className="absolute -top-4 inset-x-0 flex justify-center">
                        <span className="bg-red-500 text-white text-xs font-black px-4 py-1 rounded-full border-2 border-white shadow-sm animate-bounce">
                            WOW! BIG PRIZE!
                        </span>
                    </div>
                    <div className="relative w-32 h-32 mx-auto bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full border-[6px] border-blue-400 flex items-center justify-center mb-4 shadow-inner animate-pulse-slow mt-4">
                        <Rocket size={64} className="text-blue-700 fill-blue-300 rotate-12" />
                    </div>
                    <h3 className="font-black text-2xl text-blue-800" style={{ fontFamily: '"Comic Sans MS", sans-serif' }}>{t.prize1Name}</h3>
                    <div className="text-red-600 font-black text-xl bg-red-100 px-4 py-1 rounded-full inline-block mt-2 border-2 border-red-200">{t.valuePrefix} 750 {t.unit}</div>
                </div>
                {/* รางวัลที่ 3 - Magic Puzzle */}
                <div className="bg-green-50 p-4 rounded-[2rem] border-4 border-green-200 shadow-md hover:scale-105 transition-transform">
                    <div className="w-24 h-24 mx-auto bg-green-200 rounded-full border-4 border-green-400 flex items-center justify-center mb-4 shadow-inner">
                        <Puzzle size={48} className="text-green-600 fill-green-300" />
                    </div>
                    <h3 className="font-black text-lg text-green-700">{t.prize3Name}</h3>
                    <div className="text-green-500 font-bold text-sm bg-green-100 px-3 py-1 rounded-full inline-block mt-2">{t.valuePrefix} 120 {t.unit}</div>
                </div>
            </div>
            <div className="mt-10 pt-6 border-t-4 border-blue-100 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-300 px-6 py-1 text-yellow-800 text-sm font-black rounded-full border-2 border-white shadow-sm">
                    {t.consolationTitle}
                </div>
                <p className="text-base text-blue-600 flex items-center justify-center gap-3 font-bold mt-4 bg-blue-50 p-3 rounded-xl">
                    {t.consolationItems}
                </p>
            </div>
        </section>

        {/* Status Log (จอคอมของเล่น) */}
        <section className="bg-gray-800 rounded-[1.5rem] p-4 font-mono text-sm text-green-400 border-[6px] border-gray-600 h-36 overflow-hidden relative shadow-inner font-bold">
            <div className="flex items-center gap-2 mb-2 text-gray-300 border-b-2 border-gray-600 pb-1 font-black bg-gray-700 px-2 rounded-md">
                <Gamepad2 size={16} /> {t.logTitle}
            </div>
            <ul className="space-y-1 opacity-90 tracking-wider">
                {statusMsg && <li className="text-yellow-300 animate-pulse">🚀 {statusMsg}</li>}
                <li>[ToyOS] Connecting to Toy Contract: {GAME_ADDRESS.slice(0,6)}...</li>
                <li>[ToyOS] System Ready to Play! Beep Boop.</li>
            </ul>
        </section>
      </main>

      {/* Modal (กล่องเด้งป๊อปอัพน่ารักๆ) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border-[8px] border-pink-300 rounded-[3rem] p-8 w-full max-w-sm relative shadow-2xl text-center transform hover:scale-105 transition-transform animate-in zoom-in-95 duration-200">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-pink-500 p-4 rounded-full border-4 border-white shadow-md">
                <Star size={40} className="text-white animate-spin-slow fill-yellow-300" />
            </div>
            <h3 className="text-3xl font-black text-pink-600 mb-4 mt-6" style={{ fontFamily: '"Comic Sans MS", sans-serif' }}>
                {t.modalTitle}
            </h3>
            <p className="text-blue-700 mb-6 text-lg font-bold">
              {t.modalDesc} <br/>
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 drop-shadow-sm my-4 block animate-pulse" style={{ fontFamily: '"Comic Sans MS", sans-serif' }}>
                {luckyNumbers[selectedSlot!]}
              </span>
              <span className="text-white bg-blue-400 px-4 py-1 rounded-full text-base">
                {t.modalCost}
              </span>
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-full border-4 border-gray-300 text-gray-500 font-black hover:bg-gray-100 transition-colors text-lg" disabled={isProcessing}>
                {t.btnCancel} 🤮
              </button>
              <button onClick={confirmPurchase} disabled={isProcessing} className="flex-1 py-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-black hover:from-green-500 hover:to-blue-600 shadow-lg border-4 border-white transition-all hover:scale-105 disabled:opacity-50 text-lg hover:rotate-2">
                {isProcessing ? t.processing : t.btnConfirm} 🤩
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
