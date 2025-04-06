import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { MainLayout } from '../components/layout/MainLayout';
import { Settings } from '../components/settings/Settings';

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <MainLayout>
      <Settings />
    </MainLayout>
  ),
});