import { useState } from "react";
import { User, Edit, Camera, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNavNew from "@/components/navigation/MobileBottomNavNew";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  const handleSave = () => {
    // Save profile logic would go here
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
          <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
        <div className="hidden sm:block">
          <Footer />
        </div>
        <MobileBottomNavNew />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-2xl">{user.name || user.username}</CardTitle>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span className="capitalize">{user.role} Account</span>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button
                variant="outline"
                className="h-10 min-h-[40px] bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1 h-12 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="h-12 min-h-[48px] bg-white border-gray-300 text-gray-800 hover:bg-gray-50">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start h-12 min-h-[48px] bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                <User className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 min-h-[48px] bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start h-12 min-h-[48px] bg-red-600 hover:bg-red-700 text-white font-medium"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
      <MobileBottomNavNew />
    </div>
  );
};

export default Profile;