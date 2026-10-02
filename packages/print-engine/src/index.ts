import { BusinessProfile, Invoice, Order, KitchenTicket } from '@platform/types';

// Standard ESC/POS Command Byte Sequences
export const ESC = 0x1b;
export const GS = 0x1d;

export const COMMANDS = {
  INIT: [ESC, 0x40], // Initialize printer
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_HEIGHT_ON: [GS, 0x21, 0x10],
  DOUBLE_WIDTH_ON: [GS, 0x21, 0x20],
  NORMAL_TEXT: [GS, 0x21, 0x00],
  FEED_AND_CUT: [GS, 0x56, 0x41, 0x03], // Feed 3 lines and full cut
  PARTIAL_CUT: [GS, 0x56, 0x01],
  LINE_FEED: [0x0a],
};

export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.buffer.push(...COMMANDS.INIT);
  }

  public init(): this {
    this.buffer.push(...COMMANDS.INIT);
    return this;
  }

  public align(direction: 'LEFT' | 'CENTER' | 'RIGHT'): this {
    if (direction === 'CENTER') this.buffer.push(...COMMANDS.ALIGN_CENTER);
    else if (direction === 'RIGHT') this.buffer.push(...COMMANDS.ALIGN_RIGHT);
    else this.buffer.push(...COMMANDS.ALIGN_LEFT);
    return this;
  }

  public bold(enable: boolean): this {
    this.buffer.push(...(enable ? COMMANDS.BOLD_ON : COMMANDS.BOLD_OFF));
    return this;
  }

  public textSize(size: 'NORMAL' | 'LARGE' | 'TITLE'): this {
    if (size === 'TITLE') this.buffer.push(...COMMANDS.DOUBLE_HEIGHT_ON, ...COMMANDS.DOUBLE_WIDTH_ON);
    else if (size === 'LARGE') this.buffer.push(...COMMANDS.DOUBLE_HEIGHT_ON);
    else this.buffer.push(...COMMANDS.NORMAL_TEXT);
    return this;
  }

  public text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(str));
    this.buffer.push(...bytes);
    return this;
  }

  public textLine(str: string): this {
    this.text(str);
    this.buffer.push(...COMMANDS.LINE_FEED);
    return this;
  }

  public divider(char = '-', width = 42): this {
    this.textLine(char.repeat(width));
    return this;
  }

  public twoColumn(left: string, right: string, width = 42): this {
    const spaceCount = Math.max(1, width - left.length - right.length);
    const line = left + ' '.repeat(spaceCount) + right;
    this.textLine(line);
    return this;
  }

  public cut(): this {
    this.buffer.push(...COMMANDS.FEED_AND_CUT);
    return this;
  }

  public getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Builds standard 80mm ESC/POS Thermal Receipt
 */
export function buildReceiptPrintJob(params: {
  business: BusinessProfile;
  invoice: Invoice;
  order: Order;
}): Uint8Array {
  const { business, invoice, order } = params;
  const builder = new EscPosBuilder();

  // Header: ZipBill Branding
  builder.align('CENTER')
    .bold(true)
    .textSize('TITLE')
    .textLine('=ZipBill=')
    .textSize('NORMAL')
    .bold(false)
    .textLine('RESTAURANT | CAFE | HOTEL')
    .divider('-')
    .bold(true)
    .textLine(business.businessName)
    .bold(false)
    .textLine(business.address)
    .textLine(`${business.city}, ${business.state}`)
    .textLine(`Tel: ${business.phone}`);

  if (business.taxNumber) {
    builder.textLine(`GST/Tax ID: ${business.taxNumber}`);
  }

  builder.divider('=')
    .align('LEFT')
    .twoColumn(`Bill No: ${invoice.invoiceNumber}`, `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`)
    .twoColumn(`Order: ${order.orderNumber}`, `Type: ${order.orderType}`)
    .twoColumn(`Server: ${order.createdByWorkerName}`, `Time: ${new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);

  if (order.tableName) {
    builder.bold(true).textLine(`TABLE: ${order.tableName}`).bold(false);
  }

  builder.divider('-')
    .bold(true)
    .twoColumn('ITEM [QTY]', 'AMOUNT')
    .bold(false)
    .divider('-');

  // Item List
  for (const item of order.items) {
    const itemLabel = `${item.itemName}${item.variantName ? ` (${item.variantName})` : ''} x${item.quantity}`;
    const amountStr = (item.subtotal / 100).toFixed(2);
    builder.twoColumn(itemLabel, amountStr);
  }

  builder.divider('-')
    .align('RIGHT')
    .twoColumn('Subtotal:', (invoice.subtotal / 100).toFixed(2))
    .twoColumn('Tax / GST:', (invoice.taxAmount / 100).toFixed(2));

  if (invoice.discountAmount > 0) {
    builder.twoColumn('Discount:', `-${(invoice.discountAmount / 100).toFixed(2)}`);
  }

  builder.divider('=')
    .bold(true)
    .textSize('LARGE')
    .twoColumn('GRAND TOTAL:', `${business.currencySymbol} ${(invoice.grandTotal / 100).toFixed(2)}`)
    .textSize('NORMAL')
    .bold(false)
    .divider('=');

  // Payment Status & ZipBill Footer
  builder.align('CENTER')
    .bold(true)
    .textLine(`STATUS: ${invoice.status}`)
    .textLine('Cardholder PIN verified')
    .textLine('!!! THANK YOU !!!')
    .bold(false)
    .textLine('Powered by ZipBill')
    .cut();

  return builder.getBytes();
}

/**
 * Builds KOT (Kitchen Order Ticket) for kitchen stations
 */
export function buildKotPrintJob(ticket: KitchenTicket): Uint8Array {
  const builder = new EscPosBuilder();

  builder.align('CENTER')
    .bold(true)
    .textSize('TITLE')
    .textLine('*** KOT TICKET ***')
    .textSize('NORMAL')
    .bold(false)
    .divider('=')
    .align('LEFT')
    .twoColumn(`KOT #: ${ticket.ticketNumber}`, `Order: ${ticket.orderNumber}`);

  if (ticket.tableNumber) {
    builder.bold(true).textSize('LARGE').textLine(`TABLE: ${ticket.tableNumber}`).textSize('NORMAL').bold(false);
  }

  builder.twoColumn(`Server: ${ticket.waiterName}`, `Time: ${new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  if (ticket.stationName) {
    builder.textLine(`Station: ${ticket.stationName}`);
  }

  builder.divider('-')
    .bold(true)
    .twoColumn('ITEM', 'QTY')
    .bold(false)
    .divider('-');

  for (const item of ticket.items) {
    builder.bold(true)
      .twoColumn(`${item.itemName}${item.variantName ? ` (${item.variantName})` : ''}`, `x ${item.quantity}`)
      .bold(false);

    if (item.notes) {
      builder.textLine(`  NOTE: ${item.notes}`);
    }
  }

  builder.divider('=')
    .cut();

  return builder.getBytes();
}
