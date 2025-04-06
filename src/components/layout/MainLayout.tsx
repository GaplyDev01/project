import React from 'react';
import { Bell, Bookmark, Home, LogOut, Menu, Settings, User, X, Zap } from 'lucide-react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { profile: onboardingProfile } = useOnboardingStore();
  const { profile: userProfile, user, signOut } = useAuthStore();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  
  // Use either the user profile from auth store or the onboarding profile
  const profile = userProfile || onboardingProfile;
  
  const isActive = (path: string) => currentPath === path;
  
  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/auth/login' });
  };
  
  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-muted/20 p-4">
        <div className="flex items-center p-2 mb-8">
          <Zap className="w-6 h-6 text-primary mr-2" />
          <span className="text-xl font-bold tracking-tight">CryptoIntel</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem 
            to="/feed" 
            icon={<Home className="w-5 h-5" />} 
            label="News Feed" 
            isActive={isActive('/feed')} 
          />
          <NavItem 
            to="/saved" 
            icon={<Bookmark className="w-5 h-5" />} 
            label="Saved Articles" 
            isActive={isActive('/saved')} 
          />
          <NavItem 
            to="/alerts" 
            icon={<Bell className="w-5 h-5" />} 
            label="Alerts" 
            isActive={isActive('/alerts')} 
          />
          <NavItem 
            to="/settings" 
            icon={<Settings className="w-5 h-5" />} 
            label="Settings" 
            isActive={isActive('/settings')} 
          />
        </nav>
        
        <div className="mt-auto">
          <div className="border-t border-muted/20 pt-4 mt-6">
            <div className="flex items-center p-2 justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {profile?.professional_context?.role || profile?.professionalContext?.role || 'CryptoIntel User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email || 'Crypto Enthusiast'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-card/80 backdrop-blur-sm border-b border-muted/20">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <Zap className="w-6 h-6 text-primary mr-2" />
            <span className="text-lg font-bold">CryptoIntel</span>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-background/95 backdrop-blur-sm pt-16">
          <nav className="flex flex-col p-4 space-y-4">
            <MobileNavItem 
              to="/feed" 
              icon={<Home className="w-5 h-5" />} 
              label="News Feed" 
              isActive={isActive('/feed')} 
              onClick={() => setMobileMenuOpen(false)}
            />
            <MobileNavItem 
              to="/saved" 
              icon={<Bookmark className="w-5 h-5" />} 
              label="Saved Articles" 
              isActive={isActive('/saved')} 
              onClick={() => setMobileMenuOpen(false)}
            />
            <MobileNavItem 
              to="/alerts" 
              icon={<Bell className="w-5 h-5" />} 
              label="Alerts" 
              isActive={isActive('/alerts')} 
              onClick={() => setMobileMenuOpen(false)}
            />
            <MobileNavItem 
              to="/settings" 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              isActive={isActive('/settings')} 
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <div className="border-t border-muted/20 pt-4 mt-2">
              <button
                onClick={handleSignOut}
                className="flex items-center p-4 rounded-lg text-danger w-full"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="text-lg">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 md:pl-0 pt-16 md:pt-0">
        <div className="p-6 h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </Link>
);

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ to, icon, label, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center p-4 rounded-lg ${
      isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-muted-foreground hover:bg-muted'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span className="text-lg">{label}</span>
  </Link>
);