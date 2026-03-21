const API_BASE = 'http://127.0.0.1:8000/api'

// Small utility available globally
function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // Small utility
  const $ = (sel) => document.querySelector(sel)
  const $$ = (sel) => Array.from(document.querySelectorAll(sel))

  // Elements (guarded)
  const talkBtn = $('#talkBtn')
  const reportBtn = $('#reportBtn')
  const talkCardBtn = $('#talkCardBtn')
  const reportCardBtn = $('#reportCardBtn')
  const roleplayCardBtn = $('#roleplayCardBtn')
  const moodModal = $('#moodModal')
  const talkModal = $('#talkModal')
  const reportModal = $('#reportModal')
  const roleplayModal = $('#roleplayModal')
  const themeToggle = $('#themeToggle')
  const yearEl = $('#year')

  if(yearEl) yearEl.textContent = new Date().getFullYear()

  // theme toggle
  // initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme')
  const themeIcon = document.getElementById('themeIcon')

  function renderThemeIcon(isDark){
    if(!themeIcon) return
    // moon SVG (dark) and sun SVG (light)
    if(isDark){
      themeIcon.innerHTML = '\n        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="#ffffff"></path>\n      '
      themeIcon.classList.add('theme-rot')
    } else {
      themeIcon.innerHTML = '\n        <circle cx="12" cy="12" r="4" fill="#0b67d0"></circle>\n        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="#0b67d0" stroke-width="1.2" stroke-linecap="round"></path>\n      '
      themeIcon.classList.add('theme-rot')
    }
  }

  // apply saved theme and corresponding icon
  if(savedTheme === 'dark'){
    document.body.classList.add('dark')
    renderThemeIcon(true)
  } else {
    renderThemeIcon(false)
  }

  if(themeToggle) themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark')
    const isDark = document.body.classList.contains('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    // swap icon
    renderThemeIcon(isDark)
    // small rotation effect
    if(themeIcon){
      themeIcon.style.transform = 'rotate(20deg)'
      setTimeout(()=> themeIcon.style.transform = '', 220)
    }
  })

  // Admin button: go to dedicated admin page
  const adminLinkHeader = $('#adminLink')
  if(adminLinkHeader) adminLinkHeader.addEventListener('click', (e)=>{ e.preventDefault(); window.location = 'admin.html' })
  // backHome button used on mood page
  const backHomeBtn = document.getElementById('backHome')
  if(backHomeBtn) backHomeBtn.addEventListener('click', ()=>{ window.location = 'index.html' })

  // Mobile menu toggle
  const mobileMenuBtn = $('#mobileMenuBtn')
  const appRoot = document.querySelector('.app')
  if(mobileMenuBtn){
    mobileMenuBtn.addEventListener('click', ()=>{
      if(appRoot.classList.contains('mobile-nav-open')) appRoot.classList.remove('mobile-nav-open')
      else appRoot.classList.add('mobile-nav-open')
    })
  }

  // Nav links smooth scroll / actions
  const navTalk = $('#navTalk')
  const navReport = $('#navReport')
  const navRoleplay = $('#navRoleplay')
  const navMood = $('#navMood')
  const navHome = $('#navHome')
  const ftTalk = $('#ftTalk')
  const ftReport = $('#ftReport')
  if(navHome) navHome.addEventListener('click', (e)=>{ e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); if(appRoot) appRoot.classList.remove('mobile-nav-open') })
  if(navTalk && talkModal) navTalk.addEventListener('click', (e)=>{ e.preventDefault(); openModal(talkModal); if(appRoot) appRoot.classList.remove('mobile-nav-open') })
  if(navReport && reportModal) navReport.addEventListener('click', (e)=>{ e.preventDefault(); openModal(reportModal); if(appRoot) appRoot.classList.remove('mobile-nav-open') })
  if(navRoleplay && roleplayModal) navRoleplay.addEventListener('click', (e)=>{ e.preventDefault(); openModal(roleplayModal); if(appRoot) appRoot.classList.remove('mobile-nav-open') })
  // Only bind mood link to modal if a modal exists on this page; otherwise allow it to act as a normal link
  if(navMood){
    if(moodModal) navMood.addEventListener('click', (e)=>{ e.preventDefault(); openModal(moodModal); if(appRoot) appRoot.classList.remove('mobile-nav-open') })
  }
  if(ftTalk) ftTalk.addEventListener('click', (e)=>{ e.preventDefault(); openModal(talkModal) })
  if(ftReport) ftReport.addEventListener('click', (e)=>{ e.preventDefault(); openModal(reportModal) })

  // open/close helpers
  function openModal(modal){
    if(!modal) return;
    // clear talk modal inputs when opening so entries are not persisted
    if(modal.id === 'talkModal'){
      const t = document.getElementById('talkInput')
      const r = document.getElementById('analyzeResult')
      if(t) t.value = ''
      if(r) r.innerHTML = ''
    }
    modal.classList.remove('hidden'); document.body.style.overflow='hidden'
  }
  function closeModal(modal){
    if(!modal) return;
    // clear talk modal inputs when closing (don't persist)
    if(modal.id === 'talkModal'){
      const t = document.getElementById('talkInput')
      const r = document.getElementById('analyzeResult')
      if(t) t.value = ''
      if(r) r.innerHTML = ''
    }
    modal.classList.add('hidden'); document.body.style.overflow=''
  }

  // wire buttons (check existence)
  if(talkBtn) talkBtn.addEventListener('click', () => openModal(talkModal))
  if(talkCardBtn) talkCardBtn.addEventListener('click', () => openModal(talkModal))
  if(reportBtn) reportBtn.addEventListener('click', () => openModal(reportModal))
  if(reportCardBtn) reportCardBtn.addEventListener('click', () => openModal(reportModal))
  if(roleplayCardBtn) roleplayCardBtn.addEventListener('click', () => openModal(roleplayModal))

  // optional extra: a button inside talk modal to open roleplay
  const openRoleplayBtn = $('#openRoleplay')
  if(openRoleplayBtn) openRoleplayBtn.addEventListener('click', () => { closeModal(talkModal); openModal(roleplayModal) })

  // close buttons
  // remove direct binding and use delegated click handler below to make closing robust
  $$( '.modal' ).forEach(m => m.addEventListener('click', (e) => { if (e.target === m) closeModal(m) }))

  // press Escape to close modals
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape'){ $$('.modal').forEach(m => closeModal(m)) } })

  // Helpline load
  async function loadHelpline(){
    try{
      const res = await fetch(`${API_BASE}/helpline`)
      if(!res.ok) throw new Error('no')
      const data = await res.json()
      const el = document.getElementById('helplineNumber')
      if(el) el.textContent = data.national_helpline
    }catch(err){console.warn('helpline load failed',err)}
  }

  loadHelpline()

  // Load reports only when admin token present (avoids unauthenticated failures)
  async function loadReports(){
    const token = localStorage.getItem('admin_token')
    if(!token) return; // skip until logged in
    try{
      const res = await fetch(`${API_BASE}/admin/reports`, { headers: { Authorization: 'Bearer '+token } })
      if(!res.ok){
        if(res.status === 401) throw new Error('Unauthorized - token invalid')
        throw new Error('Status '+res.status)
      }
      const data = await res.json()
      const el = document.getElementById('reportsList')
      if(el) el.innerHTML = data.map(r => `<div class='report-card'><strong>#${r.id}</strong> ${escapeHtml(r.details)} <div class='muted'>${r.created_at}</div></div>`).join('\n')
    }catch(err){ console.warn('load reports failed',err); showToast('Load reports failed: '+err.message, 'error') }
  }

  // Start periodic load (will only run once token present)
  setInterval(loadReports, 10000)
  loadReports()

  // Analyze flow (guarded)
  const analyzeBtn = $('#analyzeBtn')
  if(analyzeBtn){
    analyzeBtn.addEventListener('click', async () => {
      const textEl = $('#talkInput')
      const resEl = $('#analyzeResult')
      const text = textEl ? (textEl.value || '') : ''
      if(resEl) resEl.textContent = 'Analyzing...'
      try{
        const resp = await fetch(`${API_BASE}/analyze`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({text}) })
        const data = await resp.json()
        if(resEl) renderAnalysis(resEl, data)
      }catch(err){ if(resEl) resEl.textContent = 'Analysis failed' }
    })
  }

  // Delegated click handler: handles close buttons, analyze, and openRoleplay reliably even if elements are dynamic
  document.addEventListener('click', async (e) => {
    try{
      const closeBtn = e.target.closest ? e.target.closest('[data-close]') : null
      if(closeBtn){
        const modal = closeBtn.closest('.modal')
        closeModal(modal)
        return
      }

      const analyzeEl = e.target.closest ? e.target.closest('#analyzeBtn') : null
      if(analyzeEl){
        const textEl = document.getElementById('talkInput')
        const resEl = document.getElementById('analyzeResult')
        const text = textEl ? (textEl.value || '') : ''
        if(resEl) resEl.textContent = 'Analyzing...'
        try{
          const resp = await fetch(`${API_BASE}/analyze`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({text}) })
          const data = await resp.json()
          if(resEl) renderAnalysis(resEl, data)
        }catch(err){ if(resEl) resEl.textContent = 'Analysis failed' }
        return
      }

      const openRoleplayEl = e.target.closest ? e.target.closest('#openRoleplay') : null
      if(openRoleplayEl){
        closeModal(talkModal)
        openModal(roleplayModal)
        return
      }
    }catch(err){ console.warn('delegated click handler error', err) }
  })

  function renderAnalysis(root, data){
    root.innerHTML = ''
    const score = Math.round((data.bullying_score||0)*100)
    const esc = Math.round((data.escalation_risk||0)*100)
    const compassion = Math.round(((data.compassion_score||0))*100)

    const html = `
      <div class="analysis-grid">
        <div><strong>Bullying score</strong><div class="muted">${score}%</div></div>
        <div><strong>Escalation risk</strong><div class="muted">${esc}%</div></div>
        <div><strong>Compassion score</strong><div class="muted">${compassion}%</div></div>
      </div>
      <div style="margin-top:10px"><strong>Supportive response</strong><div class="muted">${escapeHtml(data.supportive_response||'')}</div></div>
      <div style="margin-top:8px"><strong>Kindness suggestion</strong><div class="muted">${escapeHtml(data.kindness_suggestion||'')}</div></div>
    `
    root.innerHTML = html
  }

  // note: escapeHtml is now global

  // Live support preview in the hero phone mock
  // Remove live hero preview — replaced by a How-it-works card on the homepage.
  const startTalkSmall = document.getElementById('startTalkSmall')
  if(startTalkSmall) startTalkSmall.addEventListener('click', ()=> openModal(talkModal))

  // Roleplay simulation (guarded)
  const roleplayBtn = $('#roleplayBtn')
  if(roleplayBtn){
    roleplayBtn.addEventListener('click', async () => {
      const scenarioEl = $('#scenarioSelect')
      const responseEl = $('#roleplayResponse')
      const out = $('#roleplayResult')
      const scenario = scenarioEl ? scenarioEl.value : 'default'
      const user_response = responseEl ? responseEl.value : ''
      if(out) out.textContent = 'Simulating...'
      try{
        const resp = await fetch(`${API_BASE}/roleplay`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({scenario, user_response})})
        const data = await resp.json()
        if(out) out.innerHTML = `<strong>Feedback</strong><div class="muted">${escapeHtml(data.feedback||JSON.stringify(data))}</div>`
      }catch(err){ if(out) out.textContent = 'Simulation failed' }
    })
  }

  // Report form (guarded)
  const reportForm = $('#reportForm')
  if(reportForm){
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const form = e.target
      // run HTML5 validation for required fields
      if(!form.checkValidity()){
        const status = $('#reportStatus')
        if(status) status.textContent = 'Please fill required fields.'
        form.reportValidity()
        return
      }
      const formData = new FormData(form)
      const status = $('#reportStatus')
      if(status) status.textContent = 'Submitting...'
      try{
        const res = await fetch(`${API_BASE}/report`, {method:'POST', body: formData})
        const data = await res.json()
        if(status) status.textContent = 'Submitted — id: ' + (data.id || '(unknown)')
        form.reset()
      }catch(err){ if(status) status.textContent = 'Report failed' }
    })
  }

  // Mood tracker handlers
  const moodLink = $('#moodLink')
  const moodSubmit = $('#moodSubmit')
  const moodSelect = $('#moodSelect')
  const moodEntry = $('#moodEntry')
  const moodStatus = $('#moodStatus')

  if(moodLink && moodModal){
    moodLink.addEventListener('click', (e)=>{ e.preventDefault(); openModal(moodModal) })
  }

  if(moodSubmit){
    moodSubmit.addEventListener('click', async ()=>{
      const entry = moodEntry ? moodEntry.value.trim() : ''
      const mood = moodSelect ? moodSelect.value : 'neutral'
      if(moodStatus) moodStatus.textContent = 'Saving...'
      try{
        const resp = await fetch(`${API_BASE}/mood`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({mood, entry}) })
        const data = await resp.json()
        if(moodStatus){
          // Prefer created_at if provided by the backend, fall back to id
          if(data && data.created_at){
            // Try to localize timestamp, but fall back to raw string on parse failure
            let display = data.created_at
            try{
              const d = new Date(data.created_at)
              if(!isNaN(d.getTime())) display = d.toLocaleString()
            }catch(_){}
            moodStatus.textContent = 'Saved — '+display
          } else if(data && data.id){
            moodStatus.textContent = 'Saved — id: '+data.id
          } else {
            moodStatus.textContent = 'Saved'
          }
        }
        if(moodEntry) moodEntry.value = ''
        // Construct the new mood object from server response + local values so we can display it immediately.
        const newMood = {
          id: data && data.id ? data.id : ('local-' + Date.now()),
          created_at: data && data.created_at ? data.created_at : (new Date()).toISOString(),
          mood: mood,
          entry: entry
        }

        // Ensure the list is visible so the user sees what they just saved
        showMoodList = true
        if(showMoodsBtn) showMoodsBtn.textContent = 'Hide saved moods'
        if(clearAllBtnElem) clearAllBtnElem.style.display = ''

        // Prepend the new mood to the list in the same format as renderMoodList
        const container = document.getElementById('moodList')
        if(container){
          // create card HTML
          let when = newMood.created_at
          try{ const d = new Date(newMood.created_at); if(!isNaN(d.getTime())) when = d.toLocaleString() }catch(_){ }
          const card = document.createElement('div')
          card.className = 'mood-card'
          card.innerHTML = `<div class="mood-main"><div><strong>${escapeHtml(newMood.mood||'')}</strong></div><div class="mood-meta">Saved: ${when}</div><div style="margin-top:8px">${escapeHtml(newMood.entry||'')}</div></div><div class="mood-actions"><button class="btn small delete-mood" data-id="${newMood.id}">Delete</button></div>`
          // insert at top
          if(container.firstChild) container.insertBefore(card, container.firstChild)
          else container.appendChild(card)

          // wire the delete button we just added
          const delBtn = card.querySelector('.delete-mood')
          if(delBtn){
            delBtn.addEventListener('click', async (e)=>{
              const id = e.target.dataset.id
              if(!confirm('Delete this mood entry?')) return
              try{
                const resp = await fetch(`${API_BASE}/mood/${id}`, { method: 'DELETE' })
                if(!resp.ok) throw new Error('Failed')
                // remove card from DOM
                card.remove()
              }catch(err){ alert('Could not delete: '+err.message) }
            })
          }
        }
      }catch(err){ if(moodStatus) moodStatus.textContent = 'Save failed' }
    })
  }

  // Clear All button (deletes all moods)
  const clearAllBtn = document.getElementById('clearAll')
  if(clearAllBtn){
    clearAllBtn.addEventListener('click', async ()=>{
      if(!confirm('Delete ALL saved moods? This cannot be undone.')) return
      if(moodStatus) moodStatus.textContent = 'Clearing...'
      try{
        const resp = await fetch(`${API_BASE}/mood`, { method: 'DELETE' })
        const data = await resp.json()
        if(moodStatus) moodStatus.textContent = 'Cleared — deleted: '+(data.deleted||0)
        await loadMoods()
      }catch(err){ if(moodStatus) moodStatus.textContent = 'Clear failed' }
    })
  }

  // Fetch and render moods in both the hero preview and the modal list
  async function loadMoods(){
    try{
      const res = await fetch(`${API_BASE}/mood`)
      if(!res.ok) throw new Error('Status '+res.status)
      const data = await res.json()
      // Only render list/preview if the user has asked to see moods
      if(showMoodList){
        renderMoodList(data)
      }
      // Do not render preview automatically on this page — mood page shows list only on demand
    }catch(err){ console.warn('Could not load moods', err) }
  }

  function renderMoodPreview(list){
    const preview = document.getElementById('moodPreview')
    if(!preview) return
    if(!list || !list.length) return preview.textContent = 'Your private mood timeline is empty — add your first mood to begin tracking how you feel over time.'
    const last = list[0]
    const d = new Date(last.created_at)
    const when = isNaN(d.getTime()) ? last.created_at : d.toLocaleString()
    preview.innerHTML = `<div><strong>${escapeHtml(last.mood||'')}</strong> — <span class="muted small">${when}</span></div><div style="margin-top:6px">${escapeHtml(last.entry||'')}</div>`
  }

  function renderMoodList(list){
    const container = document.getElementById('moodList')
    if(!container) return
    if(!list || !list.length) return container.innerHTML = '<div class="mood-empty">No moods saved yet.</div>'
    container.innerHTML = list.map(m => {
      let when = m.created_at
      try{ const d = new Date(m.created_at); if(!isNaN(d.getTime())) when = d.toLocaleString() }catch(_){ }
      return `<div class="mood-card"><div class="mood-main"><div><strong>${escapeHtml(m.mood||'')}</strong></div><div class="mood-meta">Saved: ${when}</div><div style="margin-top:8px">${escapeHtml(m.entry||'')}</div></div><div class="mood-actions"><button class="btn small delete-mood" data-id="${m.id}">Delete</button></div></div>`
    }).join('\n')

    // wire delete buttons
    Array.from(document.querySelectorAll('.delete-mood')).forEach(b=>{
      b.addEventListener('click', async (e)=>{
        const id = e.target.dataset.id
        if(!confirm('Delete this mood entry?')) return
        try{
          const resp = await fetch(`${API_BASE}/mood/${id}`, { method: 'DELETE' })
          if(!resp.ok) throw new Error('Failed')
          await loadMoods()
        }catch(err){ alert('Could not delete: '+err.message) }
      })
    })
  }

  // show moods only when user requests it
  let showMoodList = false
  const showMoodsBtn = document.getElementById('showMoods')
  const clearAllBtnElem = document.getElementById('clearAll')
  if(showMoodsBtn){
    showMoodsBtn.addEventListener('click', async ()=>{
      showMoodList = !showMoodList
      if(showMoodList){
        showMoodsBtn.textContent = 'Hide saved moods'
        if(clearAllBtnElem) clearAllBtnElem.style.display = ''
        await loadMoods()
      } else {
        showMoodsBtn.textContent = 'Show saved moods'
        if(clearAllBtnElem) clearAllBtnElem.style.display = 'none'
        const container = document.getElementById('moodList')
        if(container) container.innerHTML = ''
      }
    })
  }

  // Admin fetch reports (periodic)
  // (moved above to only load when token exists)

})

