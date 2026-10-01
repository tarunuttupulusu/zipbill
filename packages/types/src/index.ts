// ============================================================
// DOMAIN ENUMS & CONSTANTS
// ============================================================

export type BusinessType =
  | 'RESTAURANT'
  | 'CAFE'
  | 'BAKERY'
  | 'FAST_FOOD'
  | 'CLOUD_KITCHEN'
  | 'FOOD_COURT'
  | 'HOTEL_RESTAURANT'
  | 'BAR'
  | 'CUSTOM';

export type RegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'INFO_REQUESTED'
  | 'SUSPENDED';

export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'WAITER'
  | 'KITCHEN';

export type RestaurantRole =
  | 'OWNER'
  | 'WAITER'
  | 'KITCHEN';

export type TableStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'ORDER_READY'
  | 'BILLING'
  | 'RESERVED'
  | 'OUT_OF_SERVICE';

export type OrderStatus =
  | 'DRAFT'
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'BILLED'
  | 'COMPLETED'
  | 'CANCELLED';

export type KitchenTicketStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'ONLINE'
  | 'SPLIT';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type DevicePlatform =
  | 'WEB'
  | 'ANDROID_PHONE'
  | 'ANDROID_TABLET'
  | 'IOS_PHONE'
  | 'IOS_TABLET'
  | 'DESKTOP'
  | 'POS_TERMINAL';

export type SyncStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'CONFLICT';

export type PrinterProtocol = 'ESC_POS' | 'RAW' | 'PDF';
export type PrinterInterface = 'NETWORK' | 'USB' | 'BLUETOOTH';

// ============================================================
// DYNAMIC MODULE REGISTRY TOKENS
// ============================================================

export type ModuleToken =
  | 'pos.dine_in'
  | 'pos.quick_counter'
  | 'pos.takeaway'
  | 'pos.delivery'
  | 'operations.tables'
  | 'operations.kitchen_kds'
  | 'operations.kot_printing'
  | 'catalog.modifiers_variants'
  | 'inventory.raw_materials'
  | 'inventory.recipes_bom'
  | 'crm.customers'
  | 'crm.loyalty'
  | 'billing.split_payment'
  | 'billing.discounts'
  | 'billing.tax_gst'
  | 'qr.table_ordering'
  | 'qr.digital_menu'
  | 'qr.table_pay'
  | 'staff.shared_access'
  | 'staff.device_mgmt'
  | 'hardware.thermal_printers'
  | 'finance.expenses'
  | 'reports.sales_analytics'
  | 'reports.staff_activity'
  | 'ai.menu_import';

// ============================================================
// CORE ENTITY INTERFACES
// ============================================================

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  businessType: BusinessType;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  id: string;
  tenantId: string;
  businessName: string;
  legalEntityName?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  taxNumber?: string; // GST/VAT
  currencyCode: string; // INR, USD, EUR, etc.
  currencySymbol: string; // ₹, $, €, etc.
  timezone: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantModuleSetting {
  id: string;
  tenantId: string;
  moduleToken: ModuleToken;
  isEnabled: boolean;
  configJson?: Record<string, any>;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
}

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: string[]; // Permission codes
}

export interface User {
  id: string;
  tenantId?: string; // Nullable for Super Admin
  email: string;
  fullName: string;
  phone?: string;
  roleId?: string;
  role?: Role;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  tenantId?: string;
  email: string;
  fullName: string;
  roleName: string;
  permissions: string[];
  deviceId?: string;
  isSuperAdmin: boolean;
}

export interface Device {
  id: string;
  tenantId: string;
  userId?: string;
  deviceName: string;
  platform: DevicePlatform;
  appVersion: string;
  isRevoked: boolean;
  lastActiveAt: string;
  lastSyncAt?: string;
  createdAt: string;
}

// ============================================================
// DINING & TABLES
// ============================================================

export interface TableSection {
  id: string;
  tenantId: string;
  name: string;
  sortOrder: number;
  tables?: Table[];
}

export interface Table {
  id: string;
  tenantId: string;
  sectionId?: string;
  tableNumber: string;
  tableName: string;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
  activeOrderTotal?: number; // Represented in base currency units
  currentGuests?: number;
  occupiedAt?: string;
  qrCodeToken?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// MENU & CATALOG
// ============================================================

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
}

