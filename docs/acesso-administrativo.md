# Vorela — acesso administrativo

## Situação atual

- Projeto próprio no Supabase: `kbcudgsoyftcibdqsplp` (região São Paulo).
- Tela de login: `https://vorela.netlify.app/sistema/`.
- Autenticação: e-mail e senha pelo Supabase Auth; somente chave publicável no navegador.
- Autorização: `public.vorela_admins` com Row Level Security (RLS). Nenhum usuário vira administrador automaticamente; clientes e visitantes não têm acesso.
- Site público e HTML do painel são arquivos estáticos. O conteúdo confidencial dos módulos futuros **deve ser protegido pelo banco com RLS**, não apenas escondido com JavaScript.
- Os cartões iniciais no painel são somente planejamento; nenhum dado comercial é coletado ou armazenado por eles.

## Ativar a primeira conta — ação do proprietário

1. No painel do **projeto Vorela**, abra **Authentication > Users**: https://supabase.com/dashboard/project/kbcudgsoyftcibdqsplp/auth/users.
2. Use **Add user / Create new user** (o nome exato do botão pode variar). Crie sua conta com um e-mail que você controla e uma senha forte escolhida e digitada **somente no Supabase**, nunca em chats, códigos ou GitHub. Se o painel pedir confirmação de e-mail, conclua-a.
3. Confira a opção de **desabilitar cadastros públicos** nas configurações do Supabase Auth. Mesmo que o cadastro continue ligado por padrão, a tabela com RLS nega acesso administrativo a usuários não autorizados.
4. Informe ao assistente apenas que a conta foi criada e qual é o **e-mail da conta que deve ser autorizada** (não envie a senha). O assistente verificará a existência da conta no projeto Vorela e atribuirá acesso exclusivamente ao ID confirmado, por operação administrativa no banco.
5. Abra `/sistema/`, entre e teste **Sair da conta**. Não compartilhe credenciais.

## Regras de segurança para os próximos módulos

- Nunca inserir `sb_secret_...`, `service_role`, tokens administrativos ou senhas no frontend ou no repositório.
- Toda tabela de clientes, propostas, arquivos ou dados financeiros deve ter RLS e políticas de acesso antes de ser disponibilizada.
- A interface pode ser visualizada no código por qualquer visitante; somente API/dados com políticas adequadas são privados.
- Não reutilizar projeto, banco, usuários ou chaves do APK TEZZEI ou HUB SM.
- Sem serviços pagos ou implantação de recursos que impliquem cobrança sem análise e autorização explícitas.
