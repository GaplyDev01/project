import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-primary mr-2" />
              <span className="text-3xl font-bold tracking-tight">CryptoIntel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-lg max-w-sm mx-auto">{subtitle}</p>}
          </motion.div>
          
          {children}
        </div>
      </div>
    </div>
  );
};