import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MobileStepper({
  value,
  options,
  onChange,
  prefix = "",
}: {
  value: string;
  options: any[];
  onChange: (val: string) => void;
  prefix?: string;
}) {
  const currentIndex = options.findIndex(
    (o) => (typeof o === "string" ? o : o.id) === value,
  );

  const handlePrev = () => {
    if (currentIndex === -1) return;
    const nextIdx = (currentIndex - 1 + options.length) % options.length;
    const option = options[nextIdx];
    onChange(typeof option === "string" ? option : option.id);
  };

  const handleNext = () => {
    if (currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % options.length;
    const option = options[nextIdx];
    onChange(typeof option === "string" ? option : option.id);
  };

  const activeOption = options[currentIndex];
  const displayLabel = activeOption
    ? typeof activeOption === "string"
      ? activeOption
      : activeOption.label || activeOption.name
    : value;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "white",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(44,32,22,0.1)",
        borderRadius: 12,
        padding: "4px 8px",
        width: "100%",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <button
        onClick={handlePrev}
        style={{
          border: "none",
          background: "transparent",
          padding: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#4B5563",
        }}
      >
        <ChevronLeft size={18} />
      </button>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#2C2016",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {prefix && <span style={{ color: "#9CA3AF" }}>{prefix}</span>}
        {displayLabel}
      </div>
      <button
        onClick={handleNext}
        style={{
          border: "none",
          background: "transparent",
          padding: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#4B5563",
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
