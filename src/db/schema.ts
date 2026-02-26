import { pgTable, serial, text, timestamp, integer, decimal, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'FEEDING',           // Alimentando (aguardando valor mínimo)
  'CREATED',           // Pedido Criado (Aguardando envio)
  'SENT',              // Enviado ao Fornecedor
  'APPROVED',          // Pedido Aprovado
  'MIRROR_ARRIVED',    // Espelho do Cliente Chegou
  'WAITING_ARRIVAL',   // Aguardando Chegada
  'RECEIVED_COMPLETE', // Recebido Completo
  'RECEIVED_PARTIAL',  // Recebido com Saldo
  'PENDING_ISSUE',     // Pendência
  'CANCELLED'          // Cancelado
]);

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'MANAGER', 'EMPLOYEE']);

// Tables

export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Hashed
  role: userRoleEnum('role').default('EMPLOYEE').notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  observations: text('observations'),
  whatsapp: text('whatsapp'),
  storeId: integer('store_id').references(() => stores.id), // Nullable for migration
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const representatives = pgTable('representatives', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const refusedInvoices = pgTable('refused_invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  storeId: integer('store_id').references(() => stores.id), // Nullable for migration
  returnDate: timestamp('return_date').notNull(),
  reason: text('reason').notNull(),
  boletoNumber: text('boleto_number'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(), // Validar unicidade por loja via lógica de aplicação ou índice composto futuro
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  storeId: integer('store_id').references(() => stores.id), // Nullable for migration
  totalValue: decimal('total_value', { precision: 10, scale: 2 }),
  remainingValue: decimal('remaining_value', { precision: 10, scale: 2 }),
  status: orderStatusEnum('status').default('CREATED').notNull(),
  sentDate: timestamp('sent_date').defaultNow().notNull(),
  expectedArrivalDate: timestamp('expected_arrival_date'),
  observations: text('observations'),
  lastUpdate: timestamp('last_update').defaultNow().notNull(),
  cancellationReason: text('cancellation_reason'),
  cancelledBy: text('cancelled_by'),
  checked: boolean('checked').default(false).notNull(),
  requestedBy: text('requested_by'),
  partialReason: text('partial_reason'),
});

export const orderHistory = pgTable('order_history', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  previousStatus: orderStatusEnum('previous_status'),
  newStatus: orderStatusEnum('new_status').notNull(),
  changeDate: timestamp('change_date').defaultNow().notNull(),
  notes: text('notes'),
});

export const partialReceipts = pgTable('partial_receipts', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  receivedValue: decimal('received_value', { precision: 10, scale: 2 }).notNull(),
  remainingValueAfter: decimal('remaining_value_after', { precision: 10, scale: 2 }).notNull(),
  receivedDate: timestamp('received_date').defaultNow().notNull(),
  receivedBy: text('received_by'),
  notes: text('notes'),
});

// Relations

export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  orders: many(orders),
  suppliers: many(suppliers),
  refusedInvoices: many(refusedInvoices),
}));

export const usersRelations = relations(users, ({ one }) => ({
  store: one(stores, {
    fields: [users.storeId],
    references: [stores.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  store: one(stores, {
    fields: [suppliers.storeId],
    references: [stores.id],
  }),
  representatives: many(representatives),
  orders: many(orders),
  refusedInvoices: many(refusedInvoices),
}));

export const refusedInvoicesRelations = relations(refusedInvoices, ({ one }) => ({
  store: one(stores, {
    fields: [refusedInvoices.storeId],
    references: [stores.id],
  }),
  supplier: one(suppliers, {
    fields: [refusedInvoices.supplierId],
    references: [suppliers.id],
  }),
}));

export const representativesRelations = relations(representatives, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [representatives.supplierId],
    references: [suppliers.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  supplier: one(suppliers, {
    fields: [orders.supplierId],
    references: [suppliers.id],
  }),
  history: many(orderHistory),
  partialReceipts: many(partialReceipts),
}));

export const orderHistoryRelations = relations(orderHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderHistory.orderId],
    references: [orders.id],
  }),
}));

export const partialReceiptsRelations = relations(partialReceipts, ({ one }) => ({
  order: one(orders, {
    fields: [partialReceipts.orderId],
    references: [orders.id],
  }),
}));
