'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Camera, SaveIcon, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateProfile, uploadProfileImage } from '@/actions/profile';
import S3SignedImage from '@/components/s3-signed-image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { IUser } from '@/db';
import { useAuth } from '@/hooks/use-auth';
import { getQueryClient } from '@/lib/query-client';

// Zod schema for form validation
const profileSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().optional(),
});

export function ProfilePageComponent() {
  const { user } = useAuth();
  const queryClient = getQueryClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const { handleSubmit } = form;

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [form, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<IUser>) => {
      await updateProfile(data);
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.refresh();
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      return await uploadProfileImage(file);
    },
    onSuccess: (imageKey) => {
      toast.success('Image uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.refresh();
      setIsUploading(false);
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      setIsUploading(false);
    },
  });

  const handleUpdateProfile = async (data: Partial<IUser>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handleImageUpload = () => {
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      if (file.size > 5 * 1024 * 1024) {
        // 5 MB limit
        toast.error('File size exceeds the 5 MB limit.');
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and account preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6">
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
                  {user?.image ? (
                    <S3SignedImage
                      src={user.image}
                      alt={user.name || 'User'}
                      width={80}
                      height={80}
                      className="rounded-full ring-2 ring-border"
                    />
                  ) : (
                    <Avatar className="h-20 w-20 ring-2 ring-border">
                      <AvatarFallback className="text-lg bg-muted">
                        {user?.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                    disabled={isUploading}
                  >
                    <Camera className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input disabled {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-2">
                  <FormLabel htmlFor="role">Role</FormLabel>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {(user?.role ?? '').charAt(0).toUpperCase() + (user?.role ?? '').slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  <SaveIcon className="h-4 w-4" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
