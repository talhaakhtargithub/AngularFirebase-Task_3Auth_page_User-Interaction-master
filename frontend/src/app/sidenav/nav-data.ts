export const navbarData = [
  {
    routeLink: 'dashboard',
    icon: 'fal fa-home',
    label: 'Dashboard'
  },
  {
    routeLink: 'products',
    icon: 'fal fa-user',
    label: 'Profile',
    children: [
      {
        routeLink: 'student',
        icon: 'fal fa-user-graduate',
        label: 'Student'
      },
      {
        routeLink: 'teacher',
        icon: 'fal fa-chalkboard-teacher',
        label: 'Teacher'
      }
    ]
  },
  {
    routeLink: 'statistics',
    icon: 'fal fa-chart-bar',
    label: 'Individual',
    children: [
      {
        routeLink: 'student-individual',
        icon: 'fal fa-user-graduate',
        label: 'Student'
      },
      {
        routeLink: 'teacher-individual',
        icon: 'fal fa-chalkboard-teacher',
        label: 'Teacher'
      }
    ]
  },
  {
    routeLink: 'favorite',
    icon: 'fal fa-tags',
    label: 'Favorite'
  },
  {
    routeLink: 'pages',
    icon: 'fal fa-bell',
    label: 'Notifications'
  },
  {
    routeLink: 'media',
    icon: 'fal fa-book',
    label: 'History'
  },
  {
    routeLink: 'settings',
    icon: 'fal fa-cog',
    label: 'Settings'
  },
];
