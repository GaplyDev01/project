import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: () => {
    return (
      <div className="min-h-screen bg-background grid-pattern">
        <Outlet />
      </div>
    );
  },
});