import {
  BusinessType,
  ModuleToken,
  UserRoleType,
  DevicePlatform,
} from '@platform/types';

export interface ModuleDefinition {
  token: ModuleToken;
  name: string;
  category: 'OPERATIONS' | 'POINT_OF_SALE' | 'CATALOG' | 'BILLING' | 'INVENTORY' | 'MARKETING' | 'INTELLIGENCE';
  description: string;
  dependencies?: ModuleToken[];
  defaultEnabledFor: BusinessType[];
  icon: string;
}

export const SYSTEM_MODULE_REGISTRY: Record<ModuleToken, ModuleDefinition> = {
  'pos.dine_in': {
    token: 'pos.dine_in',
    name: 'Dine-In Table POS',
    category: 'POINT_OF_SALE',
    description: 'Manage table-based ordering, guest counts, and dine-in bills',
    dependencies: ['operations.tables'],
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'Utensils',
  },
  'pos.quick_counter': {
    token: 'pos.quick_counter',
    name: 'Quick Counter POS',
    category: 'POINT_OF_SALE',
    description: 'Ultra-fast counter ordering and checkout for walk-in customers',
    defaultEnabledFor: ['BAKERY', 'FAST_FOOD', 'FOOD_COURT', 'CAFE'],
    icon: 'Zap',
  },
  'pos.takeaway': {
    token: 'pos.takeaway',
    name: 'Takeaway & Parcel',
    category: 'POINT_OF_SALE',
    description: 'Separate packaging charges, customer pickup tracking, and takeaway billing',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN', 'FOOD_COURT'],
    icon: 'ShoppingBag',
  },
  'pos.delivery': {
    token: 'pos.delivery',
    name: 'Direct Delivery Orders',
    category: 'POINT_OF_SALE',
    description: 'Dispatch riders, customer delivery addresses, and delivery fee calculation',
    defaultEnabledFor: ['CLOUD_KITCHEN', 'RESTAURANT', 'FAST_FOOD'],
    icon: 'Bike',
  },
  'operations.tables': {
    token: 'operations.tables',
    name: 'Table & Floor Management',
    category: 'OPERATIONS',
    description: 'Interactive floor plan, indoor/outdoor sections, and live table occupancy',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'LayoutGrid',
  },
  'operations.kitchen_kds': {
    token: 'operations.kitchen_kds',
    name: 'Kitchen Display System (KDS)',
    category: 'OPERATIONS',
    description: 'Real-time kitchen order screen with station routing (Bar, Grill, Dessert)',
    defaultEnabledFor: ['RESTAURANT', 'CLOUD_KITCHEN', 'FAST_FOOD', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'ChefHat',
  },
  'operations.kot_printing': {
    token: 'operations.kot_printing',
    name: 'Kitchen Order Ticket (KOT) Printing',
    category: 'OPERATIONS',
    description: 'Automatic thermal printing of kitchen slips to station thermal printers',
    dependencies: ['hardware.thermal_printers'],
    defaultEnabledFor: ['RESTAURANT', 'CLOUD_KITCHEN', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'Printer',
  },
  'catalog.modifiers_variants': {
    token: 'catalog.modifiers_variants',
    name: 'Modifiers, Add-ons & Variants',
    category: 'CATALOG',
    description: 'Portion sizes (Half/Full), customizable toppings, spice levels, and combos',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN', 'BAR'],
    icon: 'Layers',
  },
  'inventory.raw_materials': {
    token: 'inventory.raw_materials',
    name: 'Raw Material & Stock Tracking',
    category: 'INVENTORY',
    description: 'Track stock of ingredients, purchase orders, minimum alerts, and suppliers',
    defaultEnabledFor: ['RESTAURANT', 'BAKERY', 'CLOUD_KITCHEN', 'BAR'],
    icon: 'Package',
  },
  'inventory.recipes_bom': {
    token: 'inventory.recipes_bom',
    name: 'Recipe Bill of Materials (BOM)',
    category: 'INVENTORY',
    description: 'Automatically deduct raw ingredients from stock as dishes are sold',
    dependencies: ['inventory.raw_materials'],
    defaultEnabledFor: ['RESTAURANT', 'BAKERY', 'CLOUD_KITCHEN'],
    icon: 'Scale',
  },
  'crm.customers': {
    token: 'crm.customers',
    name: 'Customer Directory & Profiles',
    category: 'MARKETING',
    description: 'Customer contact history, total visits, lifetime spend, and purchase history',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN'],
    icon: 'Users',
  },
  'crm.loyalty': {
    token: 'crm.loyalty',
    name: 'Loyalty Points & Rewards',
    category: 'MARKETING',
    description: 'Reward frequent customers with points and automatic discounts',
    dependencies: ['crm.customers'],
    defaultEnabledFor: ['CAFE', 'BAKERY'],
    icon: 'Award',
  },
  'billing.split_payment': {
    token: 'billing.split_payment',
    name: 'Split Payments',
    category: 'BILLING',
    description: 'Split bills across multiple payment modes (e.g., ₹500 Cash + ₹700 UPI)',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAR', 'HOTEL_RESTAURANT'],
    icon: 'Split',
  },
  'billing.discounts': {
    token: 'billing.discounts',
    name: 'Discounts & Promo Codes',
    category: 'BILLING',
    description: 'Apply percentage or fixed discounts with optional manager approval',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN'],
    icon: 'Percent',
  },
  'billing.tax_gst': {
    token: 'billing.tax_gst',
    name: 'Tax & GST Configuration',
    category: 'BILLING',
    description: 'Item-level or bill-level tax breakdown (CGST, SGST, VAT, Service Charge)',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'FileText',
  },
  'qr.table_ordering': {
    token: 'qr.table_ordering',
    name: 'Contactless QR Table Ordering',
    category: 'OPERATIONS',
    description: 'Customers scan table QR code to view menu and place orders directly',
    dependencies: ['operations.tables'],
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAR'],
    icon: 'QrCode',
  },
  'qr.digital_menu': {
    token: 'qr.digital_menu',
    name: 'Read-Only Digital Menu QR',
    category: 'OPERATIONS',
    description: 'Scan QR code to browse live menu without ordering capabilities',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'Smartphone',
  },
  'qr.table_pay': {
    token: 'qr.table_pay',
    name: 'Table QR Pay',
    category: 'BILLING',
    description: 'Allow customers to scan bill QR code and pay directly via UPI or card',
    defaultEnabledFor: ['RESTAURANT', 'CAFE'],
    icon: 'CreditCard',
  },
  'staff.shared_access': {
    token: 'staff.shared_access',
    name: 'Shared Worker Access Model',
    category: 'OPERATIONS',
    description: 'Multiple staff members can service any table with full audit attribution',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'UserCheck',
  },
  'staff.device_mgmt': {
    token: 'staff.device_mgmt',
    name: 'Worker Device Authorization',
    category: 'OPERATIONS',
    description: 'Authorize staff phones and tablets, with one-click remote revocation',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'FAST_FOOD', 'CLOUD_KITCHEN', 'BAR'],
    icon: 'Shield',
  },
  'hardware.thermal_printers': {
    token: 'hardware.thermal_printers',
    name: 'ESC/POS Thermal Printing',
    category: 'BILLING',
    description: 'Network, USB, and Bluetooth receipt and KOT printing',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN', 'FOOD_COURT', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'Printer',
  },
  'finance.expenses': {
    token: 'finance.expenses',
    name: 'Daily Expense Tracker',
    category: 'BILLING',
    description: 'Track store expenses, petty cash, supplier payouts, and utility bills',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN'],
    icon: 'Receipt',
  },
  'reports.sales_analytics': {
    token: 'reports.sales_analytics',
    name: 'Sales & Product Analytics',
    category: 'INTELLIGENCE',
    description: 'Daily revenue, hourly sales heatmaps, popular dishes, and profit margins',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN', 'FOOD_COURT', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'BarChart3',
  },
  'reports.staff_activity': {
    token: 'reports.staff_activity',
    name: 'Staff Audit & Activity Reports',
    category: 'INTELLIGENCE',
    description: 'Track orders placed, items added, bills voided, and discounts applied by worker',
    dependencies: ['staff.shared_access'],
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'HOTEL_RESTAURANT', 'BAR'],
    icon: 'Activity',
  },
  'ai.menu_import': {
    token: 'ai.menu_import',
    name: 'AI Menu Card Ingestion',
    category: 'INTELLIGENCE',
    description: 'Upload menu photos and convert them instantly to structured catalog items with human review',
    defaultEnabledFor: ['RESTAURANT', 'CAFE', 'BAKERY', 'FAST_FOOD', 'CLOUD_KITCHEN', 'BAR'],
    icon: 'Sparkles',
  },
};

