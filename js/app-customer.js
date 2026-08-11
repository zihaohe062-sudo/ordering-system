import { initCustomer, refreshCustomer } from './customer.js';
import { CONFIG, switchLang, currentLang } from './config.js';

function initTheme() {
  const saved = localStorage.getItem('oms_theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('oms_theme', 'light'); }
  else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('oms_theme', 'dark'); }
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    const cfg = CONFIG();
    btn.querySelector('.theme-icon-light').textContent = cfg.theme.lightIcon;
    btn.querySelector('.theme-icon-dark').textContent = cfg.theme.darkIcon;
    btn.querySelector('.theme-icon-light').style.display = isDark ? 'none' : '';
    btn.querySelector('.theme-icon-dark').style.display = isDark ? '' : 'none';
  }
}

function applyConfig() {
  const cfg = CONFIG();
  document.title = `${cfg.brand.name} — Order System`;
  document.querySelector('.header-brand-icon').textContent = cfg.brand.icon;
  document.querySelector('.header-brand span').textContent = cfg.brand.name;
  document.querySelector('.hero-title').textContent = cfg.brand.welcomeText;
  document.querySelector('.hero-subtitle').textContent = cfg.brand.tagline;
  document.querySelector('.cart-drawer-title').textContent = cfg.cart.title;
  document.getElementById('checkout-btn').textContent = cfg.cart.checkout;
  document.querySelector('#checkout-modal .modal-title').textContent = cfg.checkout.title;
  document.querySelector('#checkout-form button[type="submit"]').textContent = cfg.checkout.submit;
  // Checkout labels
  document.querySelector('label[for="customerName"]').textContent = cfg.checkout.nameLabel;
  document.getElementById('customerName').placeholder = cfg.checkout.namePlaceholder;
  document.querySelector('label[for="phone"]').textContent = cfg.checkout.phoneLabel;
  document.getElementById('phone').placeholder = cfg.checkout.phonePlaceholder;
  document.querySelector('label[for="tableNumber"]').textContent = cfg.checkout.tableLabel;
  document.getElementById('tableNumber').placeholder = cfg.checkout.tablePlaceholder;
  document.querySelector('label[for="pickupTime"]').textContent = cfg.checkout.timeLabel;
  document.querySelector('label[for="notes"]').textContent = cfg.checkout.notesLabel;
  document.getElementById('notes').placeholder = cfg.checkout.notesPlaceholder;
  // Mobile footer
  document.querySelector('.footer-item[data-view="customer"] span').textContent = cfg.nav.customer;
  // Lang button
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = currentLang() === 'zh-HK' ? 'EN' : '繁中';
}

function toggleLang() {
  switchLang(currentLang() === 'zh-HK' ? 'en' : 'zh-HK');
  applyConfig();
  refreshCustomer();
}

function init() {
  initTheme();
  applyConfig();
  updateThemeIcon();
  initCustomer();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('lang-toggle')?.addEventListener('click', toggleLang);
}

document.addEventListener('DOMContentLoaded', init);
