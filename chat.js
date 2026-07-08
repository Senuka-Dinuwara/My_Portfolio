/* Chatbot (keyword-based) - separate file */
(() => {
  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  const chatbot = document.getElementById('chatbot');

  const TYPING_SPEED = 30; // ms per character (adjustable)
  let pendingSuggestion = null;
  let greeted = false;
  let greetingTimeout = null;
  let lastTopic = null;

  if (!toggle || !panel || !form || !input || !messages) return;

  function syncKeyboardViewport(){
    if (!window.visualViewport || !chatbot) return;
    const viewport = window.visualViewport;
    const keyboardOffset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
    chatbot.style.setProperty('--chat-keyboard-offset', `${Math.round(keyboardOffset)}px`);
    chatbot.style.setProperty('--chat-visible-height', `${Math.round(viewport.height)}px`);
  }

  function setPageScrollLock(locked){
    document.documentElement.classList.toggle('chat-scroll-lock', locked);
    document.body.classList.toggle('chat-scroll-lock', locked);
  }

  syncKeyboardViewport();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncKeyboardViewport);
    window.visualViewport.addEventListener('scroll', syncKeyboardViewport);
  }
  window.addEventListener('orientationchange', () => setTimeout(syncKeyboardViewport, 250));

  toggle.addEventListener('click', () => {
    const nowOpen = !panel.classList.contains('open');
    panel.classList.toggle('open');
    if (chatbot) chatbot.classList.toggle('chat-open', panel.classList.contains('open'));
    setPageScrollLock(panel.classList.contains('open'));
    panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true');
    if (panel.classList.contains('open')) {
      syncKeyboardViewport();
      input.focus();
    }
    // greet only when user opens the panel for the first time
    if (nowOpen && !greeted){
      greeted = true;
      if (greetingTimeout) clearTimeout(greetingTimeout);
      if (!messages.querySelector('.chat-bubble.bot')){
        greetingTimeout = setTimeout(() => {
          pushBot('Hi, I am Senuka\'s portfolio assistant. Ask me about his projects, skills, education, contact links, or a specific project like Security Vault.');
          greetingTimeout = null;
        }, 420);
      }
    }
  });
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    if (chatbot) chatbot.classList.remove('chat-open');
    setPageScrollLock(false);
    panel.setAttribute('aria-hidden','true');
  });

  input.addEventListener('focus', () => {
    syncKeyboardViewport();
    setTimeout(() => {
      syncKeyboardViewport();
      messages.scrollTop = messages.scrollHeight;
    }, 250);
  });
  input.addEventListener('blur', () => setTimeout(syncKeyboardViewport, 120));

  function extractProjects(){
    const list = [];
    document.querySelectorAll('.project-card').forEach(card => {
      const titleEl = card.querySelector('h3');
      const title = titleEl ? titleEl.textContent.trim() : 'Untitled';
      const descriptionEl = card.querySelector('p');
      const description = descriptionEl ? descriptionEl.textContent.trim() : '';
      const languageSpans = Array.from(card.querySelectorAll('.p-6 .flex span')).map(s => s.textContent.trim()).filter(Boolean);
      const badges = Array.from(card.querySelectorAll('.project-badge')).map(s => ({
        text: s.textContent.trim(),
        type: (s.dataset.type || '').trim()
      })).filter(b => b.text);
      let status = 'Unknown';
      let category = 'Unknown';
      badges.forEach(b => {
        const sl = `${b.text} ${b.type}`.toLowerCase();
        if (sl.includes('completed')) status = 'Completed';
        if (sl.includes('ongoing')) status = 'Ongoing';
        if (sl.includes('on hold') || sl.includes('onhold')) status = 'On Hold';
        if (sl.includes('personal')) category = 'Personal';
        if (sl.includes('individual')) category = 'Individual';
        if (sl.includes('group')) category = 'Group';
      });
      const links = Array.from(card.querySelectorAll('a[href^="http"]')).map(a => {
        const href = a.getAttribute('href');
        const icon = a.querySelector('i');
        const iconClass = icon ? icon.className : '';
        const label = iconClass.includes('github') ? 'GitHub' : 'Live link';
        return { label, href };
      });
      list.push({ title, description, status, category, languages: languageSpans, links });
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

  const educationRecords = [
    {
      id: 'uow',
      aliases: ['uow', 'westminster', 'university of westminster', 'university'],
      title: 'BSc (Hons) Computer Science',
      institution: 'University of Westminster',
      campus: 'IIT Campus',
      period: 'Sep 2024 - Present',
      status: 'Currently studying',
      structure: '2 semesters per year, usually 4-5 subjects per semester.',
      subjectsPlanned: 'Subjects and marks can be added later semester by semester.',
      subjects: [],
      achievements: []
    },
    {
      id: 'iit',
      aliases: ['iit', 'informatics institute of technology', 'foundation', 'foundation program'],
      title: 'Foundation Program',
      institution: 'Informatics Institute of Technology',
      campus: 'IIT Campus',
      period: 'Sep 2023 - May 2024',
      status: 'Completed with Distinction Pass',
      structure: '8+ subjects across 2 semesters.',
      subjectsPlanned: 'Foundation subjects, marks, and achievements can be added later.',
      subjects: [],
      achievements: []
    },
    {
      id: 'sumedha',
      aliases: ['sumedha', 'sumedha college', 'school', 'o/l', 'ol', 'ordinary level', 'gce o/l'],
      title: 'High School - GCE O/L',
      institution: 'Sumedha College, Gampaha',
      campus: '',
      period: '2011 - 2023',
      status: 'Completed',
      structure: 'GCE O/L completed with 9 subjects.',
      subjectsPlanned: 'The 9 O/L subjects, marks, and school achievements can be added later.',
      subjects: [
        { name: 'Buddhism', mark: 'S', status: 'Completed' },
        { name: 'Sinhala', mark: 'C', status: 'Completed' },
        { name: 'English', mark: 'A', status: 'Completed' },
        { name: 'Mathematics', mark: 'B', status: 'Completed' },
        { name: 'History', mark: 'C', status: 'Completed' },
        { name: 'Science', mark: 'C', status: 'Completed' },
        { name: 'English Literature', mark: 'W', status: 'Completed' },
        { name: 'Business & Accounting', mark: 'C', status: 'Completed' },
        { name: 'ICT', mark: 'A', status: 'Completed' }
      ],
      achievements: []
    }
  ];

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

  function normalizeText(value){
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9+#/. ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function splitLanguageNames(language){
    const raw = String(language || '').trim();
    if (!raw) return [];
    return raw.split(/[\/,]+/).map(part => part.trim()).filter(Boolean).concat(raw);
  }

  function projectSearchText(project){
    return normalizeText([
      project.title,
      project.description,
      project.status,
      project.category,
      project.languages.join(' '),
      project.links.map(link => link.href).join(' ')
    ].join(' '));
  }

  function knownLanguages(projects){
    const names = new Set();
    projects.forEach(project => {
      project.languages.forEach(language => {
        splitLanguageNames(language).forEach(name => names.add(name));
      });
    });
    ['JavaScript', 'JS', 'HTML', 'CSS', 'Web', 'Desktop GUI'].forEach(name => names.add(name));
    return Array.from(names).sort((a, b) => b.length - a.length);
  }

  function findMentionedLanguage(text, projects){
    const low = normalizeText(text);
    const aliases = {
      javascript: 'JS',
      js: 'JS',
      html: 'HTML',
      css: 'CSS',
      web: 'HTML',
      gui: 'Tkinter',
      desktop: 'Swing'
    };
    const aliasKey = Object.keys(aliases).find(key => low.includes(key));
    if (aliasKey) return aliases[aliasKey];
    return knownLanguages(projects).find(language => low.includes(normalizeText(language)));
  }

  function findProjectByQuestion(text, projects){
    const low = normalizeText(text);
    let best = null;
    let score = 0;

    projects.forEach(project => {
      const title = normalizeText(project.title);
      let current = 0;
      if (low.includes(title)) current += 20;

      const words = title.split(' ').filter(word => word.length > 2);
      words.forEach(word => {
        if (low.includes(word)) current += 4;
      });

      if (project.description && low.includes(normalizeText(project.description))) current += 5;
      if (current > score) {
        score = current;
        best = project;
      }
    });

    return score >= 4 ? best : null;
  }

  function formatProject(project, options = {}){
    const lines = [];
    lines.push(`${project.title} is ${project.description ? project.description.charAt(0).toLowerCase() + project.description.slice(1) : 'one of Senuka\'s listed portfolio projects'}.`);
    if (!options.onlyLanguages) {
      lines.push(`It is marked as ${project.status.toLowerCase()} and listed as a ${project.category.toLowerCase()} project.`);
    }
    if (project.languages.length) lines.push(`The main technologies shown are ${project.languages.join(', ')}.`);
    if (!options.onlyLanguages && project.links.length) {
      project.links.forEach(link => lines.push(`${link.label}: ${link.href}`));
    }
    return lines.join('\n');
  }

  function formatProjectList(projects, heading){
    if (!projects.length) return `${heading}\nI could not find a matching project in the portfolio yet. Try a different technology, status, or project name.`;
    return `${heading}\n\n- ${projects.map(project => formatProject(project)).join('\n\n- ')}`;
  }

  function projectAnswer(question, projects){
    const low = normalizeText(question);
    const isProjectFollowUp = /\bit\b|\bthat\b|\bthis\b|\bthem\b|\bthose\b|same project|its |their |language|tech|stack|status|link|github|demo|live|type|category/.test(low);
    const mentionedProject = findProjectByQuestion(question, projects) || (isProjectFollowUp && lastTopic && lastTopic.type === 'project' ? lastTopic.value : null);
    const mentionedLanguage = findMentionedLanguage(question, projects);

    const asksLanguage = /language|tech|technology|stack|built with|use|used|framework|tool/.test(low);
    const asksStatus = /status|complete|completed|ongoing|hold|progress|finished/.test(low);
    const asksLink = /link|github|repo|repository|demo|live|website|url/.test(low);
    const asksType = /personal|individual|group|team|type|category/.test(low);
    const asksDescription = /about|explain|describe|detail|what is|tell me/.test(low);
    const asksCount = /how many|count|number/.test(low);

    if (mentionedProject) {
      lastTopic = { type: 'project', value: mentionedProject };
      if (asksLanguage && !asksStatus && !asksLink && !asksType) {
        return `${mentionedProject.title} is built with ${mentionedProject.languages.join(', ') || 'technology that is not listed yet'} based on the portfolio card.`;
      }
      if (asksStatus && !asksLanguage && !asksLink && !asksType) {
        return `${mentionedProject.title} is currently marked as ${mentionedProject.status.toLowerCase()} in the portfolio.`;
      }
      if (asksType && !asksLanguage && !asksStatus && !asksLink) {
        return `${mentionedProject.title} is listed as a ${mentionedProject.category.toLowerCase()} project.`;
      }
      if (asksLink && !asksLanguage && !asksStatus && !asksType) {
        return mentionedProject.links.length
          ? `Yes, here are the links listed for ${mentionedProject.title}:\n${mentionedProject.links.map(link => `${link.label}: ${link.href}`).join('\n')}`
          : `${mentionedProject.title} does not have a public link listed in the portfolio yet.`;
      }
      return `Here is the useful summary for ${mentionedProject.title}:\n\n${formatProject(mentionedProject)}`;
    }

    let matches = projects.slice();
    if (mentionedLanguage) {
      const langNorm = normalizeText(mentionedLanguage);
      matches = matches.filter(project => project.languages.some(language => splitLanguageNames(language).some(name => normalizeText(name) === langNorm || normalizeText(name).includes(langNorm))));
    }
    if (/completed|finished/.test(low)) matches = matches.filter(project => project.status.toLowerCase() === 'completed');
    if (/ongoing|progress/.test(low)) matches = matches.filter(project => project.status.toLowerCase() === 'ongoing');
    if (/on hold|onhold|hold|paused/.test(low)) matches = matches.filter(project => project.status.toLowerCase() === 'on hold');
    if (/personal/.test(low)) matches = matches.filter(project => project.category.toLowerCase() === 'personal');
    if (/individual/.test(low)) matches = matches.filter(project => project.category.toLowerCase() === 'individual');
    if (/group|team/.test(low)) matches = matches.filter(project => project.category.toLowerCase() === 'group');

    if (asksCount) return `I found ${matches.length} matching project${matches.length === 1 ? '' : 's'} in Senuka's portfolio.`;
    if (mentionedLanguage || asksStatus || asksType || /project|portfolio|built|using|made/.test(low)) {
      const heading = mentionedLanguage ? `Projects using ${mentionedLanguage}:` : 'Matching projects:';
      return formatProjectList(matches, heading);
    }

    return null;
  }

  function profileAnswer(question){
    const low = normalizeText(question);
    if (/who is|about senuka|about me|summary|introduce|bio/.test(low)) {
      return 'Senuka Dinuwara is a second-year BSc Computer Science student at the University of Westminster through IIT Campus. He works with Python, Java, JavaScript, HTML/CSS, GUI apps, websites, and problem-solving projects.';
    }
    if (/skill|technology|tech stack|programming|language/.test(low)) {
      return 'Senuka highlights Python, Java, JavaScript, HTML/CSS, Tkinter, Swing, Flutter, and Dart across the portfolio projects.';
    }
    return null;
  }

  function certificatesAnswer(question, accounts){
    const low = normalizeText(question);
    if (!/certificate|certificates|certification|certifications|credential|credentials/.test(low)) return null;
    const linkedIn = accounts.linkedin || 'https://www.linkedin.com/in/senuka-dinuwara/';
    return `For Senuka's certificates and credentials, the best place to check is his LinkedIn profile because it can stay more up to date than this portfolio section.\n\nLinkedIn: ${linkedIn}`;
  }

  function findEducationRecord(question){
    const low = normalizeText(question);
    return educationRecords.find(record => record.aliases.some(alias => low.includes(normalizeText(alias)))) || null;
  }

  function formatSubjects(record){
    if (!record.subjects.length) return '';
    return record.subjects.map(subject => {
      const parts = [subject.name];
      if (subject.mark) parts.push(`Mark: ${subject.mark}`);
      return parts.join(' - ');
    }).join('\n');
  }

  function educationSpecificAnswer(question){
    const low = normalizeText(question);
    const asksEducation = /education|school|college|university|iit|uow|westminster|sumedha|subject|subjects|marks|semester|o\/l|ol|foundation/.test(low);
    if (!asksEducation) return null;

    const record = findEducationRecord(question);
    if (!record) return null;

    const lines = [
      `${record.title}`,
      `${record.institution}${record.campus ? ` (${record.campus})` : ''}`,
      `Period: ${record.period}`,
      `Status: ${record.status}`,
      `Structure: ${record.structure}`
    ];

    const subjects = formatSubjects(record);
    if (subjects) lines.push(`Subjects/marks:\n${subjects}`);

    if (record.achievements.length) {
      lines.push(`Achievements: ${record.achievements.join(', ')}`);
    }

    return lines.join('\n');
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
    const normalized = normalizeText(t);

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

    const certificateReply = certificatesAnswer(t, accounts);
    if (certificateReply) return certificateReply;

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
        if (el){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return `Sure, I have moved the page to the ${key.charAt(0).toUpperCase()+key.slice(1)} section.`; }
        return `I tried to open the ${key} section, but I cannot find it on this page.`;
      }
      return `I could not identify that section. You can ask me to open About, Projects, Contact, Education, Skills, Certificates, or Activities.`;
    }

    const educationReply = educationSpecificAnswer(t);
    if (educationReply) return educationReply;

    const projectReply = projectAnswer(t, projects);
    if (projectReply) return projectReply;

    const profileReply = profileAnswer(t);
    if (profileReply) return profileReply;

    const intents = detectIntents(t);
    const intent = intents[0] || null;

    // fuzzy suggestion when no intent matched
    if (!intent){
      const keywords = ['name','age','education','projects','accounts'];
      let best = null; let bestD = Infinity;
      for (const k of keywords){ const d = levenshtein(low, k); if (d < bestD){ bestD = d; best = k; }}
      // accept small typos: 1 edit, or 2 edits for longer words
      if (best && (bestD <= 1 || (bestD <= 2 && best.length > 4))){
        pendingSuggestion = best;
        return `I think you might mean "${best}". Reply yes and I will answer that.`;
      }
    }

    if (!intent) {
      return 'I can answer from Senuka\'s portfolio, but I need a little more detail. Try asking about a project, skill, education, contact link, or something like "Which Java projects are completed?"';
    }

    if (intent === 'name') return `His full name is ${profile.name}.`;
    if (intent === 'age'){
      const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
      return (age === null || age === undefined) ? 'I do not see an age listed in the current portfolio data.' : `${profile.name} is ${age} years old.`;
    }
    if (intent === 'education'){
      const cleaned = profile.education.map(entry => {
        const parts = entry.split(/\s*[—–-]\s*/).map(s => s.trim()).filter(Boolean);
        if (parts.length === 1) return parts[0];
        return `${parts[0]}\n${parts.slice(1).join(' - ')}`;
      });
      return `EDUCATION_TIMELINE:\n${cleaned.join('\n---\n')}`;
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
      if (low.includes('github')) return accounts.github ? `You can find Senuka on GitHub here: ${accounts.github}` : 'I do not see a GitHub link listed right now.';
      if (low.includes('linkedin')) return accounts.linkedin ? `Here is Senuka's LinkedIn profile: ${accounts.linkedin}` : 'I do not see a LinkedIn link listed right now.';
      if (low.includes('email')) return accounts.email ? `You can contact Senuka by email at ${accounts.email}.` : 'I do not see an email address listed right now.';
      // otherwise return all available links
      const parts = [];
      if (accounts.github) parts.push(`GitHub: ${accounts.github}`);
      if (accounts.linkedin) parts.push(`LinkedIn: ${accounts.linkedin}`);
      if (accounts.email) parts.push(`Email: ${accounts.email}`);
      return parts.length ? `Here are the contact links I found:\n\n${parts.join('\n\n')}` : 'I do not see public contact links on this page right now.';
    }

    if (intent === 'projects'){
      return formatProjectList(projects, 'Here are the projects currently listed in Senuka\'s portfolio:');

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

    if (rawText.startsWith('EDUCATION_TIMELINE:')){
      const items = rawText
        .replace('EDUCATION_TIMELINE:', '')
        .split(/\n---\n/)
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => {
          const parts = item.split(/\r?\n/).map(part => part.trim()).filter(Boolean);
          return {
            title: parts[0] || 'Education',
            detail: parts.slice(1).join(' '),
          };
        });
      if (items.length) tokens.push({ type: 'educationTimeline', items });
      return tokens;
    }

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
          let textNode = document.createTextNode(''); parent.appendChild(textNode);
          const iv = setInterval(()=>{
            if (i >= text.length){ clearInterval(iv); nextToken(); return; }
            const ch = text.charAt(i++);
            if (ch === '\n') {
              parent.appendChild(document.createElement('br'));
              textNode = document.createTextNode('');
              parent.appendChild(textNode);
            } else {
              textNode.textContent += ch;
            }
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
        } else if (tok.type === 'educationTimeline'){
          const timeline = document.createElement('div');
          timeline.className = 'education-timeline';
          parent.appendChild(timeline);

          const title = document.createElement('div');
          title.className = 'education-timeline-title';
          title.textContent = 'Education timeline';
          timeline.appendChild(title);

          tok.items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'education-timeline-item';
            row.style.animationDelay = `${index * 90}ms`;

            const marker = document.createElement('span');
            marker.className = 'education-timeline-marker';
            marker.setAttribute('aria-hidden', 'true');

            const body = document.createElement('div');
            body.className = 'education-timeline-body';

            const heading = document.createElement('div');
            heading.className = 'education-timeline-heading';
            heading.textContent = item.title;

            const detail = document.createElement('div');
            detail.className = 'education-timeline-detail';
            detail.textContent = item.detail;

            body.appendChild(heading);
            if (item.detail) body.appendChild(detail);
            row.appendChild(marker);
            row.appendChild(body);
            timeline.appendChild(row);
          });

          requestAnimationFrame(() => {
            timeline.querySelectorAll('.education-timeline-item').forEach(item => item.classList.add('show'));
          });
          messages.scrollTop = messages.scrollHeight;
          nextToken();
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

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const q = input.value && input.value.trim();
    if(!q) return;
    pushUser(q);
    input.value='';
    const delay = Math.min(900, 260 + q.length * 12);
    setTimeout(()=>{ const r = getResponse(q); pushBot(r); }, delay);
  });

  input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true})); }});

  // do not auto-open or auto-send on page load — greeting shown when panel opened

})();