/**
 * Returns default enabled modules for any given business type
 */
export function getDefaultModulesForBusinessType(type: BusinessType): ModuleToken[] {
  const tokens = Object.values(SYSTEM_MODULE_REGISTRY)
    .filter((mod) => mod.defaultEnabledFor.includes(type))
    .map((mod) => mod.token);
  return tokens;
}

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
}

/**
 * Dynamic Navigation Engine
 * Resolves sidebar, bottom bar, and dashboard links based on enabled modules, user role, and permissions.
 */
export function resolveDynamicNavigation(params: {
  businessType: BusinessType;
  enabledModules: ModuleToken[];
  userRole: UserRoleType;
  permissions: string[];
  devicePlatform: DevicePlatform;
}): {
  sidebarItems: NavItem[];
  bottomNavItems: NavItem[];
  defaultRoute: string;
} {
  const { enabledModules, userRole, permissions, devicePlatform } = params;

  // Kitchen Worker specialized single-purpose layout
  if (userRole === 'KITCHEN') {
    const kitchenNav: NavItem[] = [
      { id: 'kds', title: 'Live Kitchen Orders', href: '/kitchen', icon: 'ChefHat' },
      { id: 'profile', title: 'My Station', href: '/profile', icon: 'User' },
    ];
    return {
      sidebarItems: kitchenNav,
      bottomNavItems: kitchenNav,
      defaultRoute: '/kitchen',
    };
  }

  // Operational role restrictions per 3-Role Architecture: OWNER, WAITER, KITCHEN
  const isWaiter = userRole === 'WAITER';

  const hasMod = (mod: ModuleToken) => enabledModules.includes(mod);
  const can = (perm: string) => permissions.includes('*') || permissions.includes(perm);

  const sidebarItems: NavItem[] = [];

  // 1. Dashboard (Owner only)
  if (!isWaiter) {
    sidebarItems.push({
      id: 'dashboard',
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    });
  }

  // 2. POS Client
  if (can('pos:access') || can('orders:create')) {
    sidebarItems.push({
      id: 'pos',
      title: 'Point of Sale',
      href: '/pos',
      icon: 'Calculator',
    });
  }

  // 3. Table Floor (Dine-in only)
  if (hasMod('operations.tables') && can('tables:view')) {
    sidebarItems.push({
      id: 'tables',
      title: 'Table Floor',
      href: '/tables',
      icon: 'LayoutGrid',
    });
  }

  // 4. Kitchen Display (if enabled)
  if (hasMod('operations.kitchen_kds') && (can('kds:view') || !isWaiter)) {
    sidebarItems.push({
      id: 'kitchen',
      title: 'Kitchen Display',
      href: '/kitchen',
      icon: 'ChefHat',
    });
  }

  // 5. Orders & Bills
  if (can('orders:view')) {
    sidebarItems.push({
      id: 'orders',
      title: 'Live Orders',
      href: '/orders',
      icon: 'ClipboardList',
    });
  }

  // 6. Menu Management
  if (can('catalog:manage') && !isWaiter) {
    sidebarItems.push({
      id: 'catalog',
      title: 'Menu & Categories',
      href: '/menu',
      icon: 'BookOpen',
    });
  }

  // 7. Inventory
  if (hasMod('inventory.raw_materials') && can('inventory:view') && !isWaiter) {
    sidebarItems.push({
      id: 'inventory',
      title: 'Inventory & Stock',
      href: '/inventory',
      icon: 'Package',
    });
  }

  // 8. Staff & Roles
  if (hasMod('staff.shared_access') && can('staff:manage') && !isWaiter) {
    sidebarItems.push({
      id: 'staff',
      title: 'Staff & Devices',
      href: '/staff',
      icon: 'Users',
    });
  }

  // 9. Customers
  if (hasMod('crm.customers') && can('crm:view') && !isWaiter) {
    sidebarItems.push({
      id: 'customers',
      title: 'Customers',
      href: '/customers',
      icon: 'UserCheck',
    });
  }

  // 10. Reports
  if (hasMod('reports.sales_analytics') && can('reports:view') && !isWaiter) {
    sidebarItems.push({
      id: 'reports',
      title: 'Analytics & Reports',
      href: '/reports',
      icon: 'BarChart3',
    });
  }

  // 11. Settings
  if (can('settings:manage') && !isWaiter) {
    sidebarItems.push({
      id: 'settings',
      title: 'Store Settings',
      href: '/settings',
      icon: 'Settings',
    });
  }

  // Generate bottom nav for mobile devices (capped at 4-5 high frequency items)
  const bottomNavItems: NavItem[] = [];
  if (can('pos:access') || can('orders:create')) {
    bottomNavItems.push({ id: 'pos', title: 'POS', href: '/pos', icon: 'Calculator' });
  }
  if (hasMod('operations.tables') && can('tables:view')) {
    bottomNavItems.push({ id: 'tables', title: 'Tables', href: '/tables', icon: 'LayoutGrid' });
  }
  if (can('orders:view')) {
    bottomNavItems.push({ id: 'orders', title: 'Orders', href: '/orders', icon: 'ClipboardList' });
  }
  if (hasMod('operations.kitchen_kds') && can('kds:view')) {
    bottomNavItems.push({ id: 'kitchen', title: 'KDS', href: '/kitchen', icon: 'ChefHat' });
  }
  if (!isWaiter) {
    bottomNavItems.push({ id: 'dashboard', title: 'More', href: '/dashboard', icon: 'Menu' });
  }

  const defaultRoute = isWaiter ? (hasMod('operations.tables') ? '/tables' : '/pos') : '/dashboard';

  return {
    sidebarItems,
    bottomNavItems,
    defaultRoute,
  };
}

/**
 * Determines whether POS operates in Dine-In Table mode or Quick Counter mode
 */
export function resolvePosMode(enabledModules: ModuleToken[]): 'DINE_IN' | 'QUICK_COUNTER' | 'HYBRID' {
  const hasTables = enabledModules.includes('operations.tables') || enabledModules.includes('pos.dine_in');
  const hasQuick = enabledModules.includes('pos.quick_counter');

  if (hasTables && hasQuick) return 'HYBRID';
  if (hasTables) return 'DINE_IN';
  return 'QUICK_COUNTER';
}