export interface MenuVariant {
  id: string;
  menuItemId: string;
  name: string; // e.g. "Half", "Full", "Small", "Large"
  price: number; // in cents/paise
  isAvailable: boolean;
}

export interface Modifier {
  id: string;
  groupId: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
}

export interface ModifierGroup {
  id: string;
  tenantId: string;
  name: string; // e.g. "Spice Level", "Choice of Dip", "Extra Cheese"
  minSelections: number;
  maxSelections: number;
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number; // in lowest currency unit (cents/paise)
  taxRatePercent: number; // e.g. 5 for 5% GST
  foodType: 'VEG' | 'NON_VEG' | 'EGG' | 'BEVERAGE' | 'OTHER';
  imageUrl?: string;
  sku?: string;
  isAvailable: boolean;
  sortOrder?: number;
  kitchenStationId?: string;
  variants?: MenuVariant[];
  modifierGroups?: ModifierGroup[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ORDERS & KITCHEN TICKETS
// ============================================================

export interface OrderItemModifier {
  id: string;
  orderItemId: string;
  modifierId: string;
  modifierName: string;
  unitPriceDelta: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  itemName: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  kitchenTicketId?: string;
  status: OrderStatus;
  addedByWorkerId: string;
  addedByWorkerName: string;
  createdAt: string;
  modifiers?: OrderItemModifier[];
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'COUNTER';
  tableId?: string;
  tableName?: string;
  tableSectionName?: string;
  customerId?: string;
  customerName?: string;
  status: OrderStatus;
  guestCount?: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  serviceChargeAmount: number;
  roundOffAmount: number;
  grandTotal: number;
  createdByWorkerId: string;
  createdByWorkerName: string;
  deviceId: string;
  notes?: string;
  items: OrderItem[];
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KitchenTicketItem {
  id: string;
  kitchenTicketId: string;
  orderItemId: string;
  itemName: string;
  variantName?: string;
  quantity: number;
  notes?: string;
  modifiersSummary?: string;
  status: KitchenTicketStatus;
}

export interface KitchenStation {
  id: string;
  tenantId: string;
  name: string; // e.g. "Main Kitchen", "Bar", "Grill", "Desserts"
  printerId?: string;
  isActive: boolean;
}

export interface KitchenTicket {
  id: string;
  tenantId: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: string;
  stationId?: string;
  stationName?: string;
  status: KitchenTicketStatus;
  items: KitchenTicketItem[];
  waiterName: string;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
}

// ============================================================
// BILLING & INVOICING
// ============================================================

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  processedByWorkerId: string;
  processedByWorkerName: string;
  processedAt: string;
  splits?: PaymentSplit[];
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  subtotal: number;
  taxAmount: number;
  taxDetailsJson?: Record<string, number>;
  discountAmount: number;
  discountReason?: string;
  serviceChargeAmount: number;
  roundOffAmount: number;
  grandTotal: number;
  status: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'VOIDED' | 'REFUNDED';
  payments?: Payment[];
  paidAmount: number;
  dueAmount: number;
  generatedByWorkerId: string;
  generatedByWorkerName: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// AUDIT LOGGING & ACTIVITY TRACKING
// ============================================================

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  deviceId?: string;
  action: string; // e.g. "ORDER_CREATED", "BILL_VOIDED", "PRICE_CHANGED", "ITEM_ADDED"
  entityType: string; // "ORDER", "INVOICE", "MENU_ITEM", "TABLE"
  entityId: string;
  metadataJson?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

// ============================================================
// OFFLINE SYNC PROTOCOL
// ============================================================

export interface SyncOperation {
  operationId: string; // Client UUIDv7
  tenantId: string;
  deviceId: string;
  workerId: string;
  entityType: 'ORDER' | 'ORDER_ITEM' | 'INVOICE' | 'PAYMENT' | 'TABLE_STATUS';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  localTimestamp: number;
  idempotencyKey: string;
  payloadJson: Record<string, any>;
  status: SyncStatus;
  retryCount: number;
  lastErrorMessage?: string;
  syncedAt?: string;
}

export interface SyncBatchRequest {
  deviceId: string;
  tenantId: string;
  clientTime: number;
  operations: SyncOperation[];
}

export interface SyncBatchResponse {
  success: boolean;
  syncedOperationIds: string[];
  failedOperations: Array<{
    operationId: string;
    errorCode: string;
    errorMessage: string;
  }>;
  serverTime: number;
}
