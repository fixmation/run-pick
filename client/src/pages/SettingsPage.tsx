import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Volume2, 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  Mail,
  ArrowLeft,
  Settings as SettingsIcon,
  Eye,
  Download,
  Upload,
  RotateCcw,
  Lock,
  Smartphone,
  Wifi,
  Car,
  Utensils,
  Package,
  Home,
  Plus,
  X,
  Edit3,
  Camera,
  Palette,
  Accessibility,
  Zap,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import HealthCheck from '@/components/debug/HealthCheck';

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { preferences, updatePreference, resetPreferences, exportPreferences, importPreferences } = useUserPreferences();
  
  // UI State
  const [activeSection, setActiveSection] = useState('account');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: '',
    bio: ''
  });

  const handleLanguageChange = (lang: 'en' | 'si' | 'ta') => {
    setLanguage(lang);
    updatePreference('language', lang);
    toast.success('Language updated successfully');
  };

  const handleAddAddress = () => {
    if (newAddress.label && newAddress.address) {
      const updatedAddresses = [...preferences.frequentAddresses, newAddress];
      updatePreference('frequentAddresses', updatedAddresses);
      setNewAddress({ label: '', address: '' });
      setShowAddAddress(false);
      toast.success('Address added successfully');
    }
  };

  const removeAddress = (index: number) => {
    const updatedAddresses = preferences.frequentAddresses.filter((_, i) => i !== index);
    updatePreference('frequentAddresses', updatedAddresses);
    toast.success('Address removed');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'location', label: 'Location & Privacy', icon: MapPin },
    { id: 'services', label: 'Service Preferences', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: SettingsIcon }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in Required</h3>
            <p className="text-gray-600 mb-4">Please sign in to access settings</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderAccountSection = () => (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showEditProfile ? (
            <>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <Badge variant="outline" className="mt-1 capitalize">{user.role}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditProfile(true)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    toast.success('Profile updated successfully');
                    setShowEditProfile(false);
                  }}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfile(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Methods
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Shield className="w-4 h-4 mr-2" />
            Privacy Settings
          </Button>
          <Separator />
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Theme & Display</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-gray-600">Enable dark theme across the app</p>
            </div>
            <Switch
              checked={preferences.darkMode}
              onCheckedChange={(checked) => updatePreference('darkMode', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>High Contrast</Label>
              <p className="text-sm text-gray-600">Improve visibility with higher contrast</p>
            </div>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={(checked) => updatePreference('highContrast', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Large Text</Label>
              <p className="text-sm text-gray-600">Increase text size for better readability</p>
            </div>
            <Switch
              checked={preferences.largeText}
              onCheckedChange={(checked) => updatePreference('largeText', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduced Motion</Label>
              <p className="text-sm text-gray-600">Minimize animations and transitions</p>
            </div>
            <Switch
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Language</Label>
              <p className="text-sm text-gray-600">Choose your preferred language</p>
            </div>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="si">සිංහල</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive push notifications on your device</p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Get important updates via email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-600">Receive SMS for critical updates</p>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Effects</Label>
              <p className="text-sm text-gray-600">Play sounds for notifications and actions</p>
            </div>
            <Switch
              checked={preferences.soundEffects}
              onCheckedChange={(checked) => updatePreference('soundEffects', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notification Sound</Label>
              <p className="text-sm text-gray-600">Choose notification sound</p>
            </div>
            <Select 
              value={preferences.notificationSound} 
              onValueChange={(value) => updatePreference('notificationSound', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="chime">Chime</SelectItem>
                <SelectItem value="bell">Bell</SelectItem>
                <SelectItem value="pop">Pop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocationSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Location & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Location Services</Label>
              <p className="text-sm text-gray-600">Allow app to access your location</p>
            </div>
            <Switch
              checked={preferences.locationServices}
              onCheckedChange={(checked) => updatePreference('locationServices', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Location</Label>
              <p className="text-sm text-gray-600">Automatically detect your current location</p>
            </div>
            <Switch
              checked={preferences.autoLocation}
              onCheckedChange={(checked) => updatePreference('autoLocation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Share Location</Label>
              <p className="text-sm text-gray-600">Share location with drivers and vendors</p>
            </div>
            <Switch
              checked={preferences.shareLocation}
              onCheckedChange={(checked) => updatePreference('shareLocation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Tracking Opt-out</Label>
              <p className="text-sm text-gray-600">Opt out of analytics and tracking</p>
            </div>
            <Switch
              checked={preferences.trackingOptOut}
              onCheckedChange={(checked) => updatePreference('trackingOptOut', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Frequent Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5" />
              <span>Frequent Addresses</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddAddress(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {preferences.frequentAddresses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No saved addresses yet</p>
          ) : (
            preferences.frequentAddresses.map((addr, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{addr.label}</p>
                  <p className="text-sm text-gray-600">{addr.address}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAddress(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
          
          {showAddAddress && (
            <div className="space-y-3 p-3 border rounded-lg bg-white">
              <Input
                placeholder="Label (e.g., Home, Work)"
                value={newAddress.label}
                onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
              />
              <Input
                placeholder="Full address"
                value={newAddress.address}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
              />
              <div className="flex space-x-2">
                <Button onClick={handleAddAddress} size="sm" className="flex-1">
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowAddAddress(false);
                    setNewAddress({ label: '', address: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderServicesSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Service Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Default Vehicle Type</Label>
              <p className="text-sm text-gray-600">Preferred vehicle for taxi bookings</p>
            </div>
            <Select 
              value={preferences.defaultVehicleType} 
              onValueChange={(value) => updatePreference('defaultVehicleType', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bike">
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2" />
                    Bike
                  </div>
                </SelectItem>
                <SelectItem value="tuktuk">Tuk-Tuk</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="van">Van</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Default Payment Method</Label>
              <p className="text-sm text-gray-600">Preferred payment option</p>
            </div>
            <Select 
              value={preferences.paymentMethod} 
              onValueChange={(value) => updatePreference('paymentMethod', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Biometric Authentication</Label>
              <p className="text-sm text-gray-600">Use fingerprint or face ID to unlock</p>
            </div>
            <Switch
              checked={preferences.biometricAuth}
              onCheckedChange={(checked) => updatePreference('biometricAuth', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600">Add extra security to your account</p>
            </div>
            <Switch
              checked={preferences.twoFactorAuth}
              onCheckedChange={(checked) => updatePreference('twoFactorAuth', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Session Timeout</Label>
              <p className="text-sm text-gray-600">Auto-logout after inactivity (minutes)</p>
            </div>
            <Select 
              value={preferences.sessionTimeout.toString()} 
              onValueChange={(value) => updatePreference('sessionTimeout', parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="120">120</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Smartphone className="w-4 h-4 mr-2" />
              Manage Devices
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvancedSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Advanced Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Refresh</Label>
              <p className="text-sm text-gray-600">Automatically refresh content</p>
            </div>
            <Switch
              checked={preferences.autoRefresh}
              onCheckedChange={(checked) => updatePreference('autoRefresh', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Offline Mode</Label>
              <p className="text-sm text-gray-600">Enable offline functionality when available</p>
            </div>
            <Switch
              checked={preferences.offlineMode}
              onCheckedChange={(checked) => updatePreference('offlineMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Compression</Label>
              <p className="text-sm text-gray-600">Reduce data usage with compression</p>
            </div>
            <Switch
              checked={preferences.dataCompression}
              onCheckedChange={(checked) => updatePreference('dataCompression', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                const data = exportPreferences();
                navigator.clipboard.writeText(data);
                toast.success('Settings exported to clipboard');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                navigator.clipboard.readText().then(text => {
                  if (importPreferences(text)) {
                    toast.success('Settings imported successfully');
                  } else {
                    toast.error('Failed to import settings');
                  }
                });
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-orange-600 hover:text-orange-700"
              onClick={() => {
                resetPreferences();
                toast.success('Settings reset to defaults');
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>App Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Build:</span>
            <span>2025.01.08</span>
          </div>
          <div className="flex justify-between">
            <span>Platform:</span>
            <span>Web</span>
          </div>
        </CardContent>
      </Card>
      
      {/* System Health (Development only) */}
      {process.env.NODE_ENV === 'development' && <HealthCheck />}
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account': return renderAccountSection();
      case 'appearance': return renderAppearanceSection();
      case 'notifications': return renderNotificationsSection();
      case 'location': return renderLocationSection();
      case 'services': return renderServicesSection();
      case 'security': return renderSecuritySection();
      case 'advanced': return renderAdvancedSection();
      default: return renderAccountSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-gray-600">Manage your preferences and account</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
}