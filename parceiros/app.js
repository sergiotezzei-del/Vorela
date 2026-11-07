import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://nchumlrlanviwrwndizd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_roo0azsHVqe6cDtX3yrQUg__CTFmFoN';
const TERMS_VERSION = '2026-11-v1';
const MANAGEMENT_URL = 'https://vorela-gestao.sergiotezzei.workers.dev/';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const form = document.querySelector('#partner-form');
const statusBox = document.querySelector('#form-status');
const submitButton = document.querySelector('#submit-button');
const paymentMethod = document.querySelector('#payment-method');
const pixFields = document.querySelector('#pix-fields');
const bankFields = document.querySelector('#bank-fields');

function digits(value){ return String(value || '').replace(/\D/g,''); }

function validCPF(value){
  const cpf = digits(value);
  if(cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (base, factor) => {
    let sum = 0;
    for(const n of base) sum += Number(n) * factor--;
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(cpf.slice(0,9),10) === Number(cpf[9]) &&
    calc(cpf.slice(0,10),11) === Number(cpf[10]);
}

function showStatus(message,type='ok'){
  statusBox.hidden = false;
  statusBox.className = 'status ' + type;
  statusBox.innerHTML = message;
}

function togglePayment(){
  const pix = paymentMethod.value === 'pix';
  pixFields.hidden = !pix;
  bankFields.hidden = pix;
  form.pixKey.required = pix;
  form.pixKeyType.required = pix;
  form.bankName.required = !pix;
  form.bankAgency.required = !pix;
  form.bankAccount.required = !pix;
  form.bankAccountType.required = !pix;
}
paymentMethod.addEventListener('change',togglePayment);
togglePayment();

form.cpf.addEventListener('input', e => {
  const v = digits(e.target.value).slice(0,11);
  e.target.value = v.replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  statusBox.hidden = true;

  const fullName = form.fullName.value.trim();
  const cpf = digits(form.cpf.value);
  const phone = form.phone.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;
  const password2 = form.password2.value;

  if(!validCPF(cpf)){
    showStatus('Confira o CPF informado.','error');
    return;
  }
  if(password !== password2){
    showStatus('As duas senhas precisam ser iguais.','error');
    return;
  }
  if(password.length < 8){
    showStatus('A senha precisa ter pelo menos 8 caracteres.','error');
    return;
  }
  if(!form.termsAccepted.checked || !form.privacyAccepted.checked){
    showStatus('Para continuar, leia e aceite as regras e o uso dos dados.','error');
    return;
  }

  const token = crypto.randomUUID();
  const method = paymentMethod.value;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';

  try{
    const intake = {
      token,
      full_name: fullName,
      cpf,
      phone,
      payment_method: method,
      pix_key_type: method === 'pix' ? form.pixKeyType.value : null,
      pix_key: method === 'pix' ? form.pixKey.value.trim() : null,
      bank_name: method === 'bank' ? form.bankName.value.trim() : null,
      bank_agency: method === 'bank' ? form.bankAgency.value.trim() : null,
      bank_account: method === 'bank' ? form.bankAccount.value.trim() : null,
      bank_account_type: method === 'bank' ? form.bankAccountType.value : null,
      terms_version: TERMS_VERSION,
      terms_accepted: true,
      privacy_accepted: true,
      user_agent: navigator.userAgent.slice(0,500)
    };

    const { error: intakeError } = await supabase.from('partner_signup_intakes').insert(intake);
    if(intakeError) throw intakeError;

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          registration_source: 'vorela_partner_page',
          intake_token: token
        }
      }
    });
    if(signupError) throw signupError;

    form.reset();
    togglePayment();

    if(data.session){
      showStatus('Cadastro enviado com sucesso. Agora ele fica aguardando aprovação da Vorela. Depois de aprovado, você poderá entrar no sistema para cadastrar e acompanhar suas vendas. <br><a class="login-link" href="'+MANAGEMENT_URL+'">Abrir Vorela Gestão →</a>','ok');
    }else{
      showStatus('Cadastro enviado com sucesso. Confira seu e-mail para confirmar o acesso. Depois, seu cadastro ficará aguardando aprovação da Vorela. <br><a class="login-link" href="'+MANAGEMENT_URL+'">Abrir Vorela Gestão →</a>','ok');
    }
  }catch(error){
    console.error(error);
    const msg = String(error?.message || '');
    if(/already|registered|exists/i.test(msg)){
      showStatus('Este e-mail já possui cadastro. Se você já se cadastrou, use o acesso da Vorela Gestão.','error');
    }else if(/password/i.test(msg)){
      showStatus('Não foi possível usar essa senha. Tente uma senha maior e mais forte.','error');
    }else{
      showStatus('Não foi possível concluir o cadastro agora. Confira os dados e tente novamente.','error');
    }
  }finally{
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar meu cadastro';
  }
});
