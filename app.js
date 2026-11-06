'use strict';
const $ = id => document.getElementById(id);
const encoder = new TextEncoder();
let chain = [], pending = [], totalAttempts = 0, lastPowAttempts = 0, busy = false;
function hex(buffer){return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');}
async function sha256(value){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
function blockPayload(b){return JSON.stringify({index:b.index,timestamp:b.timestamp,transactions:b.transactions,previousHash:b.previousHash,nonce:b.nonce,consensus:b.consensus});}
async function calculateHash(block){return sha256(blockPayload(block));}
async function createGenesis(){const b={index:0,timestamp:new Date().toISOString(),transactions:[{from:'ChainLab',to:'Network',amount:0,note:'Genesis block'}],previousHash:'0'.repeat(64),nonce:0,consensus:'GENESIS'};b.hash=await calculateHash(b);chain=[b];}
function showResult(message,success=false){$('mine-result').textContent=message;$('mine-result').style.color=success?'var(--green)':'var(--muted)';}
function setBusy(value){busy=value;$('mine-button').disabled=value;$('pos-button').disabled=value;$('mine-button').textContent=value?'Working…':'Mine with PoW';$('pos-button').textContent=value?'Working…':'Simulate PoS';}
async function mineBlock(consensus,difficulty=0){
 if(!pending.length){showResult('Add at least one pending transaction before creating a block.');return;}
 setBusy(true);
 try{
  const b={index:chain.length,timestamp:new Date().toISOString(),transactions:pending.map(tx=>({...tx})),previousHash:chain[chain.length-1].hash,nonce:0,consensus};
  if(consensus==='PoW'){
   const target='0'.repeat(difficulty);let attempts=0;
   do{b.nonce=attempts;b.hash=await calculateHash(b);attempts++;if(attempts%500===0){$('mine-result').textContent='Searching for a valid hash… '+attempts.toLocaleString()+' attempts';await new Promise(r=>setTimeout(r,0));}}while(!b.hash.startsWith(target));
   b.attempts=attempts;b.difficulty=difficulty;lastPowAttempts=attempts;totalAttempts+=attempts;showResult('PoW block mined after '+attempts.toLocaleString()+' hash attempts.',true);
  }else{b.hash=await calculateHash(b);b.attempts=1;showResult('PoS model: a validator was selected in one simulated step.',true);}
  chain.push(b);pending=[];await render();
 }catch(e){showResult('Simulation error: '+e.message);}finally{setBusy(false);}
}
async function validateChain(){
 for(let i=0;i<chain.length;i++){const b=chain[i];if(await calculateHash(b)!==b.hash)return{valid:false,index:i};if(i>0&&b.previousHash!==chain[i-1].hash)return{valid:false,index:i};if(b.consensus==='PoW'&&!b.hash.startsWith('0'.repeat(b.difficulty||0)))return{valid:false,index:i};}
 return{valid:true};
}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function render(){
 $('block-count').textContent=chain.length;$('tx-count').textContent=chain.reduce((n,b)=>n+b.transactions.filter(t=>t.from!=='ChainLab').length,0);$('attempt-count').textContent=totalAttempts.toLocaleString();$('pending-count').textContent=pending.length;
 $('pending-list').innerHTML=pending.length?pending.map(t=>'<li><span>'+esc(t.from)+' → '+esc(t.to)+'</span><strong>'+Number(t.amount).toLocaleString()+'</strong></li>').join(''):'<li class="empty">No pending transactions yet.</li>';
 $('chain-list').innerHTML=chain.slice().reverse().map(b=>'<article class="block-card" data-index="'+b.index+'"><div class="block-top"><span class="block-title">Block #'+b.index+'</span><span class="block-badge">'+b.consensus+'</span></div><div class="block-meta"><div class="meta-item"><span>HASH</span><code>'+b.hash+'</code></div><div class="meta-item"><span>PREVIOUS HASH</span><code>'+b.previousHash+'</code></div><div class="meta-item"><span>NONCE</span><code>'+b.nonce+'</code></div><div class="meta-item"><span>CREATED</span><code>'+new Date(b.timestamp).toLocaleTimeString()+'</code></div></div><div class="block-transactions">'+b.transactions.map(t=>esc(t.from)+' → '+esc(t.to)+' ('+Number(t.amount).toLocaleString()+')').join(' · ')+'</div></article>').join('');
 $('tamper-select').innerHTML=chain.map(b=>'<option value="'+b.index+'">Block #'+b.index+'</option>').join('');$('pow-work').textContent=lastPowAttempts.toLocaleString()+' hash attempts';$('pow-energy').textContent=(totalAttempts*.001).toFixed(3)+' relative units';
 const result=await validateChain();$('chain-status').textContent=result.valid?'Valid':'Invalid';$('chain-status').className=result.valid?'status-good':'status-bad';$('chain-status-note').textContent=result.valid?'All hashes and links match':'Problem at block #'+result.index;
 document.querySelectorAll('.block-card').forEach(card=>card.classList.toggle('invalid',!result.valid&&Number(card.dataset.index)>=result.index));
}
$('transaction-form').addEventListener('submit',e=>{e.preventDefault();const from=$('sender').value.trim(),to=$('recipient').value.trim(),amount=Number($('amount').value);if(!from||!to||from.toLowerCase()===to.toLowerCase()||!Number.isFinite(amount)||amount<=0){showResult('Enter two different names and an amount greater than zero.');return;}pending.push({from,to,amount:Number(amount.toFixed(2))});render();showResult('Transaction added to the pending pool.');});
$('difficulty').addEventListener('input',e=>$('difficulty-value').textContent=e.target.value);
$('mine-button').addEventListener('click',()=>{if(!busy)mineBlock('PoW',Number($('difficulty').value));});
$('pos-button').addEventListener('click',()=>{if(!busy)mineBlock('PoS');});
$('tamper-button').addEventListener('click',async()=>{if(chain.length<2){showResult('Create at least one block before testing tamper detection.');return;}const b=chain.find(x=>x.index===Number($('tamper-select').value));if(!b)return;b.transactions[0].note=$('tamper-text').value.trim()||'Changed data';await render();showResult('Block #'+b.index+' was altered. Chain integrity should now fail.');});
$('reset-button').addEventListener('click',async()=>{if(busy)return;pending=[];totalAttempts=0;lastPowAttempts=0;await createGenesis();await render();showResult('Demo reset to the genesis block.');});
(async()=>{if(!globalThis.crypto?.subtle){showResult('Web Crypto unavailable. Open using localhost or HTTPS.');$('mine-button').disabled=true;$('pos-button').disabled=true;return;}await createGenesis();await render();})();