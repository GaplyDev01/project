import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { SignUpForm } from '../../components/auth/SignUpForm';
import { rootRoute } from '../root';

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/signup',
  component: () => (
    <AuthLayout
      title="Create Your Account"
      subtitle="Sign up to get personalized market intelligence curated just for you"
    >
      <SignUpForm />
    </AuthLayout>
  ),
});