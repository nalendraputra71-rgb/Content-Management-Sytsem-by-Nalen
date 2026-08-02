import { motion } from "motion/react";
import { getPlatformIcon } from "./data";

export function LoadingScreen({ title }: { title?: string }) {
  return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FAFAFA",flexDirection:"column",gap:24}}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "4px solid rgba(var(--theme-primary-rgb), 0.1)",
          borderTopColor: "var(--theme-primary)"
        }}
      />
    </div>
  );
}

