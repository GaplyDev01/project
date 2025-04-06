import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { rootRoute } from '../root';

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/forgot-password',
  component: () => (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email address below and we'll send you a link to reset your password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  ),
});