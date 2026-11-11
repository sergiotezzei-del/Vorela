# Estado atual — Vorela Gestão

Atualizado em 29/10/2026.

## Onde paramos na arquitetura

A auditoria de arquitetura foi interrompida **antes de qualquer mudança estrutural em produção**.

Situação confirmada:
- site comercial permanece separado e publicado no Netlify;
- projeto Supabase Vorela existe, mas estava INACTIVE na última verificação;
- ainda falta confirmar o modelo/plano real da conta Netlify antes de decidir a hospedagem definitiva do sistema;
- a hipótese preferida para o futuro é separar o frontend da gestão do site comercial e isolar o backend Vorela, mas essa decisão ainda não foi executada;
- não transferir Supabase, não criar nova organização, não migrar produção e não publicar portal de corretores até concluir a auditoria.

## Nova prioridade imediata

Criar primeiro uma área pessoal de Sérgio para controlar vendas feitas em parceria com Júnior:
- cliente/projeto;
- data e valor da venda;
- comissão combinada;
- divisão prevista da comissão;
- pagamentos de comissão efetivamente recebidos;
- datas dos pagamentos;
- total recebido;
- saldo a receber;
- observações e histórico;
- visão consolidada.

Nesta fase o protótipo deve ser local-first, sem banco e sem dados enviados ao servidor. Dados reais só podem ser digitados se o usuário entender que ficam no navegador e fizer backup/exportação.

## Segunda etapa

Criar uma página separada para vendedores parceiros:
- explicar de forma clara a regra de comissão;
- apresentar quando e como a comissão é paga;
- coletar cadastro do vendedor;
- registrar aceite expresso das condições;
- guardar versão/data do termo aceito;
- só depois conectar esse cadastro ao backend definitivo.

Essa página de parceiros não deve ser confundida com o site comercial para clientes nem com o painel administrativo pessoal.
