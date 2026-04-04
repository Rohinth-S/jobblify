import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface AnimatedLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
    filter: 'blur(4px)',
  },
  in: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
} as const;

export const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex-grow flex flex-col items-stretch justify-start w-full"
    >
      {children}
    </motion.div>
  );
};
