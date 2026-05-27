
import { motion } from 'framer-motion';

export const AdminCard = ({ children, className = '' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md ${className}`}
  >
    {children}
  </motion.div>
);
