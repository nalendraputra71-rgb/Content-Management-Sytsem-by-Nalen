import { motion } from "framer-motion";

export const MenuToggle = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => (
  <button 
    onClick={toggle} 
    style={{
      background: "transparent", border: "none", cursor: "pointer", 
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 32, height: 32, color: "white", padding: 0
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <motion.path 
        animate={isOpen ? { d: "M12 5L5 12" } : { d: "M4 6L20 6" }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.path 
        animate={isOpen ? { d: "M19 12L5 12", opacity: 1 } : { d: "M4 12L20 12", opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.path 
        animate={isOpen ? { d: "M12 19L5 12" } : { d: "M4 18L20 18" }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  </button>
);
