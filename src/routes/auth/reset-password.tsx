import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { rootRoute } from '../root';

export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  component: () => (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter a new secure password for your account"
    >
      <ResetPasswordForm />
    </AuthLayout>
  ),
});