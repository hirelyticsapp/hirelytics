'use client';

import {
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Settings,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Role = 'admin' | 'recruiter' | 'candidate';

export default function DashboardComponents() {
  const [currentRole, setCurrentRole] = useState<Role>('admin');

  const adminMetrics = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Active Jobs',
      value: '156',
      change: '+8.2%',
      icon: Briefcase,
      trend: 'up',
    },
    {
      title: 'Applications',
      value: '8,924',
      change: '+23.1%',
      icon: FileText,
      trend: 'up',
    },
    {
      title: 'Success Rate',
      value: '68.4%',
      change: '+4.3%',
      icon: TrendingUp,
      trend: 'up',
    },
  ];

  const recruiterMetrics = [
    {
      title: 'Active Jobs',
      value: '12',
      change: '+2',
      icon: Briefcase,
      trend: 'up',
    },
    {
      title: 'New Applications',
      value: '47',
      change: '+15',
      icon: FileText,
      trend: 'up',
    },
    {
      title: 'Interviews Scheduled',
      value: '8',
      change: '+3',
      icon: Calendar,
      trend: 'up',
    },
    {
      title: 'Positions Filled',
      value: '5',
      change: '+2',
      icon: CheckCircle,
      trend: 'up',
    },
  ];

  const candidateMetrics = [
    {
      title: 'Applications Sent',
      value: '23',
      change: '+5',
      icon: FileText,
      trend: 'up',
    },
    {
      title: 'Profile Views',
      value: '156',
      change: '+12',
      icon: Eye,
      trend: 'up',
    },
    {
      title: 'Interview Invites',
      value: '4',
      change: '+2',
      icon: Calendar,
      trend: 'up',
    },
    {
      title: 'Profile Completion',
      value: '85%',
      change: '+10%',
      icon: TrendingUp,
      trend: 'up',
    },
  ];

  const getMetrics = () => {
    switch (currentRole) {
      case 'admin':
        return adminMetrics;
      case 'recruiter':
        return recruiterMetrics;
      case 'candidate':
        return candidateMetrics;
      default:
        return adminMetrics;
    }
  };

  const getQuickActions = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { label: 'Add User', icon: UserPlus, variant: 'default' as const },
          { label: 'System Settings', icon: Settings, variant: 'outline' as const },
          { label: 'View Reports', icon: FileText, variant: 'outline' as const },
          { label: 'Manage Roles', icon: Users, variant: 'outline' as const },
        ];
      case 'recruiter':
        return [
          { label: 'Post New Job', icon: Plus, variant: 'default' as const },
          { label: 'Search Candidates', icon: Search, variant: 'outline' as const },
          { label: 'Schedule Interview', icon: Calendar, variant: 'outline' as const },
          { label: 'View Analytics', icon: TrendingUp, variant: 'outline' as const },
        ];
      case 'candidate':
        return [
          { label: 'Search Jobs', icon: Search, variant: 'default' as const },
          { label: 'Update Profile', icon: Edit, variant: 'outline' as const },
          { label: 'View Applications', icon: FileText, variant: 'outline' as const },
          { label: 'Skill Assessment', icon: Star, variant: 'outline' as const },
        ];
      default:
        return [];
    }
  };

  const getRecentItems = () => {
    switch (currentRole) {
      case 'admin':
        return {
          title: 'Recent System Activities',
          items: [
            {
              id: 1,
              title: 'New user registration spike',
              description: '47 new users registered in the last hour',
              time: '5 min ago',
              status: 'info',
              avatar: 'SY',
            },
            {
              id: 2,
              title: 'Server maintenance completed',
              description: 'Database optimization finished successfully',
              time: '2 hours ago',
              status: 'success',
              avatar: 'SM',
            },
            {
              id: 3,
              title: 'Payment gateway issue resolved',
              description: 'Subscription payments are now processing normally',
              time: '4 hours ago',
              status: 'warning',
              avatar: 'PG',
            },
            {
              id: 4,
              title: 'Security scan completed',
              description: 'No vulnerabilities detected in latest scan',
              time: '1 day ago',
              status: 'success',
              avatar: 'SC',
            },
          ],
        };
      case 'recruiter':
        return {
          title: 'Recent Applications',
          items: [
            {
              id: 1,
              title: 'Sarah Johnson',
              description: 'Applied for Senior Frontend Developer',
              time: '2 min ago',
              status: 'new',
              avatar: 'SJ',
            },
            {
              id: 2,
              title: 'Michael Chen',
              description: 'Applied for Product Manager',
              time: '1 hour ago',
              status: 'reviewed',
              avatar: 'MC',
            },
            {
              id: 3,
              title: 'Emily Davis',
              description: 'Applied for UX Designer',
              time: '3 hours ago',
              status: 'interview',
              avatar: 'ED',
            },
            {
              id: 4,
              title: 'David Wilson',
              description: 'Applied for Backend Developer',
              time: '5 hours ago',
              status: 'rejected',
              avatar: 'DW',
            },
          ],
        };
      case 'candidate':
        return {
          title: 'Recent Job Views',
          items: [
            {
              id: 1,
              title: 'Senior React Developer',
              description: 'TechCorp Inc. • $120k-$150k • Remote',
              time: '1 hour ago',
              status: 'saved',
              avatar: 'TC',
            },
            {
              id: 2,
              title: 'Product Manager',
              description: 'StartupXYZ • $100k-$130k • San Francisco',
              time: '3 hours ago',
              status: 'applied',
              avatar: 'SX',
            },
            {
              id: 3,
              title: 'Full Stack Engineer',
              description: 'BigTech Co. • $140k-$180k • New York',
              time: '1 day ago',
              status: 'viewed',
              avatar: 'BT',
            },
            {
              id: 4,
              title: 'Frontend Developer',
              description: 'Design Studio • $90k-$110k • Austin',
              time: '2 days ago',
              status: 'expired',
              avatar: 'DS',
            },
          ],
        };
      default:
        return { title: '', items: [] };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'info':
        return 'bg-info text-info-foreground';
      case 'new':
        return 'bg-success text-success-foreground';
      case 'reviewed':
        return 'bg-info text-info-foreground';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'saved':
        return 'bg-warning text-warning-foreground';
      case 'applied':
        return 'bg-success text-success-foreground';
      case 'viewed':
        return 'bg-muted text-muted-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const recentItems = getRecentItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="capitalize bg-transparent">
                  {currentRole} View
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCurrentRole('admin')}>
                  Admin View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentRole('recruiter')}>
                  Recruiter View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentRole('candidate')}>
                  Candidate View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-foreground" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getMetrics().map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getQuickActions().map((action, index) => (
                <Button key={index} variant={action.variant} className="w-full justify-start">
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Items */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{recentItems.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentItems.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">{item.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Role-Specific Content */}
        {currentRole === 'admin' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Last Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Database</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </TableCell>
                    <TableCell>99.9%</TableCell>
                    <TableCell>2 min ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>API Gateway</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </TableCell>
                    <TableCell>99.8%</TableCell>
                    <TableCell>1 min ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email Service</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                    </TableCell>
                    <TableCell>98.5%</TableCell>
                    <TableCell>5 min ago</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {currentRole === 'recruiter' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Senior Frontend Developer</TableCell>
                    <TableCell>23</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </TableCell>
                    <TableCell>3 days ago</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Product Manager</TableCell>
                    <TableCell>15</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </TableCell>
                    <TableCell>1 week ago</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>UX Designer</TableCell>
                    <TableCell>31</TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">Closed</Badge>
                    </TableCell>
                    <TableCell>2 weeks ago</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {currentRole === 'candidate' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>TC</AvatarFallback>
                        </Avatar>
                        <span>TechCorp Inc.</span>
                      </div>
                    </TableCell>
                    <TableCell>Senior React Developer</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">Interview</Badge>
                    </TableCell>
                    <TableCell>3 days ago</TableCell>
                    <TableCell>$120k - $150k</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SX</AvatarFallback>
                        </Avatar>
                        <span>StartupXYZ</span>
                      </div>
                    </TableCell>
                    <TableCell>Product Manager</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                    </TableCell>
                    <TableCell>1 week ago</TableCell>
                    <TableCell>$100k - $130k</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>BT</AvatarFallback>
                        </Avatar>
                        <span>BigTech Co.</span>
                      </div>
                    </TableCell>
                    <TableCell>Full Stack Engineer</TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    </TableCell>
                    <TableCell>2 weeks ago</TableCell>
                    <TableCell>$140k - $180k</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
