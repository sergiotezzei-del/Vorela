# Vorela — gestão: MVP e limites

**Projeto:** somente Vorela Ambientes Planejados. Nunca usar repositórios, bases, dados, credenciais ou recursos do APK TEZZEI / HUB SM.

## Estado de partida (20/09/2026)

- Página comercial publicada na `main`, hospedada no Netlify. Preservar sua operação, especialmente o WhatsApp.
- Projeto Supabase exclusivo da Vorela criado, mas a organização apresentou erro de cota esgotada (`exceed_edge_functions_invocations_quota` e `exceed_egress_quota`); criação de usuário não foi concluída. Não assumir que Auth ou API esteja disponível.
- Login de `/sistema/` já está preparado para Supabase; **não** trocar por senha hardcoded, chave secreta no navegador ou autenticação falsa.
- Desenvolver o MVP numa branch separada. Não incluir o protótipo de gestão no diretório publicado da `main` antes da autenticação e autorização verificadas.

## Etapa 1 — protótipo funcional isolado, com dados totalmente fictícios

- Painel: contadores de contatos, oportunidades/orçamentos, valores de simulação.
- Clientes: cadastrar, consultar e buscar; vínculo com oportunidades.
- Oportunidades / orçamentos: identificador sequencial **apenas simulado**; ambiente, estágio, valor de estimativa interna opcional, revisão e histórico da sessão.
- Pipeline: etapas de primeiro contato até pós-venda. Mudanças registradas durante a sessão de demonstração.
- Interface responsiva, campos identificados, texto simples; nunca afirmar que um cliente real foi atendido ou que um preço é proposta comercial validada.
- Estado somente em memória: atualizar a página apaga alterações. Não usar `localStorage`, cookies, planilhas públicas, APIs externas ou banco para cadastrar dados reais antes da autorização e RLS validadas.

## Etapa 2 — acesso seguro e armazenamento real, quando serviço estiver disponível

1. Revisar cota da organização sem upgrade, cobrança ou desativação de limites de gastos.
2. Validar Auth com usuário criado pelo titular na interface oficial; permissões de administrador definidas no banco, não na interface.
3. Aplicar RLS em cada tabela de negócio e testar acessos como visitante, usuário normal e administrador.
4. Criar migrations versionadas para clientes, oportunidades, revisões e histórico; integrar o protótipo a uma API segura.
5. Fazer testes automatizados e revisão de privacidade/LGPD antes de aceitar informações reais.

## Etapas posteriores, após acordo com a marcenaria e validação comercial

Catálogo real de MDF, ferragens, espessuras e códigos; precificação e impostos; projeto técnico validado/medição; plano de corte com tolerâncias, fita de borda e veio; produção, entregas e assistência; financeiro/indicações; portal do cliente. Nada disso deve calcular medidas, custos ou prazos reais com parâmetros fictícios.

## Critérios para avançar à produção

A página pública não deve oferecer acesso anônimo aos dados internos. Nenhuma rota estática publicada equivale, por si só, a autorização. Toda leitura/gravação de dados comerciais deve exigir sessão válida e política de banco adequada. A marca Vorela é nome de trabalho e fotografias licenciadas não devem ser descritas como projetos executados pela empresa.
