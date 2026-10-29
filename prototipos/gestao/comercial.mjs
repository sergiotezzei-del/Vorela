// Vorela: regras de domínio para protótipos com dados inventados.
// NÃO contém autenticação, persistência, API ou cálculo de preço de venda.
export const ETAPAS = Object.freeze([
  'Novo contato', 'Briefing', 'Estudo / estimativa', 'Negociação',
  'Fechado', 'Produção / instalação', 'Concluído',
]);

const normalize = text => String(text ?? '').trim();
const checkId = value => Number.isSafeInteger(value) && value > 0;
const safeText = (value, name, max) => {
  const text = normalize(value);
  if (!text || text.length > max) throw new RangeError(`${name}: informe de 1 a ${max} caracteres.`);
  return text;
};

// Identificadores de demonstração não são números fiscais ou números reais de proposta.
export function numeroDemonstracao(id) {
  if (!checkId(id)) throw new RangeError('Identificador de demonstração inválido.');
  return `VOR-DEMO-${String(id).padStart(4, '0')}`;
}

export function parseValorFicticioEmCentavos(valor) {
  // Dinheiro só como inteiro em centavos: evita 0.1 + 0.2 com floats.
  const value = normalize(valor).replace(',', '.');
  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(value)) {
    throw new RangeError('Valor fictício inválido: use até duas casas decimais.');
  }
  const [reais, centavos = ''] = value.split('.');
  const result = Number(reais) * 100 + Number(centavos.padEnd(2, '0'));
  if (!Number.isSafeInteger(result)) throw new RangeError('Valor fictício muito alto.');
  return result;
}

export function cadastrarCliente(estado, entrada) {
  const nome = safeText(entrada.nome, 'Nome de demonstração', 80);
  const ambiente = safeText(entrada.ambiente, 'Ambiente', 70);
  const origem = safeText(entrada.origem, 'Origem', 70);
  const id = estado.proximoClienteId;
  if (!checkId(id) || estado.clientes.some(cliente => cliente.id === id)) throw new Error('Sequência de clientes inconsistente.');
  const cliente = { id, nome, ambiente, origem };
  return {
    ...estado,
    proximoClienteId: id + 1,
    clientes: [...estado.clientes, cliente],
    eventos: [...estado.eventos, { tipo: 'cliente_criado', clienteId: id }],
  };
}

export function criarOportunidade(estado, entrada) {
  const clienteId = Number(entrada.clienteId);
  if (!checkId(clienteId) || !estado.clientes.some(cliente => cliente.id === clienteId)) {
    throw new RangeError('Oportunidade exige cliente cadastrado.');
  }
  const ambiente = safeText(entrada.ambiente, 'Ambiente', 70);
  const id = estado.proximaOportunidadeId;
  if (!checkId(id) || estado.oportunidades.some(oportunidade => oportunidade.id === id)) {
    throw new Error('Sequência de oportunidades inconsistente.');
  }
  const oportunidade = {
    id, clienteId, ambiente, etapa: 0, revisao: 1,
    estimativaInternaCentavos: null, // Sem preço inventado.
    historico: [{ revisao: 1, tipo: 'criada', etapa: 0 }],
  };
  return {
    ...estado,
    proximaOportunidadeId: id + 1,
    oportunidades: [...estado.oportunidades, oportunidade],
    eventos: [...estado.eventos, { tipo: 'oportunidade_criada', oportunidadeId: id }],
  };
}

export function registrarEstimativaFicticia(estado, oportunidadeId, textoValor) {
  const centavos = parseValorFicticioEmCentavos(textoValor);
  return atualizarOportunidade(estado, oportunidadeId, oportunidade => ({
    ...oportunidade,
    estimativaInternaCentavos: centavos,
    revisao: oportunidade.revisao + 1,
    historico: [...oportunidade.historico, {
      revisao: oportunidade.revisao + 1, tipo: 'estimativa_ficticia', centavos,
    }],
  }), 'estimativa_ficticia_registrada');
}

export function avancarEtapa(estado, oportunidadeId) {
  return atualizarOportunidade(estado, oportunidadeId, oportunidade => {
    if (oportunidade.etapa >= ETAPAS.length - 1) {
      throw new RangeError('Oportunidade já está na etapa final.');
    }
    const etapa = oportunidade.etapa + 1;
    return {
      ...oportunidade,
      etapa,
      revisao: oportunidade.revisao + 1,
      historico: [...oportunidade.historico, {
        revisao: oportunidade.revisao + 1, tipo: 'etapa_alterada', etapa,
      }],
    };
  }, 'etapa_alterada');
}

function atualizarOportunidade(estado, id, transformar, tipoEvento) {
  if (!checkId(id)) throw new RangeError('Identificador de oportunidade inválido.');
  let encontrou = false;
  const oportunidades = estado.oportunidades.map(item => {
    if (item.id !== id) return item;
    encontrou = true;
    return transformar(item);
  });
  if (!encontrou) throw new RangeError('Oportunidade não encontrada.');
  return {
    ...estado,
    oportunidades,
    eventos: [...estado.eventos, { tipo: tipoEvento, oportunidadeId: id }],
  };
}

export function resumoDemonstracao(estado) {
  return {
    clientes: estado.clientes.length,
    oportunidades: estado.oportunidades.length,
    estimativaFicticiaCentavos: estado.oportunidades.reduce(
      (soma, oportunidade) => soma + (oportunidade.estimativaInternaCentavos ?? 0), 0,
    ),
  };
}

export function estadoInicialDemonstracao() {
  return { proximoClienteId: 1, proximaOportunidadeId: 1, clientes: [], oportunidades: [], eventos: [] };
}
