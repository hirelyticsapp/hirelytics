import {
  IconBasketQuestion,
  IconBriefcase,
  IconBuilding,
  IconDashboard,
  IconUsers,
} from '@tabler/icons-react';

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
        title: 'Applied Jobs',
        url: '/applied-jobs',
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
        url: '/my-invitations',
        icon: IconBuilding,
        color: 'text-cyan-500',
      },
      {
        title: 'My Saved Jobs',
        url: '/my-jobs',
        icon: IconBriefcase,
        color: 'text-orange-500',
      },
      {
        title: 'My Applications',
        url: '/my-applications',
        icon: IconUsers,
        color: 'text-indigo-500',
      },
      {
        title: 'My Profile',
        url: '/my-profile',
        icon: IconUsers,
        color: 'text-teal-500',
      },
    ],
  },
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
