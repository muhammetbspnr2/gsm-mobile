(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let parsedRows = [], sites = {};
  const message = (text, kind="") => { const el=$("siteImportMessage"); if(!el)return; el.textContent=text; el.className="message"+(kind?" "+kind:""); el.classList.remove("hidden"); };
  const hideMessage = () => $("siteImportMessage")?.classList.add("hidden");
  const normalize = s => String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
  const getField = (obj, names) => { const keys=Object.keys(obj||{}); const key=keys.find(k=>names.includes(normalize(k))); return key ? String(obj[key]??"").trim() : ""; };
  function parseCsv(text){
    const first=(text.split(/\r?\n/)[0]||"");
    const delimiter=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?";":",";
    const rows=[];let row=[],cell="",quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i++}
      else if(c==='"'){quoted=!quoted}
      else if(c===delimiter&&!quoted){row.push(cell);cell=""}
      else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cell);if(row.some(v=>String(v).trim()))rows.push(row);row=[];cell=""}
      else cell+=c;
    }
    row.push(cell);if(row.some(v=>String(v).trim()))rows.push(row);
    if(rows.length<2)throw new Error("CSV dosyasında başlık ve en az bir kayıt bulunamadı.");
    const headers=rows.shift().map(x=>x.replace(/^\uFEFF/,"").trim());
    const normalized=headers.map(normalize);
    const coordIndex=normalized.findIndex(k=>["koordinat","koordinatlar","coordinate","coordinates","konum"].includes(k));
    const idIndex=normalized.findIndex(k=>["sahaid","siteid","id","sitecode","sahakodu"].includes(k));
    const urlIndex=normalized.findIndex(k=>["url","mapsurl","mapslink","mapsadreslinki","mapsadres","mapsaddresslink","googlemapsurl","googlemapslink","haritalink","haritalinki"].includes(k));
    const coordinateIdUrl=coordIndex===0&&idIndex===1&&urlIndex===2;
    return rows.map(cols=>{
      let obj=Object.fromEntries(headers.map((h,i)=>[h,cols[i]||""]));
      let coordinate="",id="",mapsUrl="";
      if(coordinateIdUrl){
        // Gemini/Sheets CSV may leave the coordinate pair and URL commas unquoted.
        if(cols.length>=4&&isCoordinateNumber(cols[0])&&isCoordinateNumber(cols[1])&&extractId(cols[2])){
          coordinate=String(cols[0]).trim()+","+String(cols[1]).trim();
          id=String(cols[2]||"").trim();
          mapsUrl=cols.slice(3).join(",");
        }else{
          coordinate=String(cols[coordIndex]||"").trim();
          id=String(cols[idIndex]||"").trim();
          mapsUrl=cols.slice(urlIndex).join(delimiter===";"?";":",");
        }
      }else{
        coordinate=coordIndex>=0?String(cols[coordIndex]||"").trim():"";
        id=idIndex>=0?String(cols[idIndex]||"").trim():"";
        mapsUrl=urlIndex>=0?String(cols[urlIndex]||"").trim():"";
        if(!mapsUrl)mapsUrl=getField(obj,["mapsurl","mapslink","googlemapsurl","url"]);
      }
      const parsed=parseCoordinates(coordinate);
      const address=getField(obj,["adres","address","formattedaddress","konumadresi","location"]);
      const latField=getField(obj,["enlem","latitude","lat"]),lngField=getField(obj,["boylam","longitude","lon","lng"]);
      const name=getField(obj,["name","ad","sahaadi","sitename","title"]);
      const lat=parsed?.lat??num(latField),lng=parsed?.lng??num(lngField);
      const coordinateAddress=lat!==null&&lng!==null?"Koordinat: "+lat+", "+lng:"";
      return {siteId:extractId(id||getField(obj,["sahaid","siteid","id","sitecode","sahakodu"])||name),siteNo:"",address:address||name||mapsUrl||coordinateAddress,lat,lng,mapsUrl,province:getField(obj,["il","province","state"]),district:getField(obj,["ilce","district","city"]),sourceName:name};
    });
  }
  function isCoordinateNumber(v){if(String(v??"").trim()==="")return false;const n=Number(String(v).trim().replace(",", "."));return Number.isFinite(n)&&Math.abs(n)<=180}
  function parseCoordinates(value){
    const s=String(value||"").trim();
    if(!s)return null;
    const dms=[...s.matchAll(/(\d{1,3})\s*°\s*(\d{1,2})\s*['′]\s*([\d.]+)\s*["″]?\s*([NSEW])/gi)];
    if(dms.length>=2){
      const decimal=m=>{const v=Number(m[1])+Number(m[2])/60+Number(m[3])/3600;return /[SW]/i.test(m[4])?-v:v};
      const parts=dms.map(decimal),latPart=dms.findIndex(m=>/[NS]/i.test(m[4])),lngPart=dms.findIndex(m=>/[EW]/i.test(m[4]));
      const lat=parts[latPart],lng=parts[lngPart];
      if(Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180)return {lat,lng};
    }
    const m=s.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
    if(m){const lat=Number(m[1]),lng=Number(m[2]);if(Math.abs(lat)<=90&&Math.abs(lng)<=180)return {lat,lng}}
    return null;
  }
  function num(v){if(v==="")return null;const n=Number(String(v).replace(",","."));return Number.isFinite(n)&&Math.abs(n)<=180?n:null}
  function extractId(s){const value=String(s||"").toUpperCase();const exact=value.trim().match(/^[A-Z0-9]{5}$/);if(exact)return exact[0];const m=value.match(/(?:^|[^A-Z0-9])([A-Z0-9]{5})(?:$|[^A-Z0-9])/);return m?m[1]:""}
  function stripHtml(s){const d=new DOMParser().parseFromString(String(s||""),"text/html");return (d.body.textContent||"").trim()}
  function parseKml(text){
    const xml=new DOMParser().parseFromString(text,"application/xml");
    if(xml.querySelector("parsererror"))throw new Error("KML/XML dosyası okunamadı.");
    return [...xml.getElementsByTagNameNS("*","Placemark")].map(p=>{
      const get=tag=>p.getElementsByTagNameNS("*",tag)[0]?.textContent?.trim()||"";
      const name=get("name"), desc=stripHtml(get("description")), address=get("address")||desc;
      const coords=get("coordinates").split(/[\s,]+/).map(Number);
      const lng=Number.isFinite(coords[0])?coords[0]:null, lat=Number.isFinite(coords[1])?coords[1]:null;
      const ext={};[...p.getElementsByTagNameNS("*","Data")].forEach(d=>{const k=d.getAttribute("name");if(k)ext[k]=d.getElementsByTagNameNS("*","value")[0]?.textContent||""});
      [...p.getElementsByTagNameNS("*","SimpleData")].forEach(d=>{const k=d.getAttribute("name");if(k)ext[k]=d.textContent||""});
      const joined=[name,...Object.values(ext)].join(" ");
      const addressFromFields=getField(ext,["address","adres","formattedaddress","location"]);
      const idFromFields=getField(ext,["siteid","sahaid","id","sitecode"]);
      return {siteId:extractId(idFromFields||joined),siteNo:"",address:addressFromFields||address||name,lat,lng,province:getField(ext,["province","il"]),district:getField(ext,["district","ilce"]),sourceName:name};
    }).filter(x=>x.siteId||x.address||x.lat!==null);
  }
  async function parseFile(file){
    const ext=(file.name.split(".").pop()||"").toLowerCase();
    if(ext==="csv"||file.type==="text/csv")return parseCsv(await file.text());
    if(ext==="kml")return parseKml(await file.text());
    if(ext==="kmz"){
      if(!window.JSZip)throw new Error("KMZ okuyucusu yüklenemedi. İnternet bağlantısını kontrol edin veya KML dosyasını seçin.");
      const zip=await JSZip.loadAsync(file);const kmlName=Object.keys(zip.files).find(n=>n.toLowerCase().endsWith(".kml")&&!zip.files[n].dir);
      if(!kmlName)throw new Error("KMZ içinde KML dosyası bulunamadı.");
      return parseKml(await zip.files[kmlName].async("text"));
    }
    throw new Error("Desteklenmeyen dosya türü. KML, KMZ veya CSV seçin.");
  }
  function valid(row){return /^[A-Z0-9]{5}$/.test(row.siteId)&&row.address.trim().length>0}
  function renderPreview(){
    const host=$("siteImportPreview");if(!host)return;
    if(!parsedRows.length){host.innerHTML="";$("siteImportCommitBtn").disabled=true;return}
    const existingIds=new Set(Object.values(sites).map(s=>String(s.siteId||s.siteCode||"").trim().toUpperCase()).filter(Boolean));
    const existingNos=new Set(Object.values(sites).map(s=>String(s.siteNo||"").trim()).filter(Boolean));
    const seenIds=new Set(),seenNos=new Set();
    const rowChecks=parsedRows.map(r=>{
      const id=String(r.siteId||"").trim().toUpperCase(),no=String(r.siteNo||"").trim();
      const duplicateId=!!id&&(existingIds.has(id)||seenIds.has(id));
      const duplicateNo=!!no&&(existingNos.has(no)||seenNos.has(no));
      if(id)seenIds.add(id);if(no)seenNos.add(no);
      const error=!/^[A-Z0-9]{5}$/.test(id)?"Saha ID tam 5 harf/rakam olmalı":!String(r.address||"").trim()?"Adres eksik":duplicateId?"Saha ID kayıtlı veya dosyada tekrarlı":no&&!/^\d+$/.test(no)?"Saha No yalnızca rakam olmalı":duplicateNo?"Saha No kayıtlı veya dosyada tekrarlı":"";
      return {ok:!error,error};
    });
    host.innerHTML='<div class="table-wrap"><table><thead><tr><th>#</th><th>Saha ID</th><th>Saha No (isteğe bağlı)</th><th>Adres</th><th>Enlem</th><th>Boylam</th><th>Kontrol</th></tr></thead><tbody>'+parsedRows.map((r,i)=>{
      const check=rowChecks[i],ok=check.ok;
      return '<tr data-import-row="'+i+'" class="'+(ok?"import-valid":"import-invalid")+'"><td>'+(i+1)+'</td><td><input data-field="siteId" data-index="'+i+'" maxlength="5" value="'+esc(r.siteId)+'" aria-label="Saha ID '+(i+1)+'"></td><td><input data-field="siteNo" data-index="'+i+'" inputmode="numeric" value="'+esc(r.siteNo)+'" placeholder="Sonra eklenebilir" aria-label="Saha No '+(i+1)+'"></td><td><input data-field="address" data-index="'+i+'" maxlength="500" value="'+esc(r.address)+'" aria-label="Adres '+(i+1)+'"></td><td>'+esc(r.lat??"—")+'</td><td>'+esc(r.lng??"—")+'</td><td class="import-status">'+(ok?"Aktarıma hazır":esc(check.error))+'</td></tr>';
    }).join("")+'</tbody></table></div><p class="muted">Toplam '+parsedRows.length+' kayıt. Saha ID 5 harf/rakamdan oluşmalı ve benzersiz olmalıdır. Dolu Saha No alanları yalnızca rakamlardan oluşmalı ve benzersiz olmalıdır. Saha No boş bırakılabilir.</p>';
    host.querySelectorAll("input[data-field]").forEach(input=>input.addEventListener("input",()=>{
      const i=Number(input.dataset.index),field=input.dataset.field;
      parsedRows[i][field]=field==="siteId"?input.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5):field==="siteNo"?input.value.replace(/[^0-9]/g,""):input.value;
      const pos=input.selectionStart;renderPreview();const next=host.querySelector('input[data-field="'+field+'"][data-index="'+i+'"]');if(next){next.focus();try{next.setSelectionRange(pos,pos)}catch{}}
    }));
    $("siteImportCommitBtn").disabled=!rowChecks.some(check=>check.ok);
  }
  function renderExisting(){
    const body=$("siteImportExistingRows");if(!body)return;
    const rows=Object.entries(sites).map(([key,s])=>({...s,id:s.id||key})).sort((a,b)=>String(a.siteId||"").localeCompare(String(b.siteId||"")));
    body.innerHTML=rows.map(s=>'<tr><td><b>'+esc(s.siteId||s.siteCode||"—")+'</b></td><td><input data-site-no="'+esc(s.id)+'" inputmode="numeric" maxlength="40" value="'+esc(s.siteNo||"")+'" placeholder="Saha No ekle" aria-label="Saha No '+esc(s.siteId||"")+'"></td><td>'+esc(s.address||"—")+'</td><td><button type="button" class="btn secondary" data-save-site-no="'+esc(s.id)+'">Kaydet</button></td></tr>').join("")||'<tr><td colspan="4">Henüz saha kaydı yok.</td></tr>';
    body.querySelectorAll("[data-save-site-no]").forEach(btn=>btn.addEventListener("click",async()=>{
      const id=btn.dataset.saveSiteNo,input=body.querySelector('[data-site-no="'+CSS.escape(id)+'"]'),value=(input?.value||"").trim();
      if(value&&!/^\d+$/.test(value)){message("Saha No yalnızca rakamlardan oluşmalıdır.","error");return}
      if(value&&rows.some(s=>s.id!==id&&String(s.siteNo||"")===value)){message("Bu Saha No başka bir kayıtta kullanılıyor.","error");return}
      try{const user=firebase.auth().currentUser;if(!user)throw new Error("Yönetici oturumu bulunamadı.");const a=await firebase.database().ref("admins/"+user.uid).once("value");if(a.val()!==true)throw new Error("Yönetici yetkisi doğrulanamadı.");await firebase.database().ref("sites/"+id).update({siteNo:value});await firebase.database().ref("auditLogs").push({action:"site-number-edit",detail:"Saha No düzenlendi: "+(rows.find(s=>s.id===id)?.siteId||id)+" / "+(value||"boş"),adminUid:user.uid,createdAt:Date.now()});message("Saha No kaydedildi.","success")}catch(err){message("Saha No kaydedilemedi: "+err.message,"error")}
    }));
  }
  $("siteImportPreviewBtn")?.addEventListener("click",async()=>{
    hideMessage();const file=$("siteImportFile")?.files?.[0];if(!file){message("Önce bir dosya seçin.","error");return}
    const btn=$("siteImportPreviewBtn");btn.disabled=true;btn.textContent="İnceleniyor…";
    try{parsedRows=await parseFile(file);parsedRows=parsedRows.map(r=>({...r,siteId:String(r.siteId||"").toUpperCase(),siteNo:String(r.siteNo||""),address:String(r.address||"")}));renderPreview();message("Dosya okundu. Lütfen önizlemeyi kontrol edin; henüz Firebase'e kayıt yapılmadı.","success")}
    catch(err){parsedRows=[];renderPreview();message("Dosya okunamadı: "+err.message,"error")}
    finally{btn.disabled=false;btn.textContent="Dosyayı incele"}
  });
  $("siteImportCommitBtn")?.addEventListener("click",async()=>{
    const user=firebase.auth().currentUser;if(!user){message("Önce yönetici olarak giriş yapın.","error");return}
    const authSnap=await firebase.database().ref("admins/"+user.uid).once("value");if(authSnap.val()!==true){message("Yönetici yetkisi doğrulanamadı; aktarım iptal edildi.","error");return}
    const existing=await firebase.database().ref("sites").once("value");sites=existing.val()||{};
    const existingIds=new Set(Object.values(sites).map(s=>String(s.siteId||s.siteCode||"").trim().toUpperCase()).filter(Boolean));
    const existingNos=new Set(Object.values(sites).map(s=>String(s.siteNo||"").trim()).filter(Boolean));
    const seenIds=new Set(),seenNos=new Set(),batch=[];
    for(let sourceIndex=0;sourceIndex<parsedRows.length;sourceIndex++){
      const row=parsedRows[sourceIndex];
      const r={...row,siteId:String(row.siteId||"").trim().toUpperCase(),siteNo:String(row.siteNo||"").trim(),_sourceIndex:sourceIndex};
      const id=r.siteId,no=r.siteNo;
      if(!valid(r)||existingIds.has(id)||seenIds.has(id)||(no&&!/^\d+$/.test(no))||(no&&(existingNos.has(no)||seenNos.has(no))))continue;
      seenIds.add(id);if(no)seenNos.add(no);batch.push(r);
    }
    if(!batch.length){message("Aktarılabilecek kayıt bulunamadı. Saha ID ve varsa Saha No değerlerinin benzersiz ve geçerli olduğunu kontrol edin.","error");renderPreview();return}
    if(!confirm(batch.length+" saha kaydı Firebase'e eklenecek. Saha No boş bırakılabilir. Devam edilsin mi?"))return;
    const btn=$("siteImportCommitBtn");btn.disabled=true;btn.textContent="Aktarılıyor…";
    try{
      const db=firebase.database(),now=Date.now(),updates={};
      batch.forEach((r,i)=>{const key=db.ref("sites").push().key;updates["sites/"+key]={id:key,siteId:r.siteId,siteCode:r.siteId,siteNo:String(r.siteNo||""),mapsUrl:String(r.mapsUrl||""),ownerUid:user.uid,ownerName:"Yönetici",createdBy:"admin",company:"Mikrolink",operator:"",siteType:"",province:r.province||"",district:r.district||"",address:r.address,latitude:r.lat,longitude:r.lng,lng:r.lng,lat:r.lat,notes:"Google Maps içe aktarımı"+(r.sourceName?" · "+r.sourceName:""),approved:true,status:"approved",createdAt:now+i,createdByUid:user.uid,approvedBy:user.uid,approvedAt:now+i,importSource:"google-maps"}});
      await db.ref().update(updates);
      await db.ref("auditLogs").push({action:"site-import",detail:batch.length+" Google Maps saha kaydı içe aktarıldı",adminUid:user.uid,createdAt:Date.now()});
      const importedIndexes=new Set(batch.map(r=>r._sourceIndex));parsedRows=parsedRows.filter((r,index)=>!importedIndexes.has(index));renderPreview();message(batch.length+" saha kaydı eklendi. Aktarılmayan veya tekrarlı satırlar önizlemede bırakıldı; Saha No alanlarını aşağıdaki listeden daha sonra doldurabilirsiniz.","success");
    }catch(err){message("Aktarım başarısız: "+err.message,"error")}
    finally{btn.disabled=false;btn.textContent="Geçerli sahaları aktar"}
  });
  firebase.auth().onAuthStateChanged(user=>{
    if(!user)return;
    firebase.database().ref("admins/"+user.uid).once("value").then(s=>{if(s.val()!==true)return;firebase.database().ref("sites").on("value",snap=>{sites=snap.val()||{};renderExisting();if(parsedRows.length)renderPreview()})}).catch(err=>console.warn("Saha içe aktarım paneli başlatılamadı",err));
  });
})();