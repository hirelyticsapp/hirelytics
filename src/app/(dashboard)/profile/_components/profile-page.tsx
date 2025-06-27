'use client';

import { Camera, Check, Shield, User, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Mock user data based on the schema
const mockUser = {
  name: 'John Doe',
  role: 'admin',
  email: 'john.doe@example.com',
  emailVerified: true,
  image: '/placeholder.svg?height=100&width=100',
  deleted: false,
  deletedAt: null,
};

export function ProfilePageComponent() {
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleImageUpload = () => {
    // Simulate image upload
    console.log('Image upload triggered');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and account preferences
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-2 ring-border">
                    <AvatarImage src={user.image || '/placeholder.svg'} alt={user.name || 'User'} />
                    <AvatarFallback className="text-lg bg-muted">
                      {user.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={handleImageUpload}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user.name || ''}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                    <Badge
                      variant={user.emailVerified ? 'default' : 'secondary'}
                      className={`flex items-center gap-1 ${
                        user.emailVerified ? 'bg-success text-success-foreground' : 'bg-muted'
                      }`}
                    >
                      {user.emailVerified ? (
                        <>
                          <Check className="h-3 w-3" />
                          Verified
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" />
                          Unverified
                        </>
                      )}
                    </Badge>
                  </div>
                  {!user.emailVerified && (
                    <p className="text-sm text-destructive">Please verify your email address</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Contact admin to change role
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleUpdateProfile} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="border shadow-sm bg-card">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Current status of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Account Status</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is active and in good standing
                  </p>
                </div>
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
