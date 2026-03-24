const Menuitems = [
  {
    navlabel: true,
    subheader: 'FEATURES',
    icon: 'mdi mdi-dots-horizontal',
    href: 'features',
  },
  // {
  //   title: 'Quick Search',
  //   icon: 'location_searching',
  //   href: '/aura/quicksearch',
  // },
  {
    title: 'Search Stack',//This name suggests a tool that can help you stack multiple layers of search functionality on top of each other, building up a complex set of search capabilities. It plays on the concept of a "tech stack", 
    icon: 'layers',
    href: '/aura/searchstack',
  },
  {
    title: 'Search By Facility',
    icon: 'location_city',
    href: '/aura/facilitysearch',
  },
  {
    title: 'DataSift',//This name suggests a tool or system that can help you sift through and filter large amounts of data to find what you need.
    icon: 'filter_alt',
    href: '/aura/datasift',
  },
  {
    title: 'DataFetch',//This name suggests a tool or system that can help you fetch or download large amounts of data easily and quickly
    icon: 'file_download',
    href: '/aura/datafetch',
  }
];

export default Menuitems;
