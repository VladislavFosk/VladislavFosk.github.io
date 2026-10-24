// ============================================================
// 1. НАВИГАЦИЯ
// ============================================================
function switchTab(tabId, push = true) {
    const target = document.getElementById('tab-' + tabId);
    if (!target) return;

    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    target.classList.add('active');

    const navId = tabId.startsWith('project-') ? 'wiki' : tabId;
    document.querySelectorAll('.nav-buttons button, .mobile-nav button').forEach(btn => {
        const on = btn.dataset.tab === navId;
        btn.classList.toggle('active', on);
        if (on) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (push && location.hash !== '#' + tabId) {
        history.pushState({ tab: tabId }, '', '#' + tabId);
    }
}

document.querySelectorAll('.nav-buttons button, .mobile-nav button').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

window.addEventListener('popstate', () => {
    switchTab(location.hash.replace('#', '') || 'home', false);
});

document.querySelectorAll('.wiki-entry, .page-detail .back').forEach(el => {
    el.setAttribute('role', el.matches('.back') ? 'link' : 'button');
    el.tabIndex = 0;
    el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
        }
    });
});

// ============================================================
// 2. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
// ============================================================
document.querySelectorAll('.i18n').forEach(el => { el.dataset.ru = el.innerHTML; });

let currentLang = 'ru';
const langToggle = document.getElementById('langToggle');

function applyLang(lang) {
    currentLang = lang;
    langToggle.textContent = lang === 'en' ? 'РУС' : 'ENG';
    document.documentElement.lang = lang;

    document.querySelectorAll('.i18n').forEach(el => {
        const text = el.getAttribute('data-' + lang);
        if (!text) return;
        if (text.includes('<')) el.innerHTML = text;
        else el.textContent = text;
    });

    document.querySelector('.header .logo .subtitle').textContent =
        lang === 'en' ? '✦ World of Kosarh ✦' : '✦ Мир Косарха ✦';
}

function toggleLang() {
    applyLang(currentLang === 'en' ? 'ru' : 'en');
    try { localStorage.setItem('solarium-lang', currentLang); } catch (e) {}
}

langToggle.addEventListener('click', toggleLang);

try {
    if (localStorage.getItem('solarium-lang') === 'en') applyLang('en');
} catch (e) {}

// ============================================================
// 3. ЗВЁЗДЫ
// ============================================================
function createStars() {
    const container = document.getElementById('stars');
    const count = window.innerWidth < 760 ? 55 : 120;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.animationDelay = (Math.random() * 5) + 's';
        frag.appendChild(star);
    }
    container.appendChild(frag);
}
createStars();

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    revealEls.forEach(el => revealObserver.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('visible'));
}

// ============================================================
// 4. ЗАПУСК
// ============================================================
const startTab = location.hash.replace('#', '');
if (startTab) switchTab(startTab, false);

// ============================================================
// 5. GITHUB BLOCK — only VladislavFosk
// ============================================================
const GH_USER = 'VladislavFosk';

function ghEl(tag, cls, html){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
}

async function ghLoadHeatmap(){
    const wrap = document.getElementById('ghHeatmap');
    const legend = document.getElementById('ghHeatmapLegend');
    if (!wrap) return;

    try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
        const data = await res.json();
        const days = (data.contributions || []).slice(-371);
        const map = {};
        days.forEach(d => { map[d.date] = d.count; });

        wrap.innerHTML = '';
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - 370);
        start.setDate(start.getDate() - start.getDay());

        for (let i = 0; i < 371; i++){
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const iso = d.toISOString().slice(0,10);
            const c = map[iso] || 0;
            let lvl = 0;
            if (c > 0) lvl = 1;
            if (c >= 3) lvl = 2;
            if (c >= 6) lvl = 3;
            if (c >= 10) lvl = 4;
            const cell = ghEl('div','cell');
            cell.dataset.l = lvl;
            cell.title = `${iso}: ${c} contributions`;
            wrap.appendChild(cell);
        }

        legend.innerHTML =
            '<span>Меньше</span>' +
            '<span class="cell" style="background:#2a1530"></span>' +
            '<span class="cell" style="background:#4a1e42"></span>' +
            '<span class="cell" style="background:#7a2a5e"></span>' +
            '<span class="cell" style="background:#b0306e"></span>' +
            '<span class="cell" style="background:var(--a3)"></span>' +
            '<span>Больше</span>';
    } catch (e) {
        wrap.innerHTML = '<span style="font-size:12px;color:var(--muted)">Не удалось загрузить heatmap</span>';
    }
}

let ghRepos = [];

function ghRepoCard(r){
    const desc = r.description ? r.description : 'Без описания';
    const lang = r.language ? `<span>💻 ${r.language}</span>` : '';
    const stars = `<span>⭐ ${r.stargazers_count}</span>`;
    const forks = `<span>🍴 ${r.forks_count}</span>`;
    return `<a class="gh-repo" href="${r.html_url}" target="_blank" rel="noopener">
        <b>${r.name}</b>
        <small>${desc}</small>
        <div class="gh-meta">${lang}${stars}${forks}</div>
    </a>`;
}

function ghRenderPinned(){
    const box = document.getElementById('ghPinned');
    if (!box) return;
    const pinned = [...ghRepos]
        .sort((a,b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
        .slice(0,4);
    box.innerHTML = pinned.length
        ? pinned.map(ghRepoCard).join('')
        : '<p style="font-size:13px;color:var(--muted)">Нет репозиториев</p>';
}

function ghRenderAll(filter = ''){
    const box = document.getElementById('ghAll');
    if (!box) return;
    const q = filter.trim().toLowerCase();
    const list = ghRepos.filter(r =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.language || '').toLowerCase().includes(q)
    );
    box.innerHTML = list.length
        ? list.map(ghRepoCard).join('')
        : '<p style="font-size:13px;color:var(--muted)">Ничего не найдено</p>';
}

function ghFilterRepos(){
    const input = document.getElementById('ghSearch');
    ghRenderAll(input ? input.value : '');
}

async function ghLoadRepos(){
    const status = document.getElementById('ghStatus');
    try {
        const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=100`);
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        const repos = await res.json();

        ghRepos = repos.filter(r =>
            r.owner.login.toLowerCase() === GH_USER.toLowerCase() &&
            !r.fork &&
            !r.archived
        );

        ghRenderPinned();
        ghRenderAll();
        if (status) status.textContent = `Загружено репозиториев: ${ghRepos.length} (@${GH_USER})`;
    } catch (e) {
        if (status) status.textContent = 'Ошибка загрузки репозиториев: ' + e.message;
    }
}

// Поиск по репозиториям — обработчик oninput
const ghSearchInput = document.getElementById('ghSearch');
if (ghSearchInput) {
    ghSearchInput.addEventListener('input', ghFilterRepos);
}

document.addEventListener('DOMContentLoaded', () => {
    ghLoadHeatmap();
    ghLoadRepos();
});
