import test from 'node:test';
import assert from 'node:assert/strict';
import {moneyToCents, calculateCommission, saleTotals, dashboardTotals, normalizeStore} from './comissoes.mjs';

test('converte reais para centavos', () => {
  assert.equal(moneyToCents('1.234,56'), 123456);
  assert.equal(moneyToCents(19.9), 1990);
});

test('calcula comissão percentual', () => {
  assert.equal(calculateCommission({saleCents:1900000, commissionMode:'percent', commissionPercent:10}), 190000);
});

test('calcula comissão fixa', () => {
  assert.equal(calculateCommission({commissionMode:'fixed', commissionCents:190000}), 190000);
});

test('separa comissão, recebido e saldo', () => {
  const r=saleTotals({
    saleCents:1900000, commissionMode:'fixed', commissionCents:190000,
    payments:[{cents:90000},{cents:25000}],
    installments:[{cents:95000},{cents:95000}]
  });
  assert.equal(r.commissionCents,190000);
  assert.equal(r.paidCents,115000);
  assert.equal(r.remainingCents,75000);
  assert.equal(r.installmentDifferenceCents,0);
});

test('consolida várias vendas', () => {
  const t=dashboardTotals([
    {saleCents:1000000,commissionMode:'percent',commissionPercent:10,payments:[{cents:50000}],items:[{name:'Cozinha'}]},
    {saleCents:2000000,commissionMode:'fixed',commissionCents:150000,payments:[],items:[{name:'Quarto'},{name:'Quarto'}]}
  ]);
  assert.deepEqual(t,{saleCents:3000000,commissionCents:250000,paidCents:50000,remainingCents:200000,itemCount:3});
});

test('normalização não confia em formato externo', () => {
  const s=normalizeStore({sales:[{client:'Cliente', project:'Cozinha antiga', saleCents:1000, payments:'não'}]});
  assert.equal(s.sales.length,1);
  assert.deepEqual(s.sales[0].payments,[]);
  assert.equal(s.sales[0].items.length,1);
  assert.equal(s.sales[0].items[0].name,'Cozinha antiga');
});


test('mantém itens repetidos para contabilizar quantidade real', () => {
  const s=normalizeStore({sales:[{client:'Cliente',items:['Quarto','Quarto','Sala']}]});
  assert.deepEqual(s.sales[0].items.map(x=>x.name),['Quarto','Quarto','Sala']);
});
