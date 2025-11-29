"use client";

import React, { useState, useEffect, useCallback } from "react";

// กำหนดหน้าตาของข้อมูลดาว 1 ดวง
interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

const TwinklingStars = () => {
  const [stars, setStars] = useState<Star[]>([]);

  // ฟังก์ชันสำหรับสร้างดาว 1 ดวงแบบสุ่ม
  const createStar = useCallback(() => {
    const id = Date.now() + Math.random(); // สร้าง ID ไม่ให้ซ้ำ
    const newStar: Star = {
      id,
      // สุ่มตำแหน่งแนวตั้ง (0-100%)
      top: `${Math.random() * 100}%`,
      // สุ่มตำแหน่งแนวนอน ซ้ายบ้าง ขวาบ้าง (0-100%)
      left: `${Math.random() * 100}%`,
      // สุ่มขนาดเล็กๆ (1px ถึง 3px)
      size: `${Math.random() * 2 + 1}px`,
      // สุ่มระยะเวลาแสดงผล (2วิ ถึง 5วิ) ให้ดูมีมิติ ไม่พร้อมกัน
      duration: `${Math.random() * 3 + 2}s`,
      // สุ่มดีเลย์ก่อนเริ่มนิดหน่อย
      delay: `${Math.random() * 0.5}s`
    };

    // เพิ่มดาวดวงใหม่เข้าไปใน State
    setStars((prevStars) => [...prevStars, newStar]);

    // สำคัญ: ตั้งเวลาลบดาวดวงนี้ทิ้งเมื่อแสดงผลเสร็จ (ตาม duration ที่สุ่มได้)
    // เพื่อไม่ให้ browser ทำงานหนักเกินไป
    setTimeout(() => {
      setStars((prevStars) => prevStars.filter((star) => star.id !== id));
    }, parseFloat(newStar.duration) * 1000 + parseFloat(newStar.delay) * 1000);

  }, []);

  useEffect(() => {
    // สร้างดาวดวงใหม่ทุกๆ 400 มิลลิวินาที (ปรับเลขนี้ถ้าอยากให้มาถึ่ขึ้นหรือช้าลง)
    // เช่น 200 = มาไวมาก, 800 = มาช้าๆ
    const intervalId = setInterval(createStar, 400);

    // ล้าง interval เมื่อปิดหน้าเว็บ
    return () => clearInterval(intervalId);
  }, [createStar]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* CSS Animation สำหรับให้ดาววิบวับแล้วหายไป */}
      <style jsx>{`
        @keyframes twinkle-fade {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 4px #fff, 0 0 8px #fff; }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
      
      {/* วนลูปแสดงดาวแต่ละดวง */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            // ใช้ animation ที่เรานิยามไว้ข้างบน
            animationName: 'twinkle-fade',
            animationDuration: star.duration,
            animationDelay: star.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 1, // เล่นรอบเดียวแล้วจบ (เพราะเราจะลบทิ้ง)
            opacity: 0 // เริ่มต้นที่ซ่อนไว้
          }}
        ></div>
      ))}
    </div>
  );
};

export default TwinklingStars;