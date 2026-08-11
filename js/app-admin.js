import { initAdmin, refreshAdmin } from './admin.js';
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
  document.title = `${cfg.brand.name} — ${cfg.admin.title}`;
  document.querySelector('.header-brand-icon').textContent = cfg.brand.icon;
  document.querySelector('.header-brand span').textContent = cfg.brand.name;
  document.querySelector('.page-title').textContent = cfg.admin.title;
  document.querySelector('.page-subtitle').textContent = cfg.admin.subtitle;
  document.querySelector('.header-nav-item').textContent = cfg.nav.backToShop;
  document.querySelectorAll('.admin-tab').forEach(btn => {
    const tab = btn.dataset.tab;
    if (tab === 'orders') btn.textContent = cfg.nav.orders;
    if (tab === 'menu') btn.textContent = cfg.nav.menu;
  });
  // Mobile footer
  document.querySelector('.footer-item[data-view="customer"] span').textContent = cfg.nav.customer;
  document.querySelector('.footer-item[data-view="admin"] span').textContent = cfg.nav.admin;
  // Lang button
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = currentLang() === 'zh-HK' ? 'EN' : '繁中';
}

function toggleLang() {
  switchLang(currentLang() === 'zh-HK' ? 'en' : 'zh-HK');
  applyConfig();
  refreshAdmin();
}

function init() {
  initTheme();
  applyConfig();
  updateThemeIcon();
  initAdmin();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('lang-toggle')?.addEventListener('click', toggleLang);
}

document.addEventListener('DOMContentLoaded', init);
