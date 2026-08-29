# ☕ Northline Café POS - Next-Gen POS & KDS System

> **A Modern, Apple-Inspired Point of Sale & Kitchen Display System designed for Specialty Coffee Shops & Eateries.**

Built with **React 19, TypeScript, Tailwind CSS, Framer Motion, and Supabase Realtime**.

---

## 🌟 Key Features & Architecture

### 1. ☕ POS & Cashier Terminal
- **Visual Menu Grid**: Category filtering with smooth Spring-capsule Segmented Controls.
- **Product Customization**: Dynamic modifiers for Sweetness (0–100%), Ice Level, Milk Choice (Oat, Almond, Whole), and Add-on Toppings.
- **Promotional Coupons**: Built-in voucher engine with instant validation (e.g., `NORTHLINE10`, `WELCOME50`, `VIP20`).
- **Flexible Checkout**:
  - **Dynamic PromptPay QR Code** with embedded payable amount.
  - **Cash Calculator** with bill presets (฿100, ฿500, ฿1,000) and change calculation.
  - **Credit Card** & **QR Payment**.
  - **Split Bill Tool** for equal splitting among groups (2, 3, 4, 5+ guests).
- **Thermal Receipt Engine**:
  - Realistic 80mm & 58mm roll layout preview.
  - Direct slip printer support (`window.print()`).
  - 1-click receipt reprinting from order history.

### 2. 🗺️ Interactive Table & Floor Plan Management
- **4 Customizable Zones**: `Indoor Hall`, `Outdoor Garden`, `Bar Counter`, and `VIP Lounge`.
- **Live Floor KPI Dashboard**: Tracks occupancy percentage, available tables count, total seated guests, and active dine-in revenue.
- **Table Actions**: 1-click table assignment, table transfers (ย้ายโต๊ะ), reservation toggling, and automatic table release upon checkout.

### 3. 🍳 Kitchen Display System (KDS)
- **3-Stage Kanban Board**: `NEW` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`.
- **Realtime Sync**: Supabase Realtime channels push live orders across devices with zero delay.
- **Urgency Alerts**: Visual amber pulsing highlights for orders exceeding 10 minutes.
- **Barbell Sound**: Tactile audio alerts for baristas.

### 4. 📦 Inventory & Automated Recipe Consumption
- **Recipe Auto-Deduction**: Selling drinks/bakery automatically scales and deducts recipe ingredients (beans, milk, syrup, etc.).
- **Low Stock Warnings**: Visual threshold badges on menu cards and inventory lists.
- **Audit Trail**: Full logging for Restock (เติมของ), Adjustment (ปรับสต็อก), and Waste (ของเสีย).

### 5. 👥 Staff & Role-Based Access Control (RBAC)
- **4 Defined Roles**:
  - 👑 **Owner**: Full administrative access to revenue, staff, and system settings.
  - 👔 **Manager**: Operations, products, inventory, shifts, and reports.
  - 💵 **Cashier**: POS terminal, table floor plan, customer loyalty, and shift drawer.
  - ☕ **Barista**: Kitchen KDS, order queue, and inventory stock monitoring.
- **4-Digit Quick PIN Switching**: Fast cashier switching with lock screen.
- **Session Persistence**: Stays logged in across browser refreshes.

### 6. 💰 Cash Register & Shift Drawer
- **Starting Float**: Record opening cash balance.
- **Petty Cash**: Track Cash In / Cash Out during operating hours.
- **Shift Closing**: Automated cash discrepancy and variance calculation.

### 7. 📊 Reports & Business Analytics
- **Hourly Sales Chart**: Identifies peak business rush hours.
- **Category Donut Chart**: Breakdown of revenue by drink/bakery categories.
- **CSV Export**: 1-click export of sales records.

### 8. 🌐 Localization & Customization
- **Bilingual**: Instant 🇹🇭 Thai / 🇬🇧 English toggle across all pages.
- **Appearance**: Dark Mode, Light Mode, and Auto System theme.
- **Tactile Audio**: Built-in Web Audio API synthesizer for button clicks, scanners, and cash registers.

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/northline-pos.git

# Navigate into project directory
cd northline-pos

# Install dependencies
npm install
```

### 2. Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env
```
Open `.env` and configure your Supabase URL & Anon Key (or leave defaults for local testing).

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🔑 Default Staff PINs & Demo Accounts

| Name | Role | PIN | Permissions |
| :--- | :--- | :---: | :--- |
| **Elena** | `OWNER` | **`9999`** | Full System & Financial Access |
| **Tyson** | `MANAGER` | **`1234`** | Operations, Inventory & Staff Management |
| **Sarah** | `CASHIER` | **`0000`** | POS Register, Table Map & Orders |
| **Liam** | `BARISTA` | **`1111`** | Kitchen KDS & Queue Display |

### 🎟️ Demo Promo Codes
- **`NORTHLINE10`** : 10% Discount on all items
- **`WELCOME50`** : ฿50 Off on orders over ฿200
- **`VIP20`** : 20% Exclusive VIP discount
- **`COFFEELOVER`** : 15% Specialty Coffee discount (min. ฿150)

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Apple Human Interface Guidelines palette)
- **State Management**: Zustand
- **Animations**: Framer Motion (Spring physics & layoutId transitions)
- **Realtime / Database**: Supabase Client & Prisma ORM
- **Icons**: Lucide React
- **Audio**: Web Audio API Synthesizer (Zero external mp3 dependencies)

---

## 📄 License
This project is licensed under the MIT License.
