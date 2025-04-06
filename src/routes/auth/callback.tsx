import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { AuthCallback } from '../../components/auth/callback';

export const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallback
});