"use client";

import React, { useState } from "react";
// ✅ เพิ่ม Gem (เครื่องประดับ) และ CreditCard (การ์ด) เข้ามาครับ
import { Rocket, Wallet, RefreshCw, Zap, Trophy, History, Star, User, CarFront, Gem, CreditCard } from "lucide-react";

export default function SalungSpaceApp() {
  // --- Mock State ---
  const [isConnected, setIsConnected] = useState(false);
  const [salungBalance, setSalungBalance] = useState(0);
  const [wldBalance, setWldBalance] = useState(10.5);
  const [players, setPlayers] = useState<number[]>([]); 
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const luckyNumbers = [999, 168, 789, 888, 456, 111, 234, 555, 987, 123, 777, 654];

  const handleConnect = () => {
    setIsConnected(true);
    setSalungBalance(500); 
  };

  const handleBuyTicket = (index: number) => {
    if (players.includes(index)) return; 
    setSelectedSlot(index);
    setShowModal(true);
  };

  const confirmPurchase = () => {
    if (selectedSlot !== null) {
      setPlayers([...players, selectedSlot]);
      setSalungBalance((prev) => prev - 100);
      setShowModal(false);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500 selection:text-black">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1e1b4b] to-black"></div>
      
      {/* --- Navbar --- */}
      <header className="relative z-10 border-b border-cyan-900/50 bg-black/30 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              <Rocket size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              WORLD<span className="text-white">LUCKY</span>
            </h1>
          </div>

          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Wallet size={18} /> Connect World ID
            </button>
          ) : (
            <div className="flex items-center gap-3 px-4 py-1.5 border border-cyan-500/30 rounded-full bg-cyan-950/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-cyan-200 text-sm">Human Verified</span>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* --- 1. Dashboard --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-slate-400 text-sm mb-1 uppercase tracking-widest">Command Center</h2>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-white">{salungBalance.toLocaleString()}</p>
                <p className="text-cyan-400 text-sm font-mono">$SALUNG</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-300">{wldBalance.toFixed(2)}</p>
                <p className="text-slate-500 text-sm font-mono">WLD Balance</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-900/50 border border-indigo-500/30 backdrop-blur-sm flex items-center justify-between">
            <div>
              <h2 className="text-indigo-300 text-sm mb-2 flex items-center gap-2">
                <RefreshCw size={14} /> EXCHANGE UNIT
              </h2>
              <p className="text-xs text-slate-400 mb-2">Rate: 1 WLD = 400 SALUNG</p>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_10px_rgba(79,70,229,0.4)]">
                Swap WLD to SALUNG
              </button>
            </div>
            <Zap size={48} className="text-indigo-500/20" />
          </div>
        </section>

        {/* --- 2. Game Board (DRAGON EDITION 🐉) --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <span className="w-1 h-6 bg-cyan-500 rounded-full inline-block"></span>
              MISSION #89
            </h2>
            <div className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm font-mono animate-pulse">
              WAITING FOR PILOTS ( {players.length} / 12 )
            </div>
          </div>

          {/* The Grid: Cyber Dragon Talismans */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {luckyNumbers.map((num, idx) => {
              const isTaken = players.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleBuyTicket(idx)}
                  disabled={isTaken}
                  className={`
                    relative h-32 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group
                    ${isTaken 
                      ? "bg-slate-800 border-slate-700 cursor-not-allowed opacity-50 grayscale" 
                      : "bg-gradient-to-b from-red-900 via-red-950 to-black border-yellow-600/50 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] hover:-translate-y-1" 
                    }
                  `}
                >
                  {!isTaken && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                      <span className="text-9xl opacity-10 transform -rotate-12 scale-150 filter blur-[1px]">
                        🐉
                      </span>
                    </div>
                  )}

                  {isTaken ? (
                    <>
                      <User size={32} className="text-slate-500 mb-2 relative z-10" />
                      <span className="text-xs text-slate-500 font-mono relative z-10">PILOT #{idx+1}</span>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] text-yellow-600/80 mb-1 font-mono uppercase tracking-widest relative z-10 border border-yellow-900/30 px-2 rounded bg-black/40">
                        Dragon Sector
                      </div>
                      
                      <div className="text-4xl font-black font-mono relative z-10
                                    text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700
                                    drop-shadow-[0_0_5px_rgba(234,179,8,0.8)] group-hover:scale-110 transition-transform">
                        {num}
                      </div>

                      <div className="mt-2 text-[10px] text-yellow-500/70 relative z-10">
                        100 SLG
                      </div>

                      <div className="absolute top-1 right-1 text-yellow-200 opacity-50 animate-pulse text-[8px]">✨</div>
                      <div className="absolute bottom-1 left-1 text-yellow-200 opacity-50 animate-pulse text-[8px] delay-75">✨</div>
                    </>
                  )}

                  {!isTaken && (
                    <>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-500 rounded-tl-md"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-500 rounded-br-md"></div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* --- 3. Prizes (แก้ไขใหม่ตามสั่ง) --- */}
        <section className="bg-gradient-to-b from-slate-900 to-black rounded-2xl border border-slate-800 p-6">
          <h3 className="text-center text-cyan-500 font-mono text-sm mb-6 uppercase tracking-[0.2em]">--- Mission Rewards ---</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            {/* 2nd Place: Gold Necklace (ใช้รูป Gem แทนเครื่องประดับ) */}
            <div className="pt-8 order-2 md:order-1 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-20 h-20 mx-auto bg-yellow-900/20 rounded-full border border-yellow-700 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                {/* ✅ เปลี่ยนเป็นรูป Gem */}
                <Gem size={32} className="text-yellow-500" />
              </div>
              <h4 className="text-yellow-500 font-bold">GOLD NECKLACE</h4>
              <p className="text-sm text-slate-500">2nd Place (20%)</p>
              <p className="text-xs text-slate-600 mt-1">Value: 240 SLG</p>
            </div>

            {/* 1st Place: Super Car */}
            <div className="order-1 md:order-2 transform scale-110">
              <div className="relative w-28 h-28 mx-auto bg-gradient-to-tr from-cyan-900 to-blue-900 rounded-full border-2 border-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-pulse-slow">
                <CarFront size={48} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full border border-red-400">
                  TOP PRIZE
                </div>
              </div>
              <h4 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-white">
                SUPER CAR
              </h4>
              <p className="text-sm text-cyan-400">1st Place (60%)</p>
              <p className="text-xs text-slate-500 mt-1">Value: 720 SLG</p>
            </div>

            {/* 3rd Place: Red Voucher (ใช้ CreditCard สีแดง) */}
            <div className="pt-8 order-3 opacity-80 hover:opacity-100 transition-opacity">
              {/* ✅ เปลี่ยนสีธีมเป็นสีแดงทั้งหมด */}
              <div className="w-20 h-20 mx-auto bg-red-900/20 rounded-full border border-red-700 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {/* ✅ ใช้รูป CreditCard */}
                <CreditCard size={32} className="text-red-500" />
              </div>
              <h4 className="text-red-500 font-bold">VOUCHER</h4>
              <p className="text-sm text-slate-500">3rd Place (10%)</p>
              <p className="text-xs text-slate-600 mt-1">Value: 120 SLG</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
             <p className="text-xs text-slate-600 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                Consolation Prize: Space Noodle / Nebula Candy / Captain's Log
             </p>
          </div>
        </section>

        {/* History Log */}
        <section className="bg-black/40 rounded-lg p-4 font-mono text-xs text-slate-400 border border-slate-800 h-32 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-1">
                <History size={12} /> SYSTEM LOGS
            </div>
            <ul className="space-y-1 opacity-70">
                <li>[14:02:05] Pilot 0x8a...42 landed in Sector 999</li>
                <li>[14:01:22] Pilot 0x1b...cc exchanged 10 WLD for 4000 SLG</li>
                <li>[14:00:00] System Initialized. Waiting for input...</li>
            </ul>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent"></div>
        </section>
      </main>

      {/* --- Modal (Confirm Purchase) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 w-full max-w-sm relative shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <h3 className="text-xl font-bold text-white mb-2">CONFIRM LAUNCH?</h3>
            <p className="text-slate-400 mb-6">
              You are about to book Sector <span className="text-cyan-400 font-bold font-mono">{luckyNumbers[selectedSlot!]}</span>. 
              <br/>Cost: <span className="text-white">100 SALUNG</span>
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:bg-slate-800 font-bold"
              >
                ABORT
              </button>
              <button 
                onClick={confirmPurchase}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-shadow"
              >
                ENGAGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}