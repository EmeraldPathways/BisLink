export type LinkEditorMode = 'link' | 'theme';

export type LinkMobileSection =
  | 'hero'
  | 'announcement'
  | 'bookings'
  | 'products'
  | 'portfolio'
  | 'about'
  | 'contact'
  | 'settings';

export type ThemeMobileSection = 'preset' | 'brand' | 'save';

export type MobileEditSection = LinkMobileSection | ThemeMobileSection;

const sectionMeta: Record<
  MobileEditSection,
  { title: string; description: string }
> = {
  hero: {
    title: 'Hero',
    description: 'Profile image, cover image, name, category, bio, and main CTA.'
  },
  announcement: {
    title: 'Announcement',
    description: 'Show or hide the announcement bar and edit its message.'
  },
  bookings: {
    title: 'Bookings',
    description: 'Section image, title, and subtitle for the bookings area.'
  },
  products: {
    title: 'Shop',
    description: 'Section image, title, and subtitle for the shop area.'
  },
  portfolio: {
    title: 'Portfolio',
    description: 'Add, remove, reorder, and update portfolio items.'
  },
  about: {
    title: 'About & Trust',
    description: 'Story, years of experience, stats, and trust section details.'
  },
  contact: {
    title: 'Contact & Social',
    description: 'Contact details, links, and social profiles shown on the public page.'
  },
  settings: {
    title: 'Link Settings',
    description: 'Update the public slug and open or copy the link.'
  },
  preset: {
    title: 'Theme Preset',
    description: 'Choose the overall theme direction for the public page.'
  },
  brand: {
    title: 'Brand Styling',
    description: 'Adjust colour and font styling while previewing the page.'
  },
  save: {
    title: 'Save Theme',
    description: 'Persist the current theme changes to the public page.'
  }
};

export const linkMobileSections: LinkMobileSection[] = [
  'hero',
  'announcement',
  'bookings',
  'products',
  'portfolio',
  'about',
  'contact',
  'settings'
];

export const themeMobileSections: ThemeMobileSection[] = ['preset', 'brand', 'save'];

export function getMobileSectionMeta(section: MobileEditSection) {
  return sectionMeta[section];
}
