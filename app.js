import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 1) Cole aqui a URL e a chave anon/public do seu projeto Supabase.
const SUPABASE_URL = "https://wialvuqzakhliasetbkc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fjiwJhjCPCm0p9-xjESNLw_A8LkAeeH";
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("COLE_AQUI") && !SUPABASE_ANON_KEY.includes("COLE_AQUI");
const $ = id => document.getElementById(id);
const money = n => (Number(n)||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const today = new Date().toISOString().slice(0,10);
$("tDate").value = today;
let sb, currentUser, transactions=[], clients=[], orders=[];

function msg(text){ $("authMsg").textContent=text; }
function showApp(on){$("loginView").classList.toggle("hidden",on);$("appView").classList.toggle("hidden",!on);}
function switchTab(tab){
  document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));
  $(tab).classList.remove("hidden");
  document.querySelectorAll(".nav button").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));
}
document.querySelectorAll(".nav button").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.goto)));

if(!configured){msg("Configuração pendente: siga o LEIA-ME para conectar seu banco de dados Supabase.");$("loginBtn").disabled=true;$("signupBtn").disabled=true;}
else {
  sb=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  sb.auth.getSession().then(({data})=>{if(data.session) init(data.session.user);});
  sb.auth.onAuthStateChange((_event,session)=>{if(session) init(session.user);else{currentUser=null;showApp(false);}});
}
$("authForm").addEventListener("submit",async e=>{
  e.preventDefault(); if(!sb)return;
  const {error}=await sb.auth.signInWithPassword({email:$("email").value,password:$("password").value});
  msg(error?error.message:"Acesso autorizado.");
});
$("signupBtn").addEventListener("click",async()=>{
  if(!sb)return;
  const {data,error}=await sb.auth.signUp({email:$("email").value,password:$("password").value});
  msg(error?error.message:(data.session?"Conta criada.":"Verifique seu e-mail para confirmar o cadastro."));
});
$("logoutBtn").addEventListener("click",()=>sb?.auth.signOut());

async function init(user){
  currentUser=user;$("userLabel").textContent=user.email||"Conta conectada";showApp(true);await refresh();
}
async function refresh(){
  if(!currentUser)return;
  const [t,c,o]=await Promise.all([
    sb.from("transactions").select("*").order("date",{ascending:false}).limit(500),
    sb.from("clients").select("*").order("name"),
    sb.from("service_orders").select("*, clients(name)").order("created_at",{ascending:false}).limit(500)
  ]);
  if(t.error||c.error||o.error){alert("Erro ao carregar dados. Confira se executou o SQL do LEIA-ME no Supabase.");console.error(t.error,c.error,o.error);return;}
  transactions=t.data||[];clients=c.data||[];orders=o.data||[];render();
}
function render(){
  const month=today.slice(0,7);
  const m=transactions.filter(x=>(x.date||"").startsWith(month)&&x.status==="pago");
  const inc=m.filter(x=>x.type==="entrada").reduce((s,x)=>s+Number(x.amount),0);
  const exp=m.filter(x=>x.type==="saida").reduce((s,x)=>s+Number(x.amount),0);
  const receivable=orders.filter(x=>!["Entregue","Cancelado"].includes(x.status)).reduce((s,x)=>s+Math.max(0,Number(x.price)-Number(x.paid)),0);
  $("mIncome").textContent=money(inc);$("mExpense").textContent=money(exp);$("mBalance").textContent=money(inc-exp);$("mReceivable").textContent=money(receivable);
  $("recentRows").innerHTML=transactions.slice(0,8).map(x=>`<tr><td>${x.date}</td><td>${esc(x.description)}</td><td>${esc(x.category)}</td><td>${x.type==="entrada"?money(x.amount):"—"}</td><td>${x.type==="saida"?money(x.amount):"—"}</td></tr>`).join("");
  $("recentEmpty").classList.toggle("hidden",transactions.length>0);
  $("transactionRows").innerHTML=transactions.map(x=>`<tr><td>${x.date}</td><td>${esc(x.description)}</td><td>${esc(x.category)}</td><td>${x.type}</td><td>${money(x.amount)}</td><td><span class="tag">${x.status}</span></td></tr>`).join("");
  $("transactionEmpty").classList.toggle("hidden",transactions.length>0);
  $("clientRows").innerHTML=clients.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.phone||"—")}</td><td>${esc(x.notes||"—")}</td></tr>`).join("");
  $("clientEmpty").classList.toggle("hidden",clients.length>0);
  $("oClient").innerHTML='<option value="">Selecione um cliente</option>'+clients.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("");
  $("orderRows").innerHTML=orders.map(x=>`<tr><td>${x.order_number}</td><td>${esc(x.clients?.name||"")}</td><td>${esc(x.device)}</td><td>${esc(x.service||x.problem)}</td><td>${money(x.price)}</td><td>${money(x.paid)}</td><td>${money(Math.max(0,x.price-x.paid))}</td><td><span class="tag">${esc(x.status)}</span></td></tr>`).join("");
  $("orderEmpty").classList.toggle("hidden",orders.length>0);
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("transactionForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const row={user_id:currentUser.id,date:$("tDate").value,type:$("tType").value,description:$("tDescription").value.trim(),category:$("tCategory").value,amount:Number($("tAmount").value),payment_method:$("tPayment").value,status:$("tStatus").value};
  const {error}=await sb.from("transactions").insert(row);if(error){alert(error.message);return;}
  e.target.reset();$("tDate").value=today;await refresh();
});
$("clientForm").addEventListener("submit",async e=>{
  e.preventDefault();const row={user_id:currentUser.id,name:$("cName").value.trim(),phone:$("cPhone").value.trim(),notes:$("cNotes").value.trim()};
  const {error}=await sb.from("clients").insert(row);if(error){alert(error.message);return;}e.target.reset();await refresh();
});
$("orderForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const price=Number($("oPrice").value||0),paid=Number($("oPaid").value||0);
  if(paid>price){alert("O valor recebido não pode ser maior que o valor combinado.");return;}
  const row={user_id:currentUser.id,client_id:$("oClient").value,device:$("oDevice").value.trim(),problem:$("oProblem").value.trim(),service:$("oService").value.trim(),price,paid,status:$("oStatus").value};
  const {error}=await sb.from("service_orders").insert(row);if(error){alert(error.message);return;}e.target.reset();$("oPrice").value=0;$("oPaid").value=0;await refresh();
});