// Chat UI handlers
document.addEventListener('DOMContentLoaded', ()=>{
  const chatModal = document.getElementById('chatModal')
  const chatMessages = document.getElementById('chatMessages')
  const chatInput = document.getElementById('chatInput')
  const chatSend = document.getElementById('chatSend')
  const chatClear = document.getElementById('chatClear')

  function appendMessage(role, text){
    const d = document.createElement('div')
    d.style.marginBottom = '8px'
    if(role === 'user'){
      d.innerHTML = `<div style="text-align:right"><span style="background:#e6f0ff;padding:8px;border-radius:8px;display:inline-block">${escapeHtml(text)}</span></div>`
    }else{
      d.innerHTML = `<div style="text-align:left"><span style="background:#f1f5f9;padding:8px;border-radius:8px;display:inline-block">${escapeHtml(text)}</span></div>`
    }
    if(chatMessages) chatMessages.appendChild(d)
    if(chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight
  }

  // open chat helper: prefill with last message from talk input if any
  const openChat = ()=>{
    // populate from talkInput if present
    const talkTextEl = document.getElementById('talkInput')
    if(talkTextEl && talkTextEl.value.trim()){
      appendMessage('user', talkTextEl.value.trim())
    }
    if(chatModal) chatModal.classList.remove('hidden')
  }

  // wire a quick open from analyze result if button exists
  // Add a listener to a possible element with id 'openChatBtn' (renderAnalysis can add it later)
  const openChatBtn = document.getElementById('openChatBtn')
  if(openChatBtn) openChatBtn.addEventListener('click', openChat)

  if(chatSend){
    chatSend.addEventListener('click', async ()=>{
      const text = chatInput.value.trim()
      if(!text) return
      appendMessage('user', text)
      chatInput.value = ''
      appendMessage('assistant', '…')
      // fetch chat response
      try{
        const body = { messages: [{role:'user', content: text}] }
        const resp = await fetch(`${API_BASE}/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)})
        const data = await resp.json()
        // remove last '...' assistant placeholder
        if(chatMessages && chatMessages.lastChild) chatMessages.removeChild(chatMessages.lastChild)
        appendMessage('assistant', data.reply || data)
      }catch(err){
        if(chatMessages && chatMessages.lastChild) chatMessages.removeChild(chatMessages.lastChild)
        appendMessage('assistant', 'Sorry, chat failed. Please try again later.')
      }
    })
  }

  // Clear chat history button
  if(chatClear){
    chatClear.addEventListener('click', ()=>{
      if(chatMessages) chatMessages.innerHTML = ''
    })
  }
})

// Admin UI moved to admin.html — homepage no longer includes admin modal logic.
