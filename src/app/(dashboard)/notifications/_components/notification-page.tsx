'use client';

import {
  Bell,
  CreditCard,
  Gift,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface NotificationSettings {
  email: {
    marketing: boolean;
    security: boolean;
    billing: boolean;
    product: boolean;
    social: boolean;
    system: boolean;
  };
  push: {
    enabled: boolean;
    marketing: boolean;
    security: boolean;
    billing: boolean;
    social: boolean;
    system: boolean;
  };
  frequency: string;
}

// Comprehensive notification list
const notificationTypes = [
  {
    category: 'Security & Account',
    icon: Shield,
    color: 'from-red-500 to-red-600',
    notifications: [
      {
        id: 1,
        title: 'Login from new device',
        description: 'Someone signed in from a new device',
        type: 'security',
        priority: 'high',
      },
      {
        id: 2,
        title: 'Password changed',
        description: 'Your password was successfully updated',
        type: 'security',
        priority: 'high',
      },
      {
        id: 3,
        title: 'Two-factor authentication enabled',
        description: '2FA has been activated for your account',
        type: 'security',
        priority: 'medium',
      },
      {
        id: 4,
        title: 'Suspicious activity detected',
        description: 'Unusual login attempts from unknown locations',
        type: 'security',
        priority: 'high',
      },
      {
        id: 5,
        title: 'Account verification required',
        description: 'Please verify your email address',
        type: 'security',
        priority: 'medium',
      },
    ],
  },
  {
    category: 'Billing & Payments',
    icon: CreditCard,
    color: 'from-green-500 to-green-600',
    notifications: [
      {
        id: 6,
        title: 'Payment successful',
        description: 'Your monthly subscription has been charged',
        type: 'billing',
        priority: 'low',
      },
      {
        id: 7,
        title: 'Payment failed',
        description: 'Unable to process your payment method',
        type: 'billing',
        priority: 'high',
      },
      {
        id: 8,
        title: 'Invoice generated',
        description: 'Your monthly invoice is ready for download',
        type: 'billing',
        priority: 'low',
      },
      {
        id: 9,
        title: 'Subscription expiring soon',
        description: 'Your subscription expires in 3 days',
        type: 'billing',
        priority: 'medium',
      },
      {
        id: 10,
        title: 'Payment method expires soon',
        description: 'Your credit card expires next month',
        type: 'billing',
        priority: 'medium',
      },
      {
        id: 11,
        title: 'Refund processed',
        description: 'Your refund has been processed successfully',
        type: 'billing',
        priority: 'low',
      },
    ],
  },
  {
    category: 'Product & Features',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    notifications: [
      {
        id: 12,
        title: 'New feature available',
        description: 'Check out our latest dashboard updates',
        type: 'product',
        priority: 'low',
      },
      {
        id: 13,
        title: 'Maintenance scheduled',
        description: 'System maintenance on Sunday 2AM-4AM',
        type: 'product',
        priority: 'medium',
      },
      {
        id: 14,
        title: 'Feature deprecated',
        description: 'Legacy API will be discontinued next month',
        type: 'product',
        priority: 'medium',
      },
      {
        id: 15,
        title: 'Beta feature invitation',
        description: "You're invited to test our new analytics tool",
        type: 'product',
        priority: 'low',
      },
      {
        id: 16,
        title: 'Usage limit reached',
        description: "You've reached 80% of your monthly quota",
        type: 'product',
        priority: 'medium',
      },
    ],
  },
  {
    category: 'Social & Community',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    notifications: [
      {
        id: 17,
        title: 'New follower',
        description: 'John Doe started following you',
        type: 'social',
        priority: 'low',
      },
      {
        id: 18,
        title: 'Comment on your post',
        description: 'Someone commented on your recent post',
        type: 'social',
        priority: 'low',
      },
      {
        id: 19,
        title: 'Mention in discussion',
        description: 'You were mentioned in a team discussion',
        type: 'social',
        priority: 'medium',
      },
      {
        id: 20,
        title: 'Team invitation',
        description: "You've been invited to join a new team",
        type: 'social',
        priority: 'medium',
      },
      {
        id: 21,
        title: 'Achievement unlocked',
        description: "You've earned the 'Power User' badge",
        type: 'social',
        priority: 'low',
      },
    ],
  },
  {
    category: 'System & Updates',
    icon: Settings,
    color: 'from-gray-500 to-gray-600',
    notifications: [
      {
        id: 22,
        title: 'System update completed',
        description: 'Latest security patches have been applied',
        type: 'system',
        priority: 'low',
      },
      {
        id: 23,
        title: 'Backup completed',
        description: 'Your data backup was successful',
        type: 'system',
        priority: 'low',
      },
      {
        id: 24,
        title: 'Storage space low',
        description: "You're using 90% of your storage quota",
        type: 'system',
        priority: 'medium',
      },
      {
        id: 25,
        title: 'API rate limit warning',
        description: "You're approaching your API rate limit",
        type: 'system',
        priority: 'medium',
      },
      {
        id: 26,
        title: 'Terms of service updated',
        description: 'Please review our updated terms',
        type: 'system',
        priority: 'low',
      },
    ],
  },
  {
    category: 'Marketing & Promotions',
    icon: Gift,
    color: 'from-orange-500 to-orange-600',
    notifications: [
      {
        id: 27,
        title: 'Special offer available',
        description: '50% off premium features this week',
        type: 'marketing',
        priority: 'low',
      },
      {
        id: 28,
        title: 'Newsletter digest',
        description: 'Your weekly product updates are here',
        type: 'marketing',
        priority: 'low',
      },
      {
        id: 29,
        title: 'Webinar invitation',
        description: 'Join our upcoming product demo session',
        type: 'marketing',
        priority: 'low',
      },
      {
        id: 30,
        title: 'Survey request',
        description: 'Help us improve by sharing your feedback',
        type: 'marketing',
        priority: 'low',
      },
      {
        id: 31,
        title: 'Holiday promotion',
        description: 'Exclusive deals for the holiday season',
        type: 'marketing',
        priority: 'low',
      },
    ],
  },
];

export function NotificationPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      marketing: true,
      security: true,
      billing: true,
      product: false,
      social: true,
      system: false,
    },
    push: {
      enabled: true,
      marketing: false,
      security: true,
      billing: true,
      social: false,
      system: true,
    },
    frequency: 'daily',
  });

  const updateEmailSetting = (key: keyof typeof settings.email, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const updatePushSetting = (key: keyof typeof settings.push, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      push: { ...prev.push, [key]: value },
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your notification preferences and view all notification types
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Column */}
          <div className="space-y-6">
            {/* Email Notifications */}
            <Card className="border shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose what email notifications you&apos;d like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">
                      Marketing & Promotions
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive emails about new features, tips, and special offers
                    </p>
                  </div>
                  <Switch
                    checked={settings.email.marketing}
                    onCheckedChange={(checked) => updateEmailSetting('marketing', checked)}
                  />
                </div>

                <Separator className="bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    <div>
                      <Label className="text-base font-medium text-gray-900">Security Alerts</Label>
                      <p className="text-sm text-gray-500">
                        Important security notifications and login alerts
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.email.security}
                    onCheckedChange={(checked) => updateEmailSetting('security', checked)}
                  />
                </div>

                <Separator className="bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <div>
                      <Label className="text-base font-medium text-gray-900">
                        Billing & Payments
                      </Label>
                      <p className="text-sm text-gray-500">
                        Invoices, payment confirmations, and billing updates
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.email.billing}
                    onCheckedChange={(checked) => updateEmailSetting('billing', checked)}
                  />
                </div>

                <Separator className="bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">Product Updates</Label>
                    <p className="text-sm text-gray-500">
                      Updates about new features and product changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.email.product}
                    onCheckedChange={(checked) => updateEmailSetting('product', checked)}
                  />
                </div>

                <Separator className="bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">
                      Social & Community
                    </Label>
                    <p className="text-sm text-gray-500">
                      Mentions, follows, and community interactions
                    </p>
                  </div>
                  <Switch
                    checked={settings.email.social}
                    onCheckedChange={(checked) => updateEmailSetting('social', checked)}
                  />
                </div>

                <Separator className="bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">System Updates</Label>
                    <p className="text-sm text-gray-500">
                      System maintenance and technical notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.email.system}
                    onCheckedChange={(checked) => updateEmailSetting('system', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card className="border shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your browser and mobile push notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-900">
                      Enable Push Notifications
                    </Label>
                    <p className="text-sm text-gray-500">Allow us to send you push notifications</p>
                  </div>
                  <Switch
                    checked={settings.push.enabled}
                    onCheckedChange={(checked) => updatePushSetting('enabled', checked)}
                  />
                </div>

                {settings.push.enabled && (
                  <>
                    <Separator className="bg-gray-200" />

                    <div className="space-y-4">
                      {[
                        {
                          key: 'security',
                          label: 'Security Alerts',
                          desc: 'Critical security notifications',
                          icon: Shield,
                          color: 'text-red-500',
                        },
                        {
                          key: 'billing',
                          label: 'Billing Notifications',
                          desc: 'Payment reminders and billing updates',
                          icon: CreditCard,
                          color: 'text-green-500',
                        },
                        {
                          key: 'social',
                          label: 'Social Updates',
                          desc: 'Mentions, follows, and interactions',
                          icon: Users,
                          color: 'text-purple-500',
                        },
                        {
                          key: 'system',
                          label: 'System Notifications',
                          desc: 'System updates and maintenance',
                          icon: Settings,
                          color: 'text-gray-500',
                        },
                        {
                          key: 'marketing',
                          label: 'Marketing Messages',
                          desc: 'Promotional content and announcements',
                          icon: Gift,
                          color: 'text-orange-500',
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="space-y-0.5 flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${item.color}`} />
                              <div>
                                <Label className="text-base font-medium text-gray-900">
                                  {item.label}
                                </Label>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                            <Switch
                              checked={
                                settings.push[item.key as keyof typeof settings.push] as boolean
                              }
                              onCheckedChange={(checked) =>
                                updatePushSetting(item.key as keyof typeof settings.push, checked)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notification Frequency */}
            <Card className="border shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="h-5 w-5" />
                  Notification Frequency
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Control how often you receive digest emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-gray-700">
                    Email Digest Frequency
                  </Label>
                  <Select
                    value={settings.frequency}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger className="w-full border-gray-200 focus:border-gray-400">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Choose how often you want to receive summary emails of your notifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Types Column */}
          <div className="space-y-6">
            <Card className="border shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="h-5 w-5" />
                  All Notification Types
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete list of notifications you may receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationTypes.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                          <Icon className="h-4 w-4 text-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground">{category.category}</h3>
                      </div>
                      <div className="space-y-2 ml-6">
                        {category.notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-start justify-between p-3 rounded-lg bg-muted border"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.description}
                              </p>
                            </div>
                            <Badge
                              className={`ml-2 text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {category !== notificationTypes[notificationTypes.length - 1] && (
                        <Separator />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
