import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Edit3, 
  Globe, 
  Lock, 
  LogOut, 
  Monitor, 
  Moon, 
  Shield, 
  Sun, 
  User, 
  Zap,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useNavigate } from '@tanstack/react-router';

export const Settings: React.FC = () => {
  const { profile, resetOnboarding } = useOnboardingStore();
  const navigate = useNavigate();
  
  const handleResetOnboarding = () => {
    resetOnboarding();
    navigate({ to: '/' });
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and platform preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <GlassCard className="sticky top-6">
            <nav className="p-2">
              <SettingsNavItem
                icon={<User className="w-4 h-4" />}
                label="Account"
                isActive={true}
              />
              <SettingsNavItem
                icon={<Bell className="w-4 h-4" />}
                label="Notifications"
                isActive={false}
              />
              <SettingsNavItem
                icon={<Globe className="w-4 h-4" />}
                label="Feed Preferences"
                isActive={false}
              />
              <SettingsNavItem
                icon={<Monitor className="w-4 h-4" />}
                label="Appearance"
                isActive={false}
              />
              <SettingsNavItem
                icon={<Shield className="w-4 h-4" />}
                label="Privacy & Security"
                isActive={false}
              />
            </nav>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-9 space-y-6">
          <GlassCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Account Settings</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  Edit Profile
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {profile.professionalContext.role || 'CryptoIntel User'}
                    </h3>
                    <p className="text-muted-foreground">
                      {profile.professionalContext.industry || 'Crypto Enthusiast'}
                      {profile.professionalContext.organization && ` at ${profile.professionalContext.organization}`}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-muted/20">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="user@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="Your name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Intelligence Profile</h2>
              
              <div className="space-y-4 mb-6">
                <ProfileDetail 
                  label="Market Focus" 
                  value={profile.marketPreference === 'crypto' ? 'Cryptocurrency' : 'General Markets'} 
                />
                
                <ProfileDetail 
                  label="Organization Scale" 
                  value={profile.professionalContext.scale || 'Not specified'} 
                />
                
                <ProfileDetail 
                  label="Interests" 
                  value={profile.interests.join(', ') || 'None selected'} 
                />
                
                <ProfileDetail 
                  label="Monitored Entities" 
                  value={profile.competitors.join(', ') || 'None specified'} 
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  leftIcon={<Zap className="w-4 h-4" />}
                  onClick={handleResetOnboarding}
                >
                  Recalibrate Profile
                </Button>
                
                <Button variant="outline">
                  Export Profile Data
                </Button>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Appearance</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeOption
                      icon={<Moon className="w-5 h-5" />}
                      label="Dark"
                      isActive={true}
                    />
                    <ThemeOption
                      icon={<Sun className="w-5 h-5" />}
                      label="Light"
                      isActive={false}
                    />
                    <ThemeOption
                      icon={<Monitor className="w-5 h-5" />}
                      label="System"
                      isActive={false}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3">Font Size</label>
                  <div className="relative w-full">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value="50" 
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Small</span>
                      <span>Default</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3">Animation Preferences</label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Enable animations</span>
                    <div className="relative">
                      <input type="checkbox" id="animations" className="sr-only" defaultChecked />
                      <label 
                        htmlFor="animations"
                        className="block w-11 h-6 rounded-full bg-primary/20 cursor-pointer relative after:content-[''] after:block after:w-4 after:h-4 after:rounded-full after:bg-primary after:absolute after:left-1 after:top-1 after:transition-all checked:after:left-6"
                      ></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Security</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    leftIcon={<Lock className="w-4 h-4" />}
                  >
                    Change Password
                  </Button>
                </div>
                
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    leftIcon={<Shield className="w-4 h-4" />}
                  >
                    Two-Factor Authentication
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-danger"
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

interface SettingsNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SettingsNavItem: React.FC<SettingsNavItemProps> = ({ icon, label, isActive }) => (
  <button 
    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm ${
      isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </button>
);

interface ProfileDetailProps {
  label: string;
  value: string;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ label, value }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium">{label}</label>
    <div className="p-2.5 bg-muted/30 border border-muted/20 rounded-lg text-sm">
      {value}
    </div>
  </div>
);

interface ThemeOptionProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ icon, label, isActive }) => (
  <button 
    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
      isActive 
        ? 'bg-primary/10 border-primary/30 text-primary' 
        : 'border-muted/30 text-muted-foreground hover:bg-muted/30'
    }`}
  >
    <span className="mb-2">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);