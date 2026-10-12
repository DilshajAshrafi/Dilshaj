/**
 * Dilshaj Ashrafi — Full-Stack Interactive Frontend & API Client Engine
 * Connects with Flask Backend & SQLite Database, handles animations, CLI terminal, and Gmail dispatch
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global backend connection state
  let isBackendLive = false;

  // --- 1. Background Interactive Constellation Canvas ---
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    const particleCount = Math.min(Math.floor(width / 22), 65);
    const mouse = { x: null, y: null, maxDistance: 130 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 1.8 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.maxDistance) {
            const force = (mouse.maxDistance - dist) / mouse.maxDistance;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }
      draw(theme) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'light' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.6)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(isLight ? 'light' : 'dark');

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 110) * (isLight ? 0.12 : 0.2);
            ctx.strokeStyle = isLight ? `rgba(99, 102, 241, ${alpha})` : `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    initParticles();
    animate();
  }

  // --- 2. Typewriter Effect ---
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const roles = [
      'Full-Stack AI Engineer',
      'AgriTech Innovator',
      'Modern Web Developer',
      'Python & ML Enthusiast',
      'Problem Solver'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeLoop() {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        typingSpeed = 45;
      } else {
        typewriterEl.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        isDeleting = true;
        typingSpeed = 1800;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typingSpeed = 400;
      }

      setTimeout(typeLoop, typingSpeed);
    }
    typeLoop();
  }

  // --- 3. Dark / Light Theme Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('da_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'light') {
      themeToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
      `;
      themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      themeToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
      `;
      themeToggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  }

  updateThemeIcon(storedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('da_theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  // --- 4. Navigation Header Scroll & Active Section Spy ---
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let currentSectionId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // --- 5. Mobile Navigation Menu Toggle ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // --- 6. Skills Category Filter ---
  const filterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 7. Toast Notification Utility ---
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // --- 8. Copy to Clipboard ---
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetText = btn.getAttribute('data-copy');
      if (targetText) {
        navigator.clipboard.writeText(targetText).then(() => {
          showToast(`✓ Copied: ${targetText}`);
        }).catch(() => {
          const tempInput = document.createElement('input');
          tempInput.value = targetText;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast(`✓ Copied: ${targetText}`);
        });
      }
    });
  });

  // --- 9. Backend Health & Live Sync Engine ---
  const backendPill = document.getElementById('backend-status-pill');
  const backendText = document.getElementById('backend-status-text');

  async function checkBackendStatus() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        isBackendLive = true;
        if (backendText) {
          backendText.innerHTML = `🟢 Full-Stack Engine Online <span style="opacity:0.75; font-size:0.75rem;">(Flask + SQLite)</span>`;
        }
        if (backendPill) {
          backendPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          backendPill.style.background = 'rgba(16, 185, 129, 0.12)';
        }
        loadProjectLikes();
      }
    } catch (err) {
      isBackendLive = false;
      if (backendText) {
        backendText.textContent = `Open to Opportunities & Collaborations`;
      }
    }
  }

  checkBackendStatus();

  // --- 10. Real-Time Project Likes System ---
  async function loadProjectLikes() {
    try {
      const res = await fetch('/api/projects/likes');
      if (res.ok) {
        const data = await res.json();
        if (data.projects) {
          for (const [projId, stat] of Object.entries(data.projects)) {
            const counterEl = document.getElementById(`likes-${projId}`);
            if (counterEl) {
              counterEl.textContent = stat.likes;
            }
          }
        }
      }
    } catch (err) {
      console.log('Using static like counters');
    }
  }

  document.querySelectorAll('.project-like-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const projId = btn.getAttribute('data-project');
      const counterEl = document.getElementById(`likes-${projId}`);

      btn.classList.add('liked');
      const heart = btn.querySelector('.heart-icon');
      if (heart) {
        heart.style.transform = 'scale(1.4)';
        setTimeout(() => { heart.style.transform = 'scale(1)'; }, 250);
      }

      if (isBackendLive) {
        try {
          const res = await fetch('/api/projects/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: projId })
          });
          if (res.ok) {
            const data = await res.json();
            if (counterEl) counterEl.textContent = data.likes;
            showToast(`❤️ Liked! Persisted in database.`);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (counterEl) {
        const curr = parseInt(counterEl.textContent, 10) || 0;
        counterEl.textContent = curr + 1;
        showToast(`❤️ Liked!`);
      }
    });
  });

  // --- 11. Full-Stack Contact Form (Dispatches to Gmail & SQLite) ---
  const contactForm = document.getElementById('contact-form');
  const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        showToast('⚠️ Please fill in all required fields.');
        return;
      }

      // Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Delivering to Gmail...</span>`;
      }

      // Default Gmail compose fallback URL
      let gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=dilshajashrafi@gmail.com&su=${encodeURIComponent('Portfolio Message from ' + name + ': ' + (subject || 'Inquiry'))}&body=${encodeURIComponent('Hello Dilshaj,\n\nName: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;

      if (isBackendLive) {
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
          });

          const resData = await response.json();

          if (response.ok && resData.success) {
            if (resData.gmail_compose_url) {
              gmailComposeUrl = resData.gmail_compose_url;
            }

            if (resData.email_sent) {
              showToast(`🎉 Message delivered directly to Dilshaj's Gmail!`);
            } else {
              showToast(`✓ Message recorded! Opening Gmail to dispatch...`);
              window.open(gmailComposeUrl, '_blank');
            }
            contactForm.reset();
            return;
          }
        } catch (err) {
          console.error('Backend submission failed, opening Gmail directly', err);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Send Directly to Gmail</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
          }
        }
      }

      // If backend offline, open direct Gmail compose tab
      showToast('Opening Gmail directly to send message...');
      window.open(gmailComposeUrl, '_blank');
      contactForm.reset();
    });
  }

  // --- 12. Newsletter Subscription ---
  const subscribeForm = document.getElementById('subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('subscribe-email');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email) return;

      if (isBackendLive) {
        try {
          const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          showToast(data.message || 'Subscribed successfully!');
          if (res.ok) emailInput.value = '';
          return;
        } catch (err) {
          console.error(err);
        }
      }

      showToast('✓ Thanks for subscribing! You will receive future project updates.');
      emailInput.value = '';
    });
  }

  // --- 13. Interactive Terminal Engine ("Dilshaj CLI") ---
  const terminalBody = document.getElementById('terminal-body');
  const terminalInput = document.getElementById('terminal-input');
  const terminalChips = document.querySelectorAll('.terminal-chip-btn');

  const cliLocalCommands = {
    help: () => `Available commands:
  • about      - Learn about Dilshaj Ashrafi
  • skills     - Core technical capabilities & proficiencies
  • projects   - Showcase of flagship projects & systems
  • kisaan     - Deep dive into Kisaan Sathi Agricultural AI
  • contact    - Get email, phone & social links
  • stats      - Query live database metrics
  • db         - Check SQLite database status
  • clear      - Clear terminal window
  • date       - Show current system date & time
  • whoami     - Display visitor identity profile`,

    about: () => `Dilshaj Ashrafi
Role: Full-Stack AI Engineer & Problem Solver
Passion: Building intelligent software systems that solve real human challenges.
Highlights:
- Co-architected Kisaan Sathi (Smart Agricultural advisory platform).
- Deep focus on AI agents, modern web interfaces, and scalable full-stack pipelines.
- Core philosophy: Math & data rigor + high-speed product engineering.`,

    skills: () => `Technical Proficiencies:
• Artificial Intelligence: LLM Integration, Prompt Systems, Conversational AI
• Languages: Python, JavaScript (ES6+), C Language, SQL
• Web & Frontend: Responsive UI, Modern CSS/HTML5, Dynamic SPAs, Glassmorphism
• Backend & APIs: Flask 3, Node.js, REST APIs, SQLite Persistent Engine
• Databases & Tools: MySQL, SQLite, Git/GitHub, Linux/Terminal, Data Structures & Algorithms`,

    projects: () => `Featured Engineering Projects:
1. [Kisaan Sathi] - AI Smart Agriculture Advisory & Care Portal
2. [AI Assistant Engine] - Context-aware Conversational System
3. [Data Science & Analytics Toolkit] - Statistical models & visual analytics
4. [C High-Performance Suite] - Algorithmic optimizations & data structures
(Type 'kisaan' to learn more about the flagship project)`,

    kisaan: () => `[Project Spotlight: Kisaan Sathi]
Status: Live in Production • High Community Impact
Website: https://kissansathiindia.vercel.app/
Summary:
- Comprehensive agricultural advisory platform built for farmers.
- Features: AI-guided crop disease diagnosis, soil care, irrigation support, & government scheme navigator.
- Technology: JavaScript, Node.js/Flask, AI API services, responsive multilingual UI.
- Impact: Democratizing agronomist-grade guidance directly into the hands of farmers.`,

    contact: () => `Direct Contact Information:
• Email:     dilshajashrafi@gmail.com
• Phone:     +91 8292992959
• GitHub:    https://github.com/DilshajAshrafi
• Instagram: https://www.instagram.com/dilshaj_ashrafi2
• Location:  India
• Status:    Available for full-time roles & innovative AI collaborations`,

    quote: () => `"Any sufficiently advanced technology is indistinguishable from magic. Let's build the magic together." — Arthur C. Clarke`,

    date: () => `Current Local Time: ${new Date().toLocaleString()}`,

    whoami: () => `guest@dilshaj-ashrafi-fullstack: You are an esteemed visitor exploring Dilshaj's portfolio.`
  };

  function appendTerminalLine(command, output, isError = false) {
    if (!terminalBody) return;

    const cmdLine = document.createElement('div');
    cmdLine.className = 'terminal-line';
    cmdLine.innerHTML = `<span class="terminal-prompt">visitor@dilshaj:~$</span> <span>${escapeHtml(command)}</span>`;
    terminalBody.appendChild(cmdLine);

    if (output) {
      const outLine = document.createElement('div');
      outLine.className = `terminal-output ${isError ? 'error' : 'info'}`;
      outLine.textContent = output;
      terminalBody.appendChild(outLine);
    }

    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  async function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      terminalBody.innerHTML = `
        <div class="terminal-line">
          <span class="terminal-prompt">visitor@dilshaj:~$</span>
          <span class="terminal-output info">Terminal cleared. Type 'help' to see available commands.</span>
        </div>
      `;
      return;
    }

    // Try backend evaluation if live
    if (isBackendLive) {
      try {
        const res = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.output) {
            appendTerminalLine(rawCmd, data.output);
            return;
          }
        }
      } catch (err) {
        console.log('Falling back to local terminal execution');
      }
    }

    // Local evaluation
    if (cliLocalCommands[cmd]) {
      appendTerminalLine(rawCmd, cliLocalCommands[cmd]());
    } else {
      appendTerminalLine(rawCmd, `Command not recognized: '${cmd}'. Type 'help' for a list of valid commands.`, true);
    }
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        executeCommand(val);
        terminalInput.value = '';
      }
    });
  }

  terminalChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      executeCommand(cmd);
    });
  });

  // --- 14. Project Details Modal System ---
  const modalOverlay = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close');

  const projectDetailsMap = {
    kisaan: {
      title: '🌾 Kisaan Sathi — Smart Farmer AI Advisory Platform',
      content: `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <p style="font-size:1.05rem; line-height:1.7; color:var(--text-secondary);">
            <strong>Kisaan Sathi</strong> is a smart agricultural digital platform co-engineered by <strong>Dilshaj Ashrafi</strong> designed to empower farmers with timely crop consultation, automated irrigation recommendations, soil and pest diagnosis, and government subsidy information.
          </p>
          <div style="background:var(--bg-tertiary); padding:1rem 1.25rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-indigo);">
            <h4 style="margin-bottom:0.5rem; color:var(--text-primary);">Key Architectural Innovations:</h4>
            <ul style="padding-left:1.25rem; color:var(--text-secondary); line-height:1.6; display:flex; flex-direction:column; gap:0.4rem;">
              <li><strong>Interactive AI Agricultural Assistant:</strong> Instant chat interface providing guidance on crop diseases, fertilizers, and seasonal planting advice.</li>
              <li><strong>Multilingual Accessibility:</strong> Designed for vernacular accessibility so farmers of all linguistic backgrounds can comfortably navigate and resolve issues.</li>
              <li><strong>Specialized Diagnostic Modules:</strong> Dedicated pages for Soil & Pest Care, Irrigation Support, Crop Consultation, and Government Scheme Guidance.</li>
            </ul>
          </div>
          <div>
            <h4 style="margin-bottom:0.5rem; color:var(--text-primary);">Technology Stack:</h4>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
              <span class="tech-chip">JavaScript (ES6+)</span>
              <span class="tech-chip">Flask / Node.js</span>
              <span class="tech-chip">HTML5 / CSS3</span>
              <span class="tech-chip">AI API Services</span>
              <span class="tech-chip">SQLite 3</span>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem; margin-top:0.5rem;">
            <a href="https://kissansathiindia.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <span>Launch Live Website</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
      `
    },
    ai_assistant: {
      title: '🤖 Autonomous AI Assistant & Knowledge Engine',
      content: `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <p style="font-size:1.05rem; line-height:1.7; color:var(--text-secondary);">
            An intelligent conversational system designed to deliver context-aware answers, structured reasoning, and rapid lookup across tailored knowledge domains.
          </p>
          <div style="background:var(--bg-tertiary); padding:1rem 1.25rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-cyan);">
            <h4 style="margin-bottom:0.5rem; color:var(--text-primary);">Engineering Highlights:</h4>
            <ul style="padding-left:1.25rem; color:var(--text-secondary); line-height:1.6; display:flex; flex-direction:column; gap:0.4rem;">
              <li>Streaming token responses for zero perceptual latency.</li>
              <li>Context memory and prompt refinement architectures.</li>
              <li>Clean REST API integration between Python backend services and modern frontend clients.</li>
            </ul>
          </div>
          <div>
            <h4 style="margin-bottom:0.5rem; color:var(--text-primary);">Technology Stack:</h4>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
              <span class="tech-chip">Python</span>
              <span class="tech-chip">LLM APIs</span>
              <span class="tech-chip">REST APIs</span>
              <span class="tech-chip">Modern JavaScript</span>
            </div>
          </div>
        </div>
      `
    },
    data_science: {
      title: '📊 Data Science & Mathematical Modeling Suite',
      content: `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <p style="font-size:1.05rem; line-height:1.7; color:var(--text-secondary);">
            A collection of applied data analytics, mathematical simulations, and predictive exploration modules developed to uncover underlying trends in complex datasets.
          </p>
          <div style="background:var(--bg-tertiary); padding:1rem 1.25rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-purple);">
            <h4 style="margin-bottom:0.5rem; color:var(--text-primary);">Key Modules:</h4>
            <ul style="padding-left:1.25rem; color:var(--text-secondary); line-height:1.6; display:flex; flex-direction:column; gap:0.4rem;">
              <li>Exploratory Data Analysis (EDA) on real-world datasets.</li>
              <li>Statistical probability modeling and multivariate regression analysis.</li>
              <li>Database schema optimization and high-speed querying with MySQL and SQLite.</li>
            </ul>
          </div>
        </div>
      `
    },
    c_systems: {
      title: '⚡ High-Performance C Systems & Algorithmic Suite',
      content: `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <p style="font-size:1.05rem; line-height:1.7; color:var(--text-secondary);">
            Low-level algorithmic implementations focusing on strict memory efficiency, pointer manipulation, and foundational computational problem solving.
          </p>
          <div style="background:var(--bg-tertiary); padding:1rem 1.25rem; border-radius:var(--radius-md); border-left:3px solid var(--accent-emerald);">
            <h4 style="margin-bottom:0.5rem; color:var(--text-primary);">Highlights:</h4>
            <ul style="padding-left:1.25rem; color:var(--text-secondary); line-height:1.6; display:flex; flex-direction:column; gap:0.4rem;">
              <li>Custom implementations of core Data Structures (Linked Lists, Trees, Hash Tables).</li>
              <li>Algorithm complexity benchmarking and Big-O optimization.</li>
              <li>Direct manual memory allocation without leaks.</li>
            </ul>
          </div>
        </div>
      `
    }
  };

  document.querySelectorAll('.open-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-project');
      const details = projectDetailsMap[projKey];
      if (details && modalOverlay) {
        modalTitle.textContent = details.title;
        modalBody.innerHTML = details.content;
        modalOverlay.classList.add('active');
      }
    });
  });

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // --- 15. Back to Top Smooth Scroll ---
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Update current year dynamically
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Helper
  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
