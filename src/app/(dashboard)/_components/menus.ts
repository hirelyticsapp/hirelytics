import {
  IconBasketQuestion,
  IconBriefcase,
  IconBuilding,
  IconDashboard,
  IconUsers,
} from '@tabler/icons-react';

const settingsNavigationMenus = [
  {
    title: 'Settings',
    items: [
      {
        title: 'Profile',
        url: '/profile',
        icon: IconUsers,
        color: 'text-teal-500',
      },
      {
        title: 'Notifications',
        url: '/notifications',
        icon: IconUsers,
        color: 'text-indigo-500',
      },
      {
        title: 'Billing',
        url: '/billings',
        icon: IconUsers,
        color: 'text-orange-500',
      },
    ],
  },
];

const adminNavigationMenus = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: IconDashboard,
        color: 'text-blue-500',
      },
      {
        title: 'Organizations',
        url: '/organizations',
        icon: IconBuilding,
        color: 'text-cyan-500',
      },
      {
        title: 'Candidates',
        url: '/candidates',
        icon: IconUsers,
        color: 'text-indigo-500',
      },
      {
        title: 'Recruiters',
        url: '/recruiters',
        icon: IconUsers,
        color: 'text-teal-500',
      },
      {
        title: 'Jobs',
        url: '/jobs',
        icon: IconBriefcase,
        color: 'text-orange-500',
      },
      {
        title: 'Portal Access Requests',
        url: '/portal-access-requests',
        icon: IconBasketQuestion,
        color: 'text-orange-500',
      },
    ],
  },
  ...settingsNavigationMenus,
];

const recruiterNavigationMenus = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: IconDashboard,
        color: 'text-blue-500',
      },
      {
        title: 'My Organizations',
        url: '/my-organizations',
        icon: IconBuilding,
        color: 'text-cyan-500',
      },
      {
        title: 'Members',
        url: '/members',
        icon: IconBuilding,
        color: 'text-cyan-500',
      },
      {
        title: 'Job Applications',
        url: '/job-application',
        icon: IconUsers,
        color: 'text-indigo-500',
      },
      {
        title: 'My Jobs',
        url: '/my-jobs',
        icon: IconUsers,
        color: 'text-teal-500',
      },
    ],
  },
  ...settingsNavigationMenus,
];

const candidateNavigationMenus = [
  {
    title: 'Main',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: IconDashboard,
        color: 'text-blue-500',
      },
      {
        title: 'My Job Invitations',
        url: '/my-job-invitations',
        icon: IconBuilding,
        color: 'text-cyan-500',
      },
      {
        title: 'My Saved Jobs',
        url: '/my-saved-jobs',
        icon: IconBriefcase,
        color: 'text-orange-500',
      },
      {
        title: 'My Applications',
        url: '/my-applications',
        icon: IconUsers,
        color: 'text-indigo-500',
      },
    ],
  },
  ...settingsNavigationMenus,
];

const emptyNavigationMenus = [
  {
    title: 'Main',
    items: [],
  },
];

const getNavigationMenus = (role: string | undefined) => {
  if (!role) {
    return emptyNavigationMenus;
  }

  switch (role) {
    case 'admin':
      return adminNavigationMenus;
    case 'recruiter':
      return recruiterNavigationMenus;
    case 'user':
      return candidateNavigationMenus;
    default:
      return emptyNavigationMenus;
  }
};

export { getNavigationMenus };
