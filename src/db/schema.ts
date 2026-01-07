import { pgTable, serial, text, timestamp, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'SENT',              // Enviado ao Fornecedor
  'WAITING_ARRIVAL',   // Aguardando Chegada
  'RECEIVED_COMPLETE', // Recebido Completo
  'RECEIVED_PARTIAL'   // Recebido com Saldo
]);

// Tables

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  observations: text('observations'),
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

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // Código do pedido systema interno
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  totalValue: decimal('total_value', { precision: 10, scale: 2 }),
  status: orderStatusEnum('status').default('SENT').notNull(),
  sentDate: timestamp('sent_date').defaultNow().notNull(),
  expectedArrivalDate: timestamp('expected_arrival_date'), // Data combinada
  observations: text('observations'),
  lastUpdate: timestamp('last_update').defaultNow().notNull(),
});

export const orderHistory = pgTable('order_history', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  previousStatus: orderStatusEnum('previous_status'),
  newStatus: orderStatusEnum('new_status').notNull(),
  changeDate: timestamp('change_date').defaultNow().notNull(),
  notes: text('notes'), // Justificativa ou contexto da mudança
});

// Relations

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  representatives: many(representatives),
  orders: many(orders),
}));

export const representativesRelations = relations(representatives, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [representatives.supplierId],
    references: [suppliers.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [orders.supplierId],
    references: [suppliers.id],
  }),
  history: many(orderHistory),
}));

export const orderHistoryRelations = relations(orderHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderHistory.orderId],
    references: [orders.id],
  }),
}));
