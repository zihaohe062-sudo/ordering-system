# 簡約點餐系統 / Simple Order System

一個簡約風 Web App 點餐系統，支持繁體中文 / English 雙語切換。

## 線上演示

- **點餐前台**: https://zihaohe062-sudo.github.io/ordering-system/
- **後台管理**: https://zihaohe062-sudo.github.io/ordering-system/admin.html

## 功能

### Customer UI（點餐前台）
- 餐點分類篩選（全部/主食/小食/飲品/甜品）
- 購物車抽屜（加減數量、移除、小計/服務費/總計）
- 結帳表單（姓名、電話、桌號/外帶、取餐時間、備註）
- 訂單成功頁
- 深色/淺色模式
- 繁中/EN 語言切換

### Admin Panel（後台管理）
- 營運數據儀表板
- 訂單管理（狀態：待處理→製作中→可取餐→已完成）
- 訂單詳情彈窗
- 菜單管理（新增/編輯/刪除餐點）
- 支援圖片上傳（URL 或本地檔案轉 Base64）
- 深色/淺色模式
- 繁中/EN 語言切換

## 自訂配置

### 修改所有文字與圖案

編輯 `js/i18n.js` 即可自訂所有文字、圖案：

```javascript
// 修改品牌名稱
brand: {
  name: '你的店名',
  icon: '🍕',
  tagline: '你的標語',
  welcomeText: '歡迎蒞臨',
}

// 修改分類
categories: {
  all: { name: '全部', icon: '🍽️' },
  mains: { name: '主食', icon: '🍚' },
  // ...
}

// 修改訂單狀態
orderStatuses: {
  pending: { label: '待處理', color: 'warning', icon: '⏳' },
  // ...
}
```

### 新增語言

在 `js/i18n.js` 的 `LOCALES` 中新增語言包：

```javascript
export const LOCALES = {
  'zh-HK': { /* ... */ },
  'en': { /* ... */ },
  'ja': { /* 日本語翻譯 */ },
}
```

### 修改菜單

編輯 `js/data.js` 中的 `DEFAULT_MENU` 陣列：

```javascript
{
  id: 'item_001',
  name: '日式咖喱飯',
  nameEn: 'Japanese Curry Rice',
  description: '自家製濃厚咖喱',
  descriptionEn: 'Homemade rich curry',
  price: 68,
  category: 'mains',
  tags: ['人氣'],
  image: '',  // 可填入圖片 URL
  available: true,
}
```

### 修改配色

編輯 `css/design-system.css` 中的 CSS 變量：

```css
:root {
  --color-primary: #2d6a4f;      /* 主色調 */
  --color-danger: #b91c1c;       /* 危險色 */
  --color-bg: #fafafa;           /* 背景色 */
  /* ... */
}
```

## 檔案結構

```
ordering-system/
├── index.html              ← 點餐前台入口
├── admin.html              ← 後台管理入口
├── css/
│   ├── design-system.css   ← 設計系統（顏色、字體、間距）
│   ├── components.css      ← 通用組件（按鈕、卡片、徽章、模態框）
│   ├── layout.css          ← 佈局（Header、Footer、Grid）
│   ├── customer.css        ← Customer UI 專用
│   └── admin.css           ← Admin Panel 專用
└── js/
    ├── config.js           ← 配置入口（導出 CONFIG 函數）
    ├── i18n.js             ← 語言包（繁中/EN，可擴充）
    ├── data.js             ← 餐點 mock data
    ├── utils.js            ← 工具函數
    ├── store.js            ← 狀態管理（localStorage 持久化）
    ├── customer.js         ← Customer UI 模組
    ├── admin.js            ← Admin Panel 模組
    ├── app-customer.js     ← 前台入口 JS
    └── app-admin.js        ← 後台入口 JS
```

## 技術

- 純 HTML / CSS / JavaScript，零依賴
- ES Modules 模組化
- localStorage 持久化
- 響應式設計（手機 + 桌面）
- 深色/淺色模式
- 雙語支援（繁中/EN）

## 本地運行

由於使用 ES Modules，需要用本地伺服器打開：

```bash
# 方法一：Python
python3 -m http.server 8080

# 方法二：Node.js
npx http-server

# 方法三：VS Code Live Server
```

然後打開 `http://localhost:8080`

## 部署到 GitHub Pages

```bash
git add -A
git commit -m "update"
git push origin main
```

頁面會自動部署到 `https://your-username.github.io/ordering-system/`
