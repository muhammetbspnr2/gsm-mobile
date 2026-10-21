(() => {
 const $=id=>document.getElementById(id),hide=(id,v)=>{const e=$(id);if(e)e.classList.toggle("hidden",v)},msg=(id,t,type)=>{const e=$(id);if(e){e.textContent=t;e.className="message"+(type?" "+type:"")}},esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const cfg=window.GSM_FIREBASE_CONFIG||{};
 if(!cfg.apiKey||!cfg.projectId){msg("tlLoginMessage","Firebase ayarları eksik.","error");return}
 if(!firebase.apps.length)firebase.initializeApp(cfg);
 const auth=firebase.auth(),db=firebase.database();auth.languageCode="tr";
 let assignedTeams={},teamRecords={},plans={},activeTeamId=null,roleRecord=null,authReady=false;
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
 $("tlPlanDate").value=today();$("tlFilterDate").value=today();
 function setStatus(text,connected=false){const e=$("tlStatus");e.textContent=text;e.classList.toggle("is-connected",connected);e.classList.toggle("is-disconnected",!connected)}
 function showLogin(text=""){hide("tlLoginView",false);hide("tlAppView",true);if(text)msg("tlLoginMessage",text,"error")}
 $("tlLoginForm").addEventListener("submit",async e=>{e.preventDefault();try{await auth.signInWithEmailAndPassword($("tlEmail").value.trim(),$("tlPassword").value)}catch(err){msg("tlLoginMessage","Giriş başarısız: "+(err.message||"Bilinmeyen hata"),"error")}});
 $("tlLogout").addEventListener("click",()=>auth.signOut());
 $("tlFilterDate").addEventListener("change",renderPlans);$("tlFilterStatus").addEventListener("change",renderPlans);
 function guard(text){hide("tlWorkspace",true);hide("tlGuard",false);$("tlGuard").textContent=text;setStatus("Yetki doğrulanamadı",false)}
 async function startUser(user){
   hide("tlLoginView",true);hide("tlAppView",false);$("tlUserLabel").textContent=user.email||"Oturum açıldı";setStatus("Ekip şefi yetkisi doğrulanıyor…");
   try{
     const snap=await db.ref("teamLeaders/"+user.uid).once("value");roleRecord=snap.val();
     if(!roleRecord||roleRecord.active===false){guard("Bu hesap için ekip şefi yetkisi tanımlı değil. Firma yöneticinizden yetki ataması isteyin.");return}
     const ids=roleRecord.teamIds&&typeof roleRecord.teamIds==="object"?Object.keys(roleRecord.teamIds).filter(id=>roleRecord.teamIds[id]===true):Object.keys(roleRecord).filter(id=>id!=="active"&&id!=="companyId"&&roleRecord[id]===true);
     if(!ids.length){guard("Hesabınız ekip şefi olarak işaretlenmiş ancak atanmış ekip bulunamadı. Firma yöneticiniz ekip ataması yapmalı.");return}
     assignedTeams=Object.fromEntries(ids.map(id=>[id,true]));
     const teamSnaps=await Promise.all(ids.map(id=>db.ref("teams/"+id).once("value").then(s=>({id,data:s.val()}))));
     teamRecords=Object.fromEntries(teamSnaps.filter(x=>x.data&&x.data.active!==false).map(x=>[x.id,x.data]));
     const allowed=Object.keys(teamRecords);
     if(!allowed.length){guard("Atanmış ekip kayıtları bulunamadı veya okunamadı. Yetkiler ve Firebase güvenlik kuralları kontrol edilmelidir.");return}
     hide("tlGuard",true);hide("tlWorkspace",false);renderTeams();activeTeamId=allowed[0];selectTeam(activeTeamId);setStatus("Ekip şefi yetkisi doğrulandı",true);
   }catch(err){guard("Ekip şefi yetkisi doğrulanamadı. Firebase güvenlik kuralları henüz bu panelin ekip/rol yollarına erişim vermiyor olabilir. Canlı kurallar değiştirilmeden panel erişimi açılmaz. Ayrıntı: "+(err.message||"izin hatası"))}
 }
 function renderTeams(){
   const root=$("tlTeamList"),ids=Object.keys(teamRecords);
   root.innerHTML=ids.map(id=>'<button type="button" class="tl-team-button'+(id===activeTeamId?' active':'')+'" data-team-id="'+esc(id)+'">'+esc(teamRecords[id].name||teamRecords[id].teamName||"Ekip "+id)+'</button>').join("");
   root.querySelectorAll("[data-team-id]").forEach(b=>b.addEventListener("click",()=>selectTeam(b.dataset.teamId)));
 }
 function selectTeam(id){
   if(!Object.prototype.hasOwnProperty.call(assignedTeams,id)||!teamRecords[id])return;
   activeTeamId=id;renderTeams();$("tlStatTeam").textContent=teamRecords[id].name||teamRecords[id].teamName||"Ekip";
   const ref=db.ref("dailyPlans/"+id);ref.off();ref.on("value",s=>{plans=s.val()||{};renderPlans()},err=>msg("tlMessage","Görevler okunamadı: "+err.message,"error"));
 }
 function statusLabel(s){return s==="completed"?"Tamamlandı":s==="in-progress"?"Devam ediyor":"Planlandı"}
 function renderPlans(){
   const all=Object.entries(plans).map(([id,p])=>({...p,id})).sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(Number(a.createdAt)||0)-(Number(b.createdAt)||0));
   const date=$("tlFilterDate").value,status=$("tlFilterStatus").value,filtered=all.filter(p=>(!date||p.date===date)&&(!status||p.status===status));
   $("tlStatToday").textContent=String(all.filter(p=>p.date===today()).length);$("tlStatDone").textContent=String(all.filter(p=>p.status==="completed").length);
   const root=$("tlPlanList");
   if(!filtered.length){root.innerHTML='<div class="tl-empty">Bu filtrelerle eşleşen görev bulunamadı.</div>';return}
   root.innerHTML=filtered.map(p=>'<article class="tl-plan"><div class="tl-plan-top"><div><h3>'+esc(p.title||"İsimsiz görev")+'</h3><div class="tl-plan-meta"><span>📅 '+esc(p.date||"Tarih yok")+'</span><span>Öncelik: '+esc(p.priority||"normal")+'</span>'+(p.assignedTo?'<span>Personel UID: '+esc(p.assignedTo)+'</span>':'')+'</div></div><span class="tl-status '+esc(p.status||"planned")+'">'+statusLabel(p.status)+'</span></div><p>'+esc(p.description||"Açıklama eklenmedi.")+'</p><div class="tl-filter-row"><label class="muted">Durum <select data-plan-status="'+esc(p.id)+'"><option value="planned" '+((p.status||"planned")==="planned"?"selected":"")+'>Planlandı</option><option value="in-progress" '+(p.status==="in-progress"?"selected":"")+'>Devam ediyor</option><option value="completed" '+(p.status==="completed"?"selected":"")+'>Tamamlandı</option></select></label><button type="button" class="btn secondary" data-save-status="'+esc(p.id)+'">Durumu kaydet</button></div></article>').join("");
   root.querySelectorAll("[data-save-status]").forEach(b=>b.addEventListener("click",async()=>{const id=b.dataset.saveStatus,sel=root.querySelector('[data-plan-status="'+CSS.escape(id)+'"]');if(!activeTeamId||!plans[id]||!assignedTeams[activeTeamId])return;try{await db.ref("dailyPlans/"+activeTeamId+"/"+id).update({status:sel.value,updatedAt:Date.now(),updatedBy:auth.currentUser.uid});msg("tlMessage","Görev durumu güncellendi.","success")}catch(err){msg("tlMessage","Durum kaydedilemedi: "+err.message,"error")}}));
 }
 $("tlPlanForm").addEventListener("submit",async e=>{
   e.preventDefault();const user=auth.currentUser;if(!user||!activeTeamId||!assignedTeams[activeTeamId]||!teamRecords[activeTeamId]){msg("tlMessage","Görev oluşturmak için yetkili bir ekip seçin.","error");return}
   const title=$("tlPlanTitle").value.trim(),date=$("tlPlanDate").value,description=$("tlPlanDescription").value.trim(),priority=$("tlPlanPriority").value,assignedTo=$("tlAssignedTo").value.trim();
   if(!title||!date){msg("tlMessage","Görev başlığı ve tarih zorunludur.","error");return}
   const btn=$("tlCreatePlan");btn.disabled=true;
   try{const ref=db.ref("dailyPlans/"+activeTeamId).push();await ref.set({id:ref.key,title,date,description,priority,status:"planned",teamId:activeTeamId,companyId:teamRecords[activeTeamId].companyId||roleRecord.companyId||"",assignedTo:assignedTo||null,createdBy:user.uid,createdAt:Date.now(),updatedAt:Date.now()});$("tlPlanTitle").value="";$("tlPlanDescription").value="";$("tlAssignedTo").value="";msg("tlMessage","Görev kaydedildi.","success")}catch(err){msg("tlMessage","Görev kaydedilemedi. Güvenlik kuralları ekip şefi ve atanmış ekip kapsamını desteklemiyor olabilir: "+err.message,"error")}finally{btn.disabled=false}
 });
 auth.onAuthStateChanged(user=>{if(!user){showLogin();return}if(!authReady){authReady=true;startUser(user)}else startUser(user)});
})();