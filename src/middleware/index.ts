export * from './logger.middleware';
export * from './security-headers.middleware';

export const localize = (req, res, next): any => {
  let locale = req.acceptsLanguages()[0];
  locale = locale.includes('-') ? locale.slice(0, -3) : locale;
  req.i18n.setLocale(locale);
  next();
};
