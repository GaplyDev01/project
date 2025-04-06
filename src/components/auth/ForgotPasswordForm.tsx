import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

type ForgotPasswordFormData = {
  email: string;
};

export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to your email address. Please check your inbox (and spam folder) for further instructions.
            </p>
            <Link to="/auth/login">
              <Button
                className="w-full"
                leftIcon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <GlassCard>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    } 
                  })}
                  id="email"
                  type="email"
                  className="pl-10 w-full bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              leftIcon={<Send className="w-5 h-5" />}
            >
              Send Reset Link
            </Button>
            
            <div className="text-center mt-4">
              <Link to="/auth/login" className="text-primary hover:underline text-sm font-medium flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </GlassCard>
    </motion.div>
  );
};