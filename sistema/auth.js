import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

// Chave publicável do projeto exclusivo da Vorela; não é uma chave secreta.
const supabase = createClient(
  'https://kbcudgsoyftcibdqsplp.supabase.co',
  'sb_publishable_fTXjdoDnLN5Oof0QnePtVA_yGC5NC_Z',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'vorela-auth',
    },
  },
);

const $ = (id) => document.getElementById(id);
const form = $('login-form');
const submit = $('login-submit');
const status = $('login-status');
const loading = $('loading');
const loginSection = $('login-section');
const dashboard = $('dashboard');
const userEmail = $('user-email');
const logoutButton = $('logout-button');

function setMessage(message, isError = false) {
  status.textContent = message;
  status.dataset.error = String(isError);
}

function displayLogin(message = '') {
  loading.hidden = true;
  dashboard.hidden = true;
  loginSection.hidden = false;
  submit.disabled = false;
  setMessage(message);
}

function displayDashboard(email) {
  loading.hidden = true;
  loginSection.hidden = true;
  dashboard.hidden = false;
  userEmail.textContent = email || 'Usuário autorizado';
  form.reset();
  setMessage('');
}

async function isAuthorized(user) {
  if (!user?.id) return false;
  // Essa consulta é protegida por RLS no Supabase; a interface não decide a permissão.
  const { data, error } = await supabase
    .from('vorela_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id === user.id;
}

async function checkSession() {
  try {
    // getUser confirma a identidade com o servidor, em vez de confiar apenas no armazenamento local.
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      displayLogin();
      return;
    }
    if (!(await isAuthorized(user))) {
      await supabase.auth.signOut();
      displayLogin('Esta conta não está autorizada a acessar o sistema da Vorela.');
      return;
    }
    displayDashboard(user.email);
  } catch {
    displayLogin('Não foi possível verificar o acesso. Confira a conexão e tente novamente.');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  setMessage('Verificando acesso…');
  const email = $('email').value.trim();
  const password = $('password').value;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setMessage('Não foi possível entrar. Confira seus dados e tente novamente.', true);
      return;
    }
    if (!(await isAuthorized(data.user))) {
      await supabase.auth.signOut();
      setMessage('Esta conta não está autorizada a acessar o sistema da Vorela.', true);
      return;
    }
    displayDashboard(data.user.email);
  } catch {
    setMessage('Não foi possível verificar o acesso. Tente novamente em instantes.', true);
  } finally {
    $('password').value = '';
    submit.disabled = false;
  }
});

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  try {
    await supabase.auth.signOut();
    displayLogin('Você saiu do sistema.');
  } catch {
    displayLogin('Sessão encerrada nesta tela.');
  } finally {
    logoutButton.disabled = false;
  }
});

await checkSession();
