import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ETAPAS, numeroDemonstracao, parseValorFicticioEmCentavos,
  cadastrarCliente, criarOportunidade, registrarEstimativaFicticia,
  avancarEtapa, resumoDemonstracao, estadoInicialDemonstracao,
} from './comercial.mjs';

const clienteTeste = { nome: 'Cliente fictício', ambiente: 'Cozinha', origem: 'Indicação simulada' };
const iniciarComOportunidade = () => {
  const comCliente = cadastrarCliente(estadoInicialDemonstracao(), clienteTeste);
  return criarOportunidade(comCliente, { clienteId: 1, ambiente: 'Cozinha' });
};

test('estado inicial não contém contatos reais ou valores', () => {
  assert.deepEqual(resumoDemonstracao(estadoInicialDemonstracao()), {
    clientes: 0, oportunidades: 0, estimativaFicticiaCentavos: 0,
  });
});

test('cliente e oportunidade geram identificadores determinísticos e preservam estado anterior', () => {
  const original = estadoInicialDemonstracao();
  const cliente = cadastrarCliente(original, clienteTeste);
  const oportunidade = criarOportunidade(cliente, { clienteId: 1, ambiente: 'Cozinha' });
  assert.equal(original.clientes.length, 0);
  assert.equal(cliente.oportunidades.length, 0);
  assert.equal(numeroDemonstracao(oportunidade.oportunidades[0].id), 'VOR-DEMO-0001');
  assert.equal(oportunidade.oportunidades[0].revisao, 1);
});

test('impede cadastro em branco e oportunidade sem cliente', () => {
  assert.throws(() => cadastrarCliente(estadoInicialDemonstracao(), { ...clienteTeste, nome: ' ' }), /Nome/);
  assert.throws(() => criarOportunidade(estadoInicialDemonstracao(), { clienteId: 99, ambiente: 'Cozinha' }), /cliente/);
});

test('valor fictício aceita vírgula, preserva centavos e rejeita ambiguidades', () => {
  assert.equal(parseValorFicticioEmCentavos('1234,56'), 123456);
  assert.equal(parseValorFicticioEmCentavos('0.01'), 1);
  assert.throws(() => parseValorFicticioEmCentavos('1.234,56'), /inválido/);
  assert.throws(() => parseValorFicticioEmCentavos('-4'), /inválido/);
  assert.throws(() => parseValorFicticioEmCentavos('5.999'), /inválido/);
  assert.throws(() => parseValorFicticioEmCentavos(''), /inválido/);
});

test('estimativa fictícia cria nova revisão e conserva histórico', () => {
  const estado = iniciarComOportunidade();
  const atualizado = registrarEstimativaFicticia(estado, 1, '12,30');
  assert.equal(estado.oportunidades[0].estimativaInternaCentavos, null);
  assert.equal(atualizado.oportunidades[0].revisao, 2);
  assert.equal(atualizado.oportunidades[0].historico.length, 2);
  assert.equal(resumoDemonstracao(atualizado).estimativaFicticiaCentavos, 1230);
});

test('etapas avançam uma a uma sem ultrapassar a última', () => {
  let estado = iniciarComOportunidade();
  for (let i = 1; i < ETAPAS.length; i++) {
    estado = avancarEtapa(estado, 1);
    assert.equal(estado.oportunidades[0].etapa, i);
  }
  assert.throws(() => avancarEtapa(estado, 1), /etapa final/);
  assert.equal(estado.oportunidades[0].historico.length, ETAPAS.length);
});

test('não altera oportunidade inexistente nem permite IDs inválidos', () => {
  const estado = iniciarComOportunidade();
  assert.throws(() => registrarEstimativaFicticia(estado, 5, '1,00'), /não encontrada/);
  assert.throws(() => avancarEtapa(estado, 0), /inválido/);
  assert.throws(() => numeroDemonstracao(-1), /inválido/);
});
