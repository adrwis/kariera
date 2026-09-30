const fs=require('fs');
async function fetchAll(t,state){let items=[],off=0;for(;;){const r=await fetch(`https://rspo.gov.pl/api/Institution?PageOffset=${off}&PageSize=200`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({institutionTypeIdList:[t],categoryIdList:[1],stateId:state})});const d=await r.json();items.push(...d.items);off+=200;if(off>=d.totalCount)break}return items}
(async()=>{const out={Warszawa:[],Gdynia:[],Sopot:[]};
for(const t of [14,16]){const m=await fetchAll(t,7),p=await fetchAll(t,11);
 for(const [c,src] of [['Warszawa',m],['Gdynia',p],['Sopot',p]])out[c].push(...src.filter(i=>i.hqAddressLocality.name===c&&!i.liquidationDate));}
for(const [c,v] of Object.entries(out)){fs.writeFileSync(`list_${c}.json`,JSON.stringify(v));const cnt={};v.forEach(i=>cnt[i.type.name]=(cnt[i.type.name]||0)+1);console.log(c,v.length,JSON.stringify(cnt),'z uczniami:',v.filter(i=>i.studentsNr>0).length)}})();
