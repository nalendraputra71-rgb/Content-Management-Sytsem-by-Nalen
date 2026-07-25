import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MiniCalendar({ date, onChange, onClose, alignRight = false, style = {} }: any) {
  const [currentMonth, setCurrentMonth] = useState((date && date.year && date.month) ? new Date(date.year, date.month - 1, 1) : new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = (e: any) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = (e: any) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    onChange({ year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1, day });
    onClose();
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const days = ["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "100%",
        marginTop: 4,
        ...(alignRight ? { right: 0 } : { left: 0 }),
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        borderRadius: 12,
        padding: 8,
        zIndex: 99999,
        width: 180,
        ...style
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={prevMonth} style={{ background: "rgba(0,0,0,0.03)", border: "none", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4B5563" }} className="hover:bg-black/10 transition-colors"><ChevronLeft size={12} /></button>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button onClick={nextMonth} style={{ background: "rgba(0,0,0,0.03)", border: "none", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4B5563" }} className="hover:bg-black/10 transition-colors"><ChevronRight size={12} /></button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
        {days.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>{d}</div>
        ))}
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = date && date.day === day && date.month === currentMonth.getMonth() + 1 && date.year === currentMonth.getFullYear();
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
          
          return (
            <button
              key={day}
              onClick={(e) => { e.stopPropagation(); selectDate(day); }}
              className={`hover:bg-black/5 transition-colors`}
              style={{
                background: isSelected ? "var(--theme-primary)" : "transparent",
                color: isSelected ? "white" : (isToday ? "var(--theme-primary)" : "#111827"),
                border: isSelected ? "none" : (isToday ? "1px solid var(--theme-primary)" : "none"),
                fontWeight: isSelected || isToday ? 800 : 600,
                height: 20,
                width: "100%",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                cursor: "pointer",
                padding: 0
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
