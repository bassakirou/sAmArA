const path = require('path');
const ACTIVE_LOCALES = ['fr'];
const DEFAULT_LOCALE = 'fr';

module.exports = {
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: ACTIVE_LOCALES,
    localeDetection: false,
  },
  react: { useSuspense: false },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
