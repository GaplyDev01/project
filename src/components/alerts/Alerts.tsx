import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, BellOff, Clock, Plus, Settings } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

export const Alerts: React.FC = () => {
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Market Alerts</h1>
          <p className="text-muted-foreground">
            Real-time notifications for important market events
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Alert
          </Button>
          
          <Button
            variant="outline"
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Alert Settings
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <GlassCard>
            <div className="p-5">
              <h2 className="text-lg font-medium mb-4">Active Alerts</h2>
              
              {activeAlerts.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No active alerts</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You haven't set up any alerts yet. Create your first alert to start receiving notifications.
                  </p>
                  <Button 
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Create Your First Alert
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <AlertCard 
                        alert={alert}
                        isActive={true}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-5">
              <h2 className="text-lg font-medium mb-4">Recent Notifications</h2>
              
              {recentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No recent notifications
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className={`p-3 rounded-lg ${
                        notification.unread 
                          ? 'bg-primary/5 border border-primary/20' 
                          : 'bg-muted/30'
                      }`}>
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            notification.unread 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted/50 text-muted-foreground'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-sm">{notification.title}</span>
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <GlassCard>
            <div className="p-5">
              <h2 className="text-lg font-medium mb-4">Alert Templates</h2>
              <div className="space-y-3">
                <div className="p-3 border border-primary/20 rounded-lg bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                  <h3 className="font-medium text-sm mb-1">Price Movement</h3>
                  <p className="text-xs text-muted-foreground">
                    Get notified when a cryptocurrency moves above or below a certain price threshold.
                  </p>
                </div>
                
                <div className="p-3 border border-muted/20 rounded-lg bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors">
                  <h3 className="font-medium text-sm mb-1">Trading Volume</h3>
                  <p className="text-xs text-muted-foreground">
                    Alert when trading volume for a token exceeds a specified threshold.
                  </p>
                </div>
                
                <div className="p-3 border border-muted/20 rounded-lg bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors">
                  <h3 className="font-medium text-sm mb-1">News Mention</h3>
                  <p className="text-xs text-muted-foreground">
                    Notification when a specific entity or keyword appears in breaking news.
                  </p>
                </div>
                
                <div className="p-3 border border-muted/20 rounded-lg bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors">
                  <h3 className="font-medium text-sm mb-1">Sentiment Shift</h3>
                  <p className="text-xs text-muted-foreground">
                    Alert when market sentiment for an asset changes significantly.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-5">
              <h2 className="text-lg font-medium mb-4">Delivery Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">In-App Notifications</h3>
                    <p className="text-xs text-muted-foreground">Receive alerts within the platform</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="in-app" className="sr-only" defaultChecked />
                    <label 
                      htmlFor="in-app"
                      className="block w-11 h-6 rounded-full bg-primary/20 cursor-pointer relative after:content-[''] after:block after:w-4 after:h-4 after:rounded-full after:bg-primary after:absolute after:left-1 after:top-1 after:transition-all checked:after:left-6"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="email" className="sr-only" />
                    <label 
                      htmlFor="email"
                      className="block w-11 h-6 rounded-full bg-muted cursor-pointer relative after:content-[''] after:block after:w-4 after:h-4 after:rounded-full after:bg-muted-foreground after:absolute after:left-1 after:top-1 after:transition-all checked:after:left-6"
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">Push Notifications</h3>
                    <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="push" className="sr-only" defaultChecked />
                    <label 
                      htmlFor="push"
                      className="block w-11 h-6 rounded-full bg-primary/20 cursor-pointer relative after:content-[''] after:block after:w-4 after:h-4 after:rounded-full after:bg-primary after:absolute after:left-1 after:top-1 after:transition-all checked:after:left-6"
                    ></label>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-muted/20">
                  <Button variant="outline" size="sm" className="w-full">
                    Save Preferences
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

interface AlertCardProps {
  alert: {
    id: string;
    type: string;
    name: string;
    conditions: string;
    asset?: string;
    createdAt: string;
  };
  isActive: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, isActive }) => {
  return (
    <div className="p-4 border border-muted/20 rounded-lg bg-muted/10 flex justify-between items-center">
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${
          isActive ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground'
        }`}>
          {isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </div>
        <div>
          <div className="font-medium">{alert.name}</div>
          <div className="text-sm text-muted-foreground mb-1">{alert.conditions}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span>Created {alert.createdAt}</span>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="outline" size="sm" className="text-danger">Delete</Button>
      </div>
    </div>
  );
};

// Dummy data
const activeAlerts = [
  {
    id: '1',
    type: 'price',
    name: 'Bitcoin Price Alert',
    conditions: 'Price drops below $60,000 or rises above $70,000',
    asset: 'Bitcoin',
    createdAt: '2 days ago',
  },
  {
    id: '2',
    type: 'news',
    name: 'Ethereum Regulation News',
    conditions: 'Any news mentioning "Ethereum" and "regulation"',
    createdAt: '5 days ago',
  },
  {
    id: '3',
    type: 'volume',
    name: 'Solana Volume Spike',
    conditions: 'Trading volume exceeds 150% of 30-day average',
    asset: 'Solana',
    createdAt: 'a week ago',
  },
];

const recentNotifications = [
  {
    id: '1',
    title: 'Bitcoin Price Alert',
    message: 'Bitcoin price has risen above $70,000 threshold',
    time: '3 hours ago',
    unread: true,
  },
  {
    id: '2',
    title: 'News Mention Alert',
    message: 'New article detected mentioning "Ethereum" and "regulation"',
    time: '12 hours ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Volume Alert',
    message: 'Unusual trading volume detected for Solana (SOL)',
    time: '2 days ago',
    unread: false,
  },
  {
    id: '4',
    title: 'Market Movement',
    message: 'Overall crypto market cap has increased by 5% in the last 24 hours',
    time: '3 days ago',
    unread: false,
  },
];