/* Chatbot (keyword-based) - separate file */
(() => {
  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  const TYPING_SPEED = 30; // ms per character (adjustable)
  let pendingSuggestion = null;
  let greeted = false;
  let greetingTimeout = null;

  if (!toggle || !panel || !form || !input || !messages) return;

  toggle.addEventListener('click', () => {
    const nowOpen = !panel.classList.contains('open');
    panel.classList.toggle('open');
    panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true');
    if (panel.classList.contains('open')) input.focus();
    // greet only when user opens the panel for the first time
    if (nowOpen && !greeted){
      greeted = true;
      if (greetingTimeout) clearTimeout(greetingTimeout);
      if (!messages.querySelector('.chat-bubble.bot')){
        greetingTimeout = setTimeout(() => {
          pushBot('Hi ask about Senuka:');
          greetingTimeout = null;
        }, 420);
      }
    }
  });
  closeBtn.addEventListener('click', () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); });

  function extractProjects(){
    const list = [];
    document.querySelectorAll('.project-card').forEach(card => {
      const titleEl = card.querySelector('h3');
      const title = titleEl ? titleEl.textContent.trim() : 'Untitled';
      const spans = Array.from(card.querySelectorAll('span')).map(s => s.textContent.trim()).filter(Boolean);
      const statusCandidates = ['completed','ongoing','on hold','onhold'];
      let status = 'Unknown';
      spans.forEach(s => {
        const sl = s.toLowerCase();
        if (sl.includes('completed')) status = 'Completed';
        if (sl.includes('ongoing')) status = 'Ongoing';
        if (sl.includes('on hold') || sl.includes('onhold')) status = 'On Hold';
      });
      const languages = spans.filter(s => !statusCandidates.includes(s.toLowerCase()));
      // find first external link inside card (github / live demo)
      const a = card.querySelector('a[href^="http"]');
      const url = a ? a.getAttribute('href') : null;
      list.push({ title, status, languages, url });
    });
    return list;
  }

  function extractAccounts(){
    const accounts = {};
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href'); if (!href) return;
      if (href.includes('github.com')) accounts.github = href;
      if (href.includes('linkedin.com')) accounts.linkedin = href;
      if (href.startsWith('mailto:')) accounts.email = href.replace('mailto:','');
    });
    return accounts;
  }

  const profile = {
    name: 'Senuka Dinuwara',
    birthDate: '2006-03-28',
    education: [
      'BSc (Hons) Computer Science — University of Westminster (Sep 2024 – Present)',
      'Foundation Program — Informatics Institute of Technology (Sep 2023 – May 2024)',
      'High School (GCE O/L) — Sumedha College, Gampaha (2011 – 2023)'
    ]
  };

  function calculateAge(birthDateStr){
    if (!birthDateStr) return null;
    const bd = new Date(birthDateStr);
    if (isNaN(bd)) return null;
    const now = new Date();
    let age = now.getFullYear() - bd.getFullYear();
    const m = now.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
    return age;
  }

  function detectIntents(text){
    const t = text.toLowerCase();
    const intents = new Set();
    if (/\bname\b|who are you|what('?|\s)is your name/.test(t)) intents.add('name');
    if (/\bage\b|how old|years old/.test(t)) intents.add('age');
    if (/education|school|degree|university|college/.test(t)) intents.add('education');
    if (/github|linkedin|email|account|contact/.test(t)) intents.add('accounts');
    if (/project|projects|ongoing|completed|on hold|onhold/.test(t)) intents.add('projects');
    return Array.from(intents);
  }

  // simple Levenshtein distance for small fuzzy matching
  function levenshtein(a, b){
    a = String(a || '').toLowerCase(); b = String(b || '').toLowerCase();
    const m = a.length, n = b.length; if (m === 0) return n; if (n === 0) return m;
    const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
    for (let i=0;i<=m;i++) dp[i][0]=i;
    for (let j=0;j<=n;j++) dp[0][j]=j;
    for (let i=1;i<=m;i++){
      for (let j=1;j<=n;j++){
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
      }
    }
    return dp[m][n];
  }

  function getResponse(raw){
    const t = (raw||'').trim();
    const low = t.toLowerCase();
    const projects = extractProjects();
    const accounts = extractAccounts();

    // If user is responding to a previous suggestion
    if (pendingSuggestion){
      if (/(^|\s)(yes|y|yeah|yep|correct|sure|ok|okay)(\s|$)/i.test(low)){
        const suggested = pendingSuggestion; pendingSuggestion = null;
        return getResponse(suggested);
      }
      if (/(^|\s)(no|n|nope|nah)(\s|$)/i.test(low)){
        pendingSuggestion = null;
        return 'Okay — what did you mean? Try: name, age, education, projects, or accounts.';
      }
    }

    // Navigation commands: "go to projects", "open about", "scroll to contact" etc.
    const navMatch = t.match(/(?:go to|open|show|scroll to|take me to|navigate to)\s+([a-zA-Z ]+)/i);
    if (navMatch){
      const target = navMatch[1].trim().toLowerCase();
      const map = {
        'home': '#home', 'about':'#about', 'education':'#education', 'skills':'#skills', 'projects':'#projects', 'certificates':'#certificates', 'activities':'#activities', 'contact':'#contact'
      };
      // allow short forms like 'certs' or 'projects section'
      let key = Object.keys(map).find(k => target.includes(k));
      if (!key){
        // try matching common synonyms
        if (target.includes('cert')) key='certificates';
        if (target.includes('edu')) key='education';
      }
      if (key){
        const sel = map[key];
        const el = document.querySelector(sel);
        if (el){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return `Navigating to ${key.charAt(0).toUpperCase()+key.slice(1)}.`; }
        return `Can't find the ${key} section on this page.`;
      }
      return `I couldn't identify that section. Try: About, Projects, Contact, Education.`;
    }

    const intents = detectIntents(t);
    if (intents.length > 1) return 'Please ask about one topic at a time: name, age, education, projects, or accounts.';
    const intent = intents[0] || null;

    // fuzzy suggestion when no intent matched
    if (!intent){
      const keywords = ['name','age','education','projects','accounts'];
      let best = null; let bestD = Infinity;
      for (const k of keywords){ const d = levenshtein(low, k); if (d < bestD){ bestD = d; best = k; }}
      // accept small typos: 1 edit, or 2 edits for longer words
      if (best && (bestD <= 1 || (bestD <= 2 && best.length > 4))){
        pendingSuggestion = best;
        return `Did you mean "${best}"? Reply 'yes' to confirm.`;
      }
    }

    if (intent === 'name') return profile.name;
    if (intent === 'age'){
      const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
      return (age === null || age === undefined) ? 'Not specified' : `${age} years old`;
    }
    if (intent === 'education'){
      // split entries on em-dash/en-dash/hyphen and render as two lines: degree then institution+dates
      const cleaned = profile.education.map(entry => {
        const parts = entry.split(/\s*[—–-]\s*/).map(s=>s.trim()).filter(Boolean);
        if (parts.length === 1) return parts[0];
        const degree = parts[0];
        const rest = parts.slice(1).join(' — ');
        return `${degree}\n${rest}`;
      });
      // prefix with a header and keep each item as a bullet-list item
      return `Education:\n\n• ${cleaned.join('\n\n• ')}`;
    }
    if (intent === 'accounts'){
      // if asks for specific service, return that only
      if (low.includes('github')) return accounts.github || 'GitHub not found';
      if (low.includes('linkedin')) return accounts.linkedin || 'LinkedIn not found';
      if (low.includes('email')) return accounts.email || 'Email not found';
      // otherwise return all available links
      const parts = [];
      if (accounts.github) parts.push(accounts.github);
      if (accounts.linkedin) parts.push(accounts.linkedin);
      if (accounts.email) parts.push(accounts.email);
      return parts.length ? parts.join('\n') : 'No public account links found on this page.';
    }

    if (intent === 'projects'){
      // helper to format a single project line (single-line, includes url if present)
      function fmt(p){
        const langs = (p.languages && p.languages.length) ? p.languages.join(', ') : '';
        const lines = [];
        lines.push(p.title);
        if (p.status) lines.push(`Status: ${p.status}`);
        if (langs) lines.push(`Languages: ${langs}`);
        if (p.url) lines.push(`Link: ${p.url}`);
        return lines.join('\n');
      }

      // status-specific
      if (low.includes('ongoing')){
        const matches = projects.filter(p=>p.status.toLowerCase().includes('ongoing'));
        return matches.length ? ('Projects:\n\n' + matches.map(fmt).join('\n\n• ')) : 'No ongoing projects.';
      }
      if (low.includes('completed')){
        const matches = projects.filter(p=>p.status.toLowerCase().includes('completed'));
        return matches.length ? ('Projects:\n\n' + matches.map(fmt).join('\n\n• ')) : 'No completed projects.';
      }
      if (low.includes('on hold') || low.includes('onhold')){
        const matches = projects.filter(p=>p.status.toLowerCase().includes('on hold'));
        return matches.length ? ('Projects:\n\n' + matches.map(fmt).join('\n\n• ')) : 'No on-hold projects.';
      }
      // language-specific
      const allLangs = [...new Set(projects.flatMap(p=>p.languages.map(l=>l.toLowerCase())))];
      for (const lang of allLangs){ if (low.includes(lang)){
        const matches = projects.filter(p=>p.languages.some(l=>l.toLowerCase().includes(lang)));
        return matches.length ? ('Projects:\n\n' + matches.map(fmt).join('\n\n• ')) : `No projects using ${lang}.`;
      }}
      // general: list titles with status/lang/url
      return projects.length ? ('Projects:\n\n• ' + projects.map(fmt).join('\n\n• ')) : 'No projects found.';
    }

    return 'Sorry — I only answer questions about Senuka: name, age, education, projects, or accounts.';
  }

  function pushBot(text){
    const cleaned = (text || '').replace(/\n{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '');
    const pendingBot = messages.querySelector('.chat-bubble.bot.typing[data-pending-text]');
    if (pendingBot && pendingBot.dataset.pendingText === cleaned) return;

    const firstBot = messages.querySelector('.chat-bubble.bot:not(.typing)');
    if (firstBot && firstBot.textContent.trim() === cleaned) return;

    const lastBot = messages.querySelector('.chat-bubble.bot:last-child:not(.typing)');
    if (lastBot && lastBot.textContent.trim() === cleaned) return;

    const b = document.createElement('div'); b.className='chat-bubble bot typing';
    b.dataset.pendingText = cleaned;
    // content container where typing appears
    const content = document.createElement('div'); content.className = 'chat-content';
    b.appendChild(content);

    // typing indicator inside content
    const typing = document.createElement('div'); typing.className = 'typing-indicator';
    typing.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="caret"></span>';
    content.appendChild(typing);

    messages.appendChild(b);
    // make bubble visible immediately so typing is seen
    requestAnimationFrame(()=> b.classList.add('show'));
    messages.scrollTop = messages.scrollHeight;

    const tokens = tokenizeMessage(cleaned);
    typeTokensInto(content, tokens, TYPING_SPEED).then(()=>{
      // remove typing indicator and typing class
      typing.remove();
      b.classList.remove('typing');
      delete b.dataset.pendingText;
      messages.scrollTop = messages.scrollHeight;
    });
  }
  function pushUser(text){ const u = document.createElement('div'); u.className='chat-bubble user'; appendTextWithLinks(u, text); messages.appendChild(u); requestAnimationFrame(()=> u.classList.add('show')); messages.scrollTop = messages.scrollHeight; }
  // Tokenize text into [{type:'text'|'link'|'email', content, href}]
  function tokenizeMessage(text){
    const tokens = [];
    const rawText = String(text || '');

    // If text contains bullet markers (•) used for lists, parse as a bulletList token.
    // This handles the first item and multiline entries reliably.
    const lines = rawText.split(/\r?\n/);
    const headLines = [];
    const items = [];

    lines.forEach(line => {
      if (line.trim().startsWith('•')){
        items.push(line.replace(/^\s*•\s*/, '').trim());
      } else if (items.length){
        items[items.length - 1] += '\n' + line;
      } else {
        headLines.push(line);
      }
    });

    const urlRe = /(https?:\/\/[^\s]+)/i;
    const emailRe = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i;

    if (headLines.length && !items.length){
      const head = headLines.join('\n');
      if (head.trim()){
        const parts = head.split(urlRe).filter(Boolean);
        parts.forEach(part => {
          if (urlRe.test(part)) tokens.push({ type: 'link', href: part, label: part });
          else {
            const sub = part.split(emailRe).filter(Boolean);
            sub.forEach(s => {
              if (emailRe.test(s)) tokens.push({ type: 'email', href: `mailto:${s}`, label: s });
              else tokens.push({ type: 'text', content: s });
            });
          }
        });
      }
      return tokens;
    }
    if (items.length){
      const cleanedItems = items.map(item => item.replace(/^[\s\u2022]+/, '').trim()).filter(Boolean);
      if (cleanedItems.length) tokens.push({ type: 'bulletList', items: cleanedItems });
      return tokens;
    }

    return tokens;
  }

  // Type tokens into parent element with per-character effect
  function typeTokensInto(parent, tokens, speed){
    return new Promise(resolve => {
      let ti = 0;
      function nextToken(){
        if (ti >= tokens.length) return resolve();
        const tok = tokens[ti++];
        if (tok.type === 'text'){
          let i = 0; const text = tok.content;
          const textNode = document.createTextNode(''); parent.appendChild(textNode);
          const iv = setInterval(()=>{
            if (i >= text.length){ clearInterval(iv); nextToken(); return; }
            const ch = text.charAt(i++);
            if (ch === '\n') parent.appendChild(document.createElement('br'));
            else textNode.textContent += ch;
            messages.scrollTop = messages.scrollHeight;
          }, speed);
        } else if (tok.type === 'link' || tok.type === 'email'){
          const a = document.createElement('a'); a.href = tok.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.appendChild(a);
          let i = 0; const label = tok.label;
          const iv = setInterval(()=>{
            if (i >= label.length){ clearInterval(iv); nextToken(); return; }
            a.textContent += label.charAt(i++);
            messages.scrollTop = messages.scrollHeight;
          }, speed);
        } else if (tok.type === 'bulletList'){
          const listContainer = document.createElement('div'); listContainer.className = 'bullet-list'; parent.appendChild(listContainer);
          let idx = 0;
          const urlRegex = /(https?:\/\/[^\s]+)/i;
          function typeItem(){
            if (idx >= tok.items.length){ nextToken(); return; }
            const rawText = tok.items[idx++];
            const itemEl = document.createElement('div'); itemEl.className = 'edu-item'; listContainer.appendChild(itemEl);
            const parts = rawText.split(urlRegex).filter(Boolean);
            let partIndex = 0;
            function typePart(){
              if (partIndex >= parts.length){
                setTimeout(typeItem, 120);
                return;
              }
              const part = parts[partIndex++];
              if (urlRegex.test(part)){
                const a = document.createElement('a'); a.href = part; a.target = '_blank'; a.rel = 'noopener noreferrer'; itemEl.appendChild(a);
                let k = 0;
                const iv3 = setInterval(()=>{
                  if (k >= part.length){ clearInterval(iv3); typePart(); return; }
                  a.textContent += part.charAt(k++);
                  messages.scrollTop = messages.scrollHeight;
                }, speed);
              } else {
                let textNode = document.createTextNode('');
                itemEl.appendChild(textNode);
                let k = 0;
                const iv4 = setInterval(()=>{
                  if (k >= part.length){ clearInterval(iv4); typePart(); return; }
                  const ch = part.charAt(k++);
                  if (ch === '\n'){
                    itemEl.appendChild(document.createElement('br'));
                    textNode = document.createTextNode('');
                    itemEl.appendChild(textNode);
                  } else {
                    textNode.textContent += ch;
                  }
                  messages.scrollTop = messages.scrollHeight;
                }, speed);
              }
            }
            itemEl.textContent = '• ';
            typePart();
          }
          typeItem();
        }
      }
      nextToken();
    });
  }

  // Convert URLs/emails into clickable anchor nodes and append to parent
  function appendTextWithLinks(parent, text){
    // Simple combined regex for URLs and emails
      const urlRegex = /https?:\/\/[^\s]+/i;
      const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i;

      function appendTextNodesWithBreaks(p, str){
        const lines = str.split('\n');
        lines.forEach((ln, idx) => {
          if (ln.length) p.appendChild(document.createTextNode(ln));
          if (idx < lines.length - 1) p.appendChild(document.createElement('br'));
        });
      }

      function appendLinkWithBreaks(p, href, label, isMail){
        const lines = label.split('\n');
        lines.forEach((ln, idx) => {
          if (ln.length){
            const a = document.createElement('a');
            a.textContent = ln;
            a.href = isMail ? `mailto:${ln}` : href;
            if (!isMail){ a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            p.appendChild(a);
          }
          if (idx < lines.length - 1) p.appendChild(document.createElement('br'));
        });
      }

      const urlSplit = text.split(/(https?:\/\/[^\s]+)/i).filter(Boolean);
      urlSplit.forEach(part => {
        if (/^https?:\/\//i.test(part)){
          appendLinkWithBreaks(parent, part, part, false);
        } else {
          const subParts = part.split(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i).filter(Boolean);
          subParts.forEach(s => {
            if (emailRegex.test(s)){
              appendLinkWithBreaks(parent, `mailto:${s}`, s, true);
            } else {
              appendTextNodesWithBreaks(parent, s);
            }
          });
        }
      });
  }

  form.addEventListener('submit', (e)=>{ e.preventDefault(); const q = input.value && input.value.trim(); if(!q) return; pushUser(q); input.value=''; setTimeout(()=>{ const r = getResponse(q); pushBot(r); }, 250); });

  input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true})); }});

  // do not auto-open or auto-send on page load — greeting shown when panel opened

})();
