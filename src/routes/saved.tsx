import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { MainLayout } from '../components/layout/MainLayout';
import { SavedArticles } from '../components/saved/SavedArticles';

export const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saved',
  component: () => (
    <MainLayout>
      <SavedArticles />
    </MainLayout>
  ),
});