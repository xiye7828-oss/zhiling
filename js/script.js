let currentRoom = '8888';
let channel = null;
let pendingDeleteIndex = null;
let isMiniMode = false;

const DEFAULT_BUTTONS = [
    { id: 1, label: '流量爆发', text: '炸福利', color: 'bg-red' },
    { id: 2, label: '冷场激活', text: '扣1送礼', color: 'bg-yellow' },
    { id: 3, label: '库存预警', text: '只剩五单', color: 'bg-green' },
    { id: 4, label: '逼单时刻', text: '最后三十秒', color: 'bg-blue' }
];
let buttons = [];
document.getElementById('room-input').value = Math.floor(1000 + Math.random() * 9000);

function loadButtons() {
    const saved = localStorage.getItem('iron_compass_buttons_v5');
    buttons = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_BUTTONS));
    renderButtons();
}
function saveButtons() { 
    localStorage.setItem('iron_compass_buttons_v5', JSON.stringify(buttons)); 
    setSaveStatus(true);
}

function setSaveStatus(saved) {
    const el = document.getElementById('save-indicator');
    if (saved) {
        el.innerText = '✔ 已保存';
        el.className = 'save-status saved';
    } else {
        el.innerText = '● 编辑中...';
        el.className = 'save-status unsaved';
    }
}

function renderButtons() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    buttons.forEach((btn, index) => {
        const div = document.createElement('div');
        div.className = `deck-btn ${btn.color}`;
        div.innerHTML = `
            <div class="deck-tools"><div class="tool-icon" onclick="changeColor(${index})">&#127912;</div><div class="tool-icon tool-delete" onclick="requestDelete(${index})">&#10005;</div></div>
            <input type="text" class="deck-title-input" value="${btn.label}" oninput="handleLabelInput(${index}, this.value)" onblur="saveButtons()">
            <input type="text" class="deck-main-input" value="${btn.text}" maxlength="10" placeholder="限10字" oninput="handleTextInput(${index}, this.value)" onblur="saveButtons()">
            <div class="char-counter" id="cnt-${index}">${btn.text.length}/10</div>
            <div class="deck-send" onclick="sendMsgFromIndex(${index})">&#9889; 发送指令</div>
        `;
        container.appendChild(div);
    });
}

function handleLabelInput(i, v) { buttons[i].label = v; setSaveStatus(false); }
function handleTextInput(i, v) { buttons[i].text = v; document.getElementById(`cnt-${i}`).innerText = `${v.length}/10`; setSaveStatus(false); }
function sendMsgFromIndex(i) { sendMsg(buttons[i].text); }

function addNewButton() { buttons.push({ id: Date.now(), label: '新指令', text: '...', color: 'bg-green' }); saveButtons(); renderButtons(); setTimeout(() => document.getElementById('grid-container').scrollTop = 9999, 100); }
function requestDelete(i) { pendingDeleteIndex = i; document.getElementById('modal-delete').classList.remove('hidden'); }
function confirmDelete() { if(pendingDeleteIndex!==null) buttons.splice(pendingDeleteIndex,1); saveButtons(); renderButtons(); cancelDelete(); }
function cancelDelete() { pendingDeleteIndex=null; document.getElementById('modal-delete').classList.add('hidden'); }
function changeColor(i) { const c=['bg-red','bg-yellow','bg-green','bg-blue']; buttons[i].color=c[(c.indexOf(buttons[i].color)+1)%4]; saveButtons(); renderButtons(); }

function showView(id) { document.querySelectorAll('.full-screen').forEach(el=>el.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }
function goToLanding() {
    const val = document.getElementById('room-input').value; if(!val) return alert('请输入频段号'); currentRoom=val; document.querySelectorAll('.room-display').forEach(el=>el.innerText=val);
    if(channel) channel.close(); channel = new BroadcastChannel('iron_compass_'+val);
    channel.onmessage = (e) => { if(e.data.type==='MSG') updateAnchor(e.data.text); if(e.data.type==='CLEAR') clearAnchor(); };
    showView('view-landing');
}
function backToLanding() { showView('view-landing'); }
function startOps() { loadButtons(); showView('view-ops'); }
function startAnchor() { showView('view-anchor'); }
function sendMsg(t) { if(channel) channel.postMessage({ type:'MSG', text:t }); }
function sendClear() { if(channel) channel.postMessage({ type:'CLEAR' }); }

function updateAnchor(text) {
    document.getElementById('anchor-standby').classList.add('hidden');
    const c = document.getElementById('anchor-content'); 
    c.classList.remove('hidden');
    c.innerText = text;
    c.classList.remove('short-text');
    
    // 巨幕逻辑：1-4个字超级大
    if (!isMiniMode && text.length <= 4) {
        c.classList.add('short-text');
    }
    
    const f = document.getElementById('anchor-flash'); 
    f.classList.add('flash'); 
    setTimeout(()=>f.classList.remove('flash'),600);
}

function clearAnchor() { document.getElementById('anchor-standby').classList.remove('hidden'); document.getElementById('anchor-content').classList.add('hidden'); }
function showDonate() { document.getElementById('modal-donate').classList.remove('hidden'); }
function closeDonate() { document.getElementById('modal-donate').classList.add('hidden'); }

function toggleMiniMode() {
    isMiniMode = !isMiniMode;
    const view = document.getElementById('view-anchor');
    const btn = document.getElementById('mode-btn');
    document.getElementById('anchor-content').classList.remove('short-text');

    if (isMiniMode) {
        view.classList.add('mini-mode');
        btn.innerText = "切换: 全屏模式";
    } else {
        view.classList.remove('mini-mode');
        btn.innerText = "切换: 悬浮条模式";
    }
}