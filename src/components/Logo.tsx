
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <motion.div 
        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 15 
        }}
      >
        <span>B</span>
      </motion.div>
      <motion.span 
        className="font-bold text-xl"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        BudgetBuddy
      </motion.span>
    </Link>
  );
}
