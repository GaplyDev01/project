import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

type LoginFormData = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();
  const { resetOnboardingState } = useOnboardingStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) throw error;
      
      // Get user profile after successful login
      const userProfile = await fetchProfile();
      
      // Reset onboarding state for new users
      if (!userProfile?.onboarding_completed) {
        resetOnboardingState();
      }
      
      // Navigate to appropriate page based on onboarding status
      if (userProfile?.onboarding_completed) {
        navigate({ to: '/feed' });
      } else {
        navigate({ to: '/onboarding' });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
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
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                  })}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 w-full bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
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
              leftIcon={<LogIn className="w-5 h-5" />}
            >
              Log In
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account yet?{' '}
                <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </GlassCard>
    </motion.div>
  );
};