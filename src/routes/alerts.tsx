import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { MainLayout } from '../components/layout/MainLayout';
import { Alerts } from '../components/alerts/Alerts';

export const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alerts',
  component: () => (
    <MainLayout>
      <Alerts />
    </MainLayout>
  ),
});