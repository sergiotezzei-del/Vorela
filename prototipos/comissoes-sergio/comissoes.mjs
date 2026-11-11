'use strict';

export const SCHEMA_VERSION = 2;

export function moneyToCents(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) throw new Error('Valor inválido');
    return Math.round(value * 100);
  }
  const normalized = String(value ?? '').trim()
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  if (!normalized) return 0;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) throw new Error('Valor inválido');
  return Math.round(n * 100);
}

export function formatMoney(cents) {
  return new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})
    .format((Number(cents) || 0) / 100);
}

export function calculateCommission(sale) {
  if (sale.commissionMode === 'percent') {
    const pct = Number(sale.commissionPercent || 0);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) throw new Error('Percentual inválido');
    return Math.round((Number(sale.saleCents || 0) * pct) / 100);
  }
  return Number(sale.commissionCents || 0);
}

export function saleTotals(sale) {
  const commissionCents = calculateCommission(sale);
  const paidCents = (sale.payments || []).reduce((sum, p) => sum + Number(p.cents || 0), 0);
  const plannedCents = (sale.installments || []).reduce((sum, p) => sum + Number(p.cents || 0), 0);
  return {
    commissionCents,
    paidCents,
    remainingCents: commissionCents - paidCents,
    plannedCents,
    installmentDifferenceCents: commissionCents - plannedCents,
  };
}

export function dashboardTotals(sales) {
  return (sales || []).reduce((acc, sale) => {
    const totals = saleTotals(sale);
    acc.saleCents += Number(sale.saleCents || 0);
    acc.commissionCents += totals.commissionCents;
    acc.paidCents += totals.paidCents;
    acc.remainingCents += totals.remainingCents;
    acc.itemCount += Array.isArray(sale.items) ? sale.items.length : 0;
    return acc;
  }, {saleCents:0, commissionCents:0, paidCents:0, remainingCents:0, itemCount:0});
}

export function newId(prefix='id') {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

export function normalizeStore(raw) {
  const base = {schemaVersion:SCHEMA_VERSION, updatedAt:new Date().toISOString(), sales:[]};
  if (!raw || typeof raw !== 'object') return base;
  const sales = Array.isArray(raw.sales) ? raw.sales : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    sales: sales.map(s => ({
      id: String(s.id || newId('sale')),
      client: String(s.client || '').slice(0,120),
      items: (Array.isArray(s.items) ? s.items : (s.project ? [s.project] : [])).map(x => ({
        id: String((x && typeof x === 'object' ? x.id : '') || newId('item')),
        name: String(x && typeof x === 'object' ? x.name : x || '').slice(0,80),
      })).filter(x => x.name),
      saleDate: String(s.saleDate || ''),
      saleCents: Number(s.saleCents || 0),
      commissionMode: s.commissionMode === 'percent' ? 'percent' : 'fixed',
      commissionPercent: Number(s.commissionPercent || 0),
      commissionCents: Number(s.commissionCents || 0),
      notes: String(s.notes || '').slice(0,1000),
      installments: Array.isArray(s.installments) ? s.installments.map(x => ({
        id:String(x.id || newId('inst')),
        dueDate:String(x.dueDate || ''),
        cents:Number(x.cents || 0),
        note:String(x.note || '').slice(0,300),
      })) : [],
      payments: Array.isArray(s.payments) ? s.payments.map(x => ({
        id:String(x.id || newId('pay')),
        paidAt:String(x.paidAt || ''),
        cents:Number(x.cents || 0),
        method:String(x.method || '').slice(0,80),
        note:String(x.note || '').slice(0,300),
      })) : [],
      createdAt: String(s.createdAt || new Date().toISOString()),
      updatedAt: String(s.updatedAt || new Date().toISOString()),
    }))
  };
}
