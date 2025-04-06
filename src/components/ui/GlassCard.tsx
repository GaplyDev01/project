import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: React.ElementType;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
  as: Component = motion.div,
  onClick,
}) => {
  const baseClass = 'glass-card relative overflow-hidden p-6 shadow-lg';
  const hoverClass = hover
    ? 'transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:border-primary/30 cursor-pointer'
    : '';

  return (
    <Component
      className={`${baseClass} ${hoverClass} ${className}`}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </Component>
  );
};