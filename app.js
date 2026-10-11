(() => {
  'use strict';
  const ideas = window.IDEAS.map((x,i)=>({...x,id:i+1}));
  const subjects = [...new Set(ideas.map(x=>x.subject))];
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let saved = new Set();
  try { const data = JSON.parse(localStorage.getItem('idea-atlas-saved') || '[]'); if(Array.isArray(data)) saved = new Set(data.filter(x=>Number.isInteger(x)&&x>=1&&x<=50)); } catch {}
  let subject='All ideas', savedOnly=false, toastTimer;
  const num = id => String(id).padStart(2,'0');
  const bookmark = '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M3 2h12v18l-6-4-6 4Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  function filtered(){ const q=$('#search').value.toLowerCase().trim();return ideas.filter(x=>(subject==='All ideas'||x.subject===subject)&&(!savedOnly||saved.has(x.id))&&`${x.title} ${x.author} ${x.subject} ${x.summary}`.toLowerCase().includes(q)); }
  function render(){
    const list=filtered();
    $('#filters').innerHTML=['All ideas',...subjects].map(s=>`<button class="${subject===s?'active':''}" data-subject="${esc(s)}" aria-pressed="${subject===s}">${esc(s)}</button>`).join('');
    $('#feed').innerHTML=list.map(x=>`<article class="idea" id="idea-${x.id}" aria-labelledby="title-${x.id}"><div class="idea-meta"><div><span class="num">${num(x.id)} / 50</span>${esc(x.subject).toUpperCase()}<span aria-hidden="true"> · </span>${esc(x.type).toUpperCase()}</div><button class="save" data-save="${x.id}" aria-pressed="${saved.has(x.id)}" aria-label="${saved.has(x.id)?'Unsave':'Save'} ${esc(x.title)}">${bookmark}<span>${saved.has(x.id)?'Saved':'Save idea'}</span></button></div><h3 id="title-${x.id}">${esc(x.title)}</h3><div class="visual"><img src="art/idea-${x.id}.svg" alt="Abstract ${esc(x.art)} illustration for ${esc(x.title)}" width="1400" height="600" loading="lazy"><div class="visual-copy"><span class="mini">THE BIG PICTURE / ${num(x.id)}</span><p>${esc(x.concept)}</p></div><a class="visual-link" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${x.type==='Video'?'▷ Watch the talk':x.type==='Book'?'Explore the book':'Read the source'} <span>↗</span></a></div><div class="art-caption">ORIGINAL ABSTRACT ILLUSTRATION · ${esc(x.art).toUpperCase()} STUDY ${num(x.id)}</div><div class="summary"><div class="summary-meta"><span class="eyebrow">THE IDEA, IN BRIEF</span><span>${esc(x.author)}</span><span>${esc(x.type)} · ${x.type==='Book'?'Publisher / full text':'Source linked below'}</span></div><div class="summary-text"><p>${esc(x.summary)}</p><div class="takeaway"><span>TAKE IT WITH YOU</span>${esc(x.takeaway)}</div><a class="source" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${x.type==='Book'?'Book details / text':x.type==='Video'?'Original video':'Read more at the source'} ↗</a></div></div></article>`).join('');
    $('#resultCount').textContent=list.length; $('#empty').hidden=list.length>0;
    $('#empty h3').textContent=savedOnly&&saved.size===0?'Your collection starts here.':'No ideas found.';
    $('#empty p').textContent=savedOnly&&saved.size===0?'Save an idea as you explore, then return to it here.':'Try another search, subject, or the full collection.';
    $('#status').textContent=`${list.length} ideas shown${savedOnly?' from your saved collection':''}.`;
    $('#savedCount').textContent=saved.size; $('#savedBtn').setAttribute('aria-pressed',String(savedOnly));
  }
  function reset(){subject='All ideas';savedOnly=false;$('#search').value='';render();}
  function jump(id){reset();requestAnimationFrame(()=>{location.hash=`idea-${id}`;document.getElementById(`idea-${id}`).scrollIntoView({behavior:'smooth'});});}
  function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,2500);}
  $('#filters').addEventListener('click',e=>{const b=e.target.closest('[data-subject]');if(b){subject=b.dataset.subject;render();const replacement=[...$('#filters').children].find(x=>x.dataset.subject===subject);replacement?.focus({preventScroll:true});}});
  $('#search').addEventListener('input',render);
  $('#feed').addEventListener('click',e=>{const b=e.target.closest('[data-save]');if(!b)return;const id=Number(b.dataset.save);saved.has(id)?saved.delete(id):saved.add(id);let persisted=true;try{localStorage.setItem('idea-atlas-saved',JSON.stringify([...saved]));}catch{persisted=false;}$('#savedCount').textContent=saved.size;if(savedOnly){render();}else{b.setAttribute('aria-pressed',String(saved.has(id)));b.setAttribute('aria-label',`${saved.has(id)?'Unsave':'Save'} ${ideas[id-1].title}`);b.querySelector('span').textContent=saved.has(id)?'Saved':'Save idea';}toast(persisted?(saved.has(id)?'Saved for your next visit.':'Removed from saved ideas.'):'Saved for this visit. Browser storage is unavailable.');});
  $('#savedBtn').addEventListener('click',()=>{savedOnly=!savedOnly;subject='All ideas';$('#search').value='';render();$('#collection').scrollIntoView({behavior:'smooth'});});
  $('#resetBtn').addEventListener('click',reset);
  $('#randomBtn').addEventListener('click',()=>{const list=filtered();if(list.length){jump(list[Math.floor(Math.random()*list.length)].id);}else{toast('Show the full collection to discover an idea.');}});
  $('#indexList').innerHTML=subjects.map(s=>`<h3 class="index-subject">${esc(s)}</h3>${ideas.filter(x=>x.subject===s).map(x=>`<button class="index-item" data-jump="${x.id}"><span>${num(x.id)}</span><strong>${esc(x.title)}</strong><span class="type">${esc(x.type)}</span><span>↗</span></button>`).join('')}`).join('');
  $('#indexBtn').addEventListener('click',()=>$('#indexDialog').showModal());
  $('#closeIndex').addEventListener('click',()=>$('#indexDialog').close());
  $('#indexDialog').addEventListener('click',e=>{if(e.target===$('#indexDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#indexList').addEventListener('click',e=>{const b=e.target.closest('[data-jump]');if(b){$('#indexDialog').close();jump(Number(b.dataset.jump));}});
  function progress(){const max=document.documentElement.scrollHeight-innerHeight;$('.progress').style.width=`${max>0?scrollY/max*100:0}%`;}
  addEventListener('scroll',progress,{passive:true});addEventListener('resize',progress);
  render(); const initial=location.hash.match(/^#idea-(\d+)$/);if(initial&&ideas.some(x=>x.id===Number(initial[1])))requestAnimationFrame(()=>document.getElementById(`idea-${initial[1]}`).scrollIntoView());
})();
