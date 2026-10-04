async () => {
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await document.fonts.ready;
  const fab=document.querySelector('.wa-fab'), disk=fab.querySelector('.wa-disk');
  const H=document.documentElement.scrollHeight, W=innerWidth, VH=innerHeight;
  const hits=new Set();
  const skip=el=>el.closest('.wa-fab,.mm,.sr,.tente,.toast,[hidden]');
  for(let y=0;y<=H-VH+40;y+=36){
    window.scrollTo({top:y,behavior:'instant'});
    await sleep(40);
    const cs=getComputedStyle(fab);
    if(cs.visibility==='hidden'||parseFloat(cs.opacity)<.5) continue;
    const f=disk.getBoundingClientRect();
    const fx0=f.left-2,fx1=f.right+2,fy0=f.top-2,fy1=f.bottom+6;
    const wk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()?1:2});
    let n;
    while((n=wk.nextNode())){
      const el=n.parentElement; if(!el||skip(el)) continue;
      const st=getComputedStyle(el); if(st.visibility==='hidden') continue;
      let op=1,e=el; while(e){const o=parseFloat(getComputedStyle(e).opacity); op*=o; e=e.parentElement} if(op<.3) continue;
      const r=document.createRange(); r.selectNodeContents(n);
      for(const q of r.getClientRects()){
        if(q.width<1||q.bottom<0||q.top>VH||q.left<0||q.right>W) continue;
        if(q.right>fx0&&q.left<fx1&&q.bottom>fy0&&q.top<fy1) hits.add('TXT['+n.nodeValue.trim().slice(0,24)+']@'+y);
      }
    }
    document.querySelectorAll('.dugme,.metin-link,.dil,.alt a').forEach(el=>{
      if(skip(el)) return; const q=el.getBoundingClientRect(); if(!q.width) return;
      if(q.right>fx0&&q.left<fx1&&q.bottom>fy0&&q.top<fy1&&q.top<VH&&q.bottom>0) hits.add('CTA['+el.textContent.trim().slice(0,20)+']@'+y);
    });
  }
  window.scrollTo({top:0,behavior:'instant'});
  return 'w='+W+' lang='+document.documentElement.lang+' hits='+hits.size+' '+[...hits].slice(0,12).join(' | ');
}
