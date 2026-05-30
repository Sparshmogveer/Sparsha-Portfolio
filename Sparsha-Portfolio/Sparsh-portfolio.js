// ── PAGE NAVIGATION ──
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  // Show/hide footer (not on landing)
  document.getElementById('footer').style.display = name === 'landing' ? 'none' : 'block';

  // Update nav active state
  document.querySelectorAll('[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });

  window.scrollTo(0, 0);
  triggerAnimations();
  return false;
}

function triggerAnimations() {
  setTimeout(() => {
    document.querySelectorAll('.page.active .fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 80);
    });
  }, 50);
}

// ── HEADER SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 40);
});

// ── MOBILE MENU ──
function toggleMobile() {
  document.getElementById('mobile-menu').classList.toggle('open');
}
function closeMobile() {
  document.getElementById('mobile-menu').classList.remove('open');
}

// ── CONTACT FORM (EmailJS — no backend needed) ──
async function submitForm() {
  const name    = document.getElementById('f-name').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const subject = document.getElementById('f-subject').value.trim();
  const message = document.getElementById('f-message').value.trim();

  if (!name || !email || !subject || !message) {
    alert('Please fill in all fields.');
    return;
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        name:     name,
        email:    email,
        subject:  subject,
        message:  message,
        reply_to: email
      }
    );

    // Success
    const successEl = document.getElementById('form-success');
    successEl.style.display = 'block';
    successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('f-name').value    = '';
    document.getElementById('f-email').value   = '';
    document.getElementById('f-subject').value = '';
    document.getElementById('f-message').value = '';
    setTimeout(() => successEl.style.display = 'none', 6000);

    // Send AI-generated auto-reply to visitor
    sendAutoReply(name, email, subject, message);

  } catch (err) {
    console.error('EmailJS error:', err);

    // Graceful fallback: pre-fill mailto so user can still reach you
    const mailtoLink = `mailto:sparshnalkudremattd@gmail.com`
      + `?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(`Hi Sparsh,\n\nName: ${name}\nEmail: ${email}\n\n${message}`)}`;

    const fallback = document.getElementById('form-error');
    if (fallback) {
      fallback.style.display = 'block';
      setTimeout(() => fallback.style.display = 'none', 8000);
    }

    // Also open mailto as direct fallback after short delay
    setTimeout(() => { window.location.href = mailtoLink; }, 800);
  }

  btn.textContent = '✉️ Send Message';
  btn.disabled = false;
}

// ══════════════════════════════════════════════
// ── AI CHAT — GROQ (works online via Vercel, locally via direct API) ──
// API key is set as GROQ_API_KEY environment variable in Vercel
// For local testing, the IS_LOCAL flag calls Groq directly via /api/chat proxy
const GROQ_MODEL = 'llama-3.1-8b-instant';
const IS_LOCAL   = window.location.protocol === 'file:';

const SPARSHA_SYSTEM_PROMPT = `You are an AI assistant on Sparsha B T's portfolio website. Your job is to answer questions about Sparsha naturally and conversationally — like a friend describing her.

STRICT RULES:
- Maximum 2-3 sentences per answer. Never more.
- NEVER use bullet points, asterisks, bold text, or markdown formatting of any kind.
- NEVER make up skills or facts not listed below.
- If asked something not in the profile, say "I don't have that info, but feel free to reach out to Sparsha directly!"
- Keep it warm, human, and professional. No robotic corporate language.
- Always refer to Sparsha as she/her.

PORTFOLIO CHESS THEME — IMPORTANT:
This portfolio uses a chess theme where each section is named after a chess piece:
- The King = About section (Sparsha's vision and direction)
- The Queen = Skills section (her most powerful capabilities)
- The Rooks = Projects section (structured execution and built solutions)
- The Bishops = Experience section (her internship journey)
- The Pawns = continuous learning and growth
So if someone asks about "Rooks" they mean her Projects. "Queen" means Skills. "King" means About/Vision. "Bishops" means Experience/Internships.

SPARSHA'S PROFILE:
Name: Sparsha B T
Location: Bengaluru, India. Open to relocation and remote work.
Education: B.Tech in AI and ML at Srinivas University Institute of Engineering and Technology, CGPA 8.35. PUC Science at Siddaganga PU College, 70%.
Award: Best Outgoing Student of the AI and ML Department 2022-2026.
Activities: Conducted and hosted college events as student representative.

Current role: AI/ML and QA Intern at NammaQA Wizzybox since January 2026. Validates LLM outputs, runs prompt quality evaluations on Llama 3.2 and Gemma 3 via Ollama, and designs API test suites.

Past internships:
- Zephyr Technologies: Full Stack Intern, May-June 2025. Built React UI components, integrated REST APIs, improved user engagement by 30%.
- CodSoft: Data Science Intern, Aug-Sep 2024. End-to-end EDA, built classification and regression models.
- Prodigy InfoTech: Machine Learning Intern, December 2023. Outstanding remarks.

Skills: Python, JavaScript, SQL, TensorFlow, Scikit-learn, OpenCV, CNN, Random Forest, Pandas, NumPy, Matplotlib, Seaborn, React.js, Node.js, MongoDB, MySQL, REST APIs, Tailwind CSS, Firebase, Ollama, Llama 3.2, Gemma 3, Qwen 2.5, AWS Cloud, Git, GitHub, Power BI, Jupyter Notebook.

Projects (the Rooks):
1. Road Accident Risk Prediction: ML pipeline on sensor data, Random Forest, 91% recall on high-risk events, 22% false positive reduction.
2. Credit Card Fraud Detection: Anomaly detection on imbalanced data, SMOTE, 18% false positive reduction. CodSoft internship.
3. Gender and Age Detection: Real-time computer vision using CNN and OpenCV.
4. MERN E-Commerce Platform: Full stack with JWT auth, React frontend, Node.js backend, MongoDB.

Certifications: AWS Academy Cloud Foundations, IT Specialist Databases by Certiport, ML in Healthcare by IBM, Python 101 for Data Science by IBM, ML Internship by Prodigy InfoTech, MERN Stack Internship by Zephyr Technologies, Python Programming by Skill India NSDC.

Contact: sparshnalkudremattd@gmail.com, github.com/Sparshmogveer, linkedin.com/in/sparsha-b-t`;

let chatHistory = [];
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('ai-chat-panel').classList.toggle('open', chatOpen);
  if (chatOpen) document.getElementById('chat-input').focus();
}

function addMessage(text, role) {
  const msgs = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.className   = 'chat-msg ' + role;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendChat() {
  const input    = document.getElementById('chat-input');
  const sendBtn  = document.getElementById('chat-send-btn');
  const userText = input.value.trim();
  if (!userText) return;

  input.value      = '';
  sendBtn.disabled = true;

  addMessage(userText, 'user');
  chatHistory.push({ role: 'user', content: userText });

  const typingDiv = addMessage('Thinking...', 'ai typing');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SPARSHA_SYSTEM_PROMPT },
          ...chatHistory,
        ],
      }),
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, could not generate a response.';

    typingDiv.textContent = reply;
    typingDiv.classList.remove('typing');
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  } catch (err) {
    typingDiv.textContent = '⚠️ AI temporarily unavailable. Please try again shortly.';
    typingDiv.classList.remove('typing');
  }

  sendBtn.disabled = false;
  input.focus();
}

async function sendAutoReply(name, userEmail, subject, message) {
  console.log('Auto-reply skipped in local mode.');
}


// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  triggerAnimations();
  document.getElementById('footer').style.display = 'none';
});
