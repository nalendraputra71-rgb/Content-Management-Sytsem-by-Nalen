import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function Tooltip({ text, children, position = "top" }: { text: string, children: React.ReactNode, position?: "top" | "bottom" }) {
  const [show, setShow] = useState(false);

  return (
    <div 
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 4 : -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              [position]: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: position === "bottom" ? 8 : undefined,
              marginBottom: position === "top" ? 8 : undefined,
              background: "#111827",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              zIndex: 999999,
              pointerEvents: "none"
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
