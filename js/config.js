import { t, getLang, setLang, getCategories, getStatuses, getCategoryEmoji, LOCALES } from './i18n.js';

export function CONFIG() {
  return {
    brand: t('brand'),
    nav: t('nav'),
    categories: getCategories(),
    cart: t('cart'),
    checkout: t('checkout'),
    orderSuccess: t('orderSuccess'),
    orderStatuses: getStatuses(),
    admin: t('admin'),
    orderDetail: t('orderDetail'),
    theme: t('theme'),
    lang: t('lang'),
    categoryEmoji: {
      mains: t('categories.mains.icon'),
      sides: t('categories.sides.icon'),
      drinks: t('categories.drinks.icon'),
      desserts: t('categories.desserts.icon'),
    },
  };
}

export function switchLang(lang) {
  setLang(lang);
}

export function currentLang() {
  return getLang();
}

export default CONFIG;
