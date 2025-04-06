import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormData>();
  
  const password = watch('password', '');
  
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) throw error;
      
      navigate({ to: '/auth/login' });
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting your password.');
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
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    }
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
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 w-full bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
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
              leftIcon={<Save className="w-5 h-5" />}
            >
              Reset Password
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </GlassCard>
    </motion.div>
  );
};