
// ============================================================
// 1. НАВИГАЦИЯ
// ============================================================

function switchTab(tabId, push = true) {
    const target = document.getElementById('tab-' + tabId);

    if (!target) {
        tabId = 'home';
    }

    const finalTarget = document.getElementById('tab-' + tabId);
    if (!finalTarget) return;

    document.querySelectorAll('.tab').forEach(el => {
        el.classList.remove('active');
    });

    finalTarget.classList.add('active');

    const navId = tabId.startsWith('project-') ? 'wiki' : tabId;

    document.querySelectorAll('.nav-buttons button, .mobile-nav button').forEach(btn => {
        const isActive = btn.dataset.tab === navId;

        btn.classList.toggle('active', isActive);

        if (isActive) {
            btn.setAttribute('aria-current', 'page');
        } else {
            btn.removeAttribute('aria-current');
        }
    });

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    if (push && location.hash !== '#' + tabId) {
        history.pushState(
            { tab: tabId },
            '',
            '#' + tabId
        );
    }
}

document.querySelectorAll(
    '.nav-buttons button, .mobile-nav button'
).forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

document.querySelectorAll('.footer a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
        const tabId = link.getAttribute('href').slice(1);

        if (document.getElementById('tab-' + tabId)) {
            event.preventDefault();
            switchTab(tabId);
        }
    });
});

window.addEventListener('popstate', () => {
    switchTab(
        location.hash.slice(1) || 'home',
        false
    );
});

document.querySelectorAll(
    '.wiki-entry, .page-detail .back'
).forEach(el => {
    el.setAttribute(
        'role',
        el.matches('.back') ? 'link' : 'button'
    );

    el.tabIndex = 0;

    el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            el.click();
        }
    });
});


// ============================================================
// 2. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
// ============================================================

document.querySelectorAll('.i18n').forEach(el => {
    if (!el.hasAttribute('data-ru')) {
        el.dataset.ru = el.innerHTML;
    }
});

let currentLang = 'ru';

const langToggle = document.getElementById('langToggle');

function applyLang(lang) {
    currentLang = lang;

    if (langToggle) {
        langToggle.textContent =
            lang === 'en' ? 'РУС' : 'ENG';
    }

    document.documentElement.lang = lang;

    document.querySelectorAll('.i18n').forEach(el => {
        const text = el.getAttribute('data-' + lang);

        if (text === null || text === '') return;

        if (text.includes('<')) {
            el.innerHTML = text;
        } else {
            el.textContent = text;
        }
    });

    const subtitle = document.querySelector(
        '.header .logo .subtitle'
    );

    if (subtitle) {
        subtitle.textContent =
            lang === 'en'
                ? '✦ World of Kosarh ✦'
                : '✦ Мир Косарха ✦';
    }
}

function toggleLang() {
    applyLang(
        currentLang === 'en' ? 'ru' : 'en'
    );

    try {
        localStorage.setItem(
            'solarium-lang',
            currentLang
        );
    } catch (error) {}
}

if (langToggle) {
    langToggle.addEventListener(
        'click',
        toggleLang
    );
}

try {
    const savedLang =
        localStorage.getItem('solarium-lang');

    if (savedLang === 'en') {
        applyLang('en');
    }
} catch (error) {}


// ============================================================
// 3. ЗВЁЗДЫ И АНИМАЦИИ
// ============================================================

function createStars() {
    const container =
        document.getElementById('stars');

    if (!container) return;

    const count =
        window.innerWidth < 760 ? 55 : 120;

    const fragment =
        document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const star =
            document.createElement('div');

        star.className = 'star';

        const size =
            Math.random() * 3 + 1;

        star.style.width =
            size + 'px';

        star.style.height =
            size + 'px';

        star.style.left =
            Math.random() * 100 + '%';

        star.style.top =
            Math.random() * 100 + '%';

        star.style.setProperty(
            '--duration',
            Math.random() * 3 + 2 + 's'
        );

        star.style.animationDelay =
            Math.random() * 5 + 's';

        fragment.appendChild(star);
    }

    container.replaceChildren(fragment);
}

createStars();

const revealElements =
    document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver =
        new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(
                            'visible'
                        );

                        revealObserver.unobserve(
                            entry.target
                        );
                    }
                });
            },
            {
                threshold: 0.08
            }
        );

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
} else {
    revealElements.forEach(el => {
        el.classList.add('visible');
    });
}


// ============================================================
// 4. ЗАПУСК И МУЗЫКА
// ============================================================

const startTab =
    location.hash.slice(1);

if (startTab) {
    switchTab(
        startTab,
        false
    );
} else {
    switchTab(
        'home',
        false
    );
}

const music =
    document.getElementById('background-music');

const musicToggle =
    document.getElementById('music-toggle');

if (music && musicToggle) {
    music.volume = 0.15;

    musicToggle.addEventListener(
        'click',
        async () => {
            if (music.paused) {
                try {
                    await music.play();

                    musicToggle.textContent =
                        '♫ Музыка: ВКЛ';

                    musicToggle.setAttribute(
                        'aria-label',
                        'Выключить музыку'
                    );

                    musicToggle.setAttribute(
                        'aria-pressed',
                        'true'
                    );
                } catch (error) {
                    musicToggle.textContent =
                        '♫ Не удалось включить';

                    musicToggle.setAttribute(
                        'aria-label',
                        'Повторить включение музыки'
                    );

                    musicToggle.setAttribute(
                        'aria-pressed',
                        'false'
                    );
                }
            } else {
                music.pause();

                musicToggle.textContent =
                    '♫ Музыка: ВЫКЛ';

                musicToggle.setAttribute(
                    'aria-label',
                    'Включить музыку'
                );

                musicToggle.setAttribute(
                    'aria-pressed',
                    'false'
                );
            }
        }
    );
}


// ============================================================
// 5. GITHUB
// ============================================================

const GH_USER = 'VladislavFosk';
const GH_API = 'https://api.github.com';

let ghRepos = [];

function ghEl(tag, cls, text) {
    const el = document.createElement(tag);

    if (cls) {
        el.className = cls;
    }

    if (text !== undefined && text !== null) {
        el.textContent = text;
    }

    return el;
}

async function ghFetch(url) {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github+json'
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API ${response.status}`);
    }

    return response.json();
}

async function ghLoadHeatmap() {
    const wrap = document.getElementById('ghHeatmap');
    const legend = document.getElementById('ghHeatmapLegend');

    if (!wrap) return;

    try {
        const data = await fetch(
            `https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`
        ).then(response => {
            if (!response.ok) {
                throw new Error(`Heatmap API ${response.status}`);
            }

            return response.json();
        });

        const days = data.contributions || [];
        const map = {};

        days.forEach(day => {
            map[day.date] = day.count;
        });

        wrap.replaceChildren();

        const end = new Date();
        const start = new Date(end);

        start.setDate(end.getDate() - 364);
        start.setDate(start.getDate() - start.getDay());

        for (let i = 0; i < 371; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);

            const iso =
                `${date.getFullYear()}-` +
                `${String(date.getMonth() + 1).padStart(2, '0')}-` +
                `${String(date.getDate()).padStart(2, '0')}`;

            const count = map[iso] || 0;

            const level =
                count >= 10 ? 4 :
                count >= 6 ? 3 :
                count >= 3 ? 2 :
                count > 0 ? 1 :
                0;

            const cell = ghEl('div', 'cell');

            cell.dataset.l = level;
            cell.title = `${iso}: ${count} contributions`;

            wrap.appendChild(cell);
        }

        if (legend) {
            legend.replaceChildren();

            legend.appendChild(
                ghEl('span', '', 'Меньше')
            );

            for (let level = 0; level <= 4; level++) {
                const cell = ghEl('span', 'cell');

                cell.dataset.l = level;

                legend.appendChild(cell);
            }

            legend.appendChild(
                ghEl('span', '', 'Больше')
            );
        }

    } catch (error) {
        console.error('GitHub heatmap error:', error);

        wrap.replaceChildren(
            ghEl('span', '', 'Не удалось загрузить активность GitHub')
        );

        if (wrap.firstElementChild) {
            wrap.firstElementChild.style.cssText =
                'font-size:12px;color:var(--muted)';
        }
    }
}

function ghRepoCard(repo) {
    const card = document.createElement('a');

    card.className = 'gh-repo';
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const name = ghEl('b', '', repo.name);

    const description = ghEl(
        'small',
        '',
        repo.description || 'Без описания'
    );

    const meta = ghEl('div', 'gh-meta');

    if (repo.language) {
        meta.appendChild(
            ghEl('span', '', `💻 ${repo.language}`)
        );
    }

    meta.appendChild(
        ghEl('span', '', `⭐ ${repo.stargazers_count}`)
    );

    meta.appendChild(
        ghEl('span', '', `🍴 ${repo.forks_count}`)
    );

    card.append(
        name,
        description,
        meta
    );

    return card;
}

function ghRenderPinned() {
    const box = document.getElementById('ghPinned');

    if (!box) return;

    const pinned = [...ghRepos]
        .sort((a, b) => {
            const stars =
                b.stargazers_count -
                a.stargazers_count;

            if (stars !== 0) {
                return stars;
            }

            return (
                new Date(b.updated_at) -
                new Date(a.updated_at)
            );
        })
        .slice(0, 4);

    box.replaceChildren();

    if (!pinned.length) {
        box.appendChild(
            ghEl('p', '', 'Нет репозиториев')
        );

        return;
    }

    pinned.forEach(repo => {
        box.appendChild(
            ghRepoCard(repo)
        );
    });
}

function ghRenderAll(filter = '') {
    const box = document.getElementById('ghAll');

    if (!box) return;

    const query = filter
        .trim()
        .toLowerCase();

    const list = ghRepos.filter(repo => {
        return (
            !query ||
            repo.name.toLowerCase().includes(query) ||
            (repo.description || '')
                .toLowerCase()
                .includes(query) ||
            (repo.language || '')
                .toLowerCase()
                .includes(query)
        );
    });

    box.replaceChildren();

    if (!list.length) {
        box.appendChild(
            ghEl('p', '', 'Ничего не найдено')
        );

        return;
    }

    list.forEach(repo => {
        box.appendChild(
            ghRepoCard(repo)
        );
    });
}

function ghFilterRepos() {
    const input =
        document.getElementById('ghSearch');

    ghRenderAll(
        input ? input.value : ''
    );
}

async function ghLoadRepos() {
    const status =
        document.getElementById('ghStatus');

    try {
        const repos = await ghFetch(
            `${GH_API}/users/${GH_USER}/repos?` +
            `sort=updated&direction=desc&per_page=100`
        );

        ghRepos = repos.filter(repo => {
            return (
                repo.owner &&
                repo.owner.login.toLowerCase() ===
                    GH_USER.toLowerCase() &&
                !repo.fork &&
                !repo.archived
            );
        });

        ghRenderPinned();
        ghRenderAll();

        if (status) {
            status.textContent =
                `GitHub: @${GH_USER} · ` +
                `Загружено репозиториев: ${ghRepos.length}`;
        }

    } catch (error) {
        console.error(
            'GitHub repositories error:',
            error
        );

        if (status) {
            status.textContent =
                'Не удалось загрузить данные GitHub';
        }
    }
}

const ghSearchInput =
    document.getElementById('ghSearch');

if (ghSearchInput) {
    ghSearchInput.addEventListener(
        'input',
        ghFilterRepos
    );
}

ghLoadHeatmap();
ghLoadRepos();


// ============================================================
// 7. GITHUB HEATMAP
// ============================================================

async function ghLoadHeatmap() {
    const wrap =
        document.getElementById('ghHeatmap');

    const legend =
        document.getElementById(
            'ghHeatmapLegend'
        );

    if (!wrap) return;

    try {
        const response =
            await fetch(
                `https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`
            );

        if (!response.ok) {
            throw new Error(
                'HTTP ' + response.status
            );
        }

        const data =
            await response.json();

        const days =
            (data.contributions || [])
                .slice(-371);

        const contributionMap = {};

        days.forEach(day => {
            contributionMap[day.date] =
                day.count;
        });

        wrap.replaceChildren();

        const end =
            new Date();

        const start =
            new Date(end);

        start.setDate(
            end.getDate() - 370
        );

        start.setDate(
            start.getDate() -
            start.getDay()
        );

        for (let i = 0; i < 371; i++) {
            const date =
                new Date(start);

            date.setDate(
                start.getDate() + i
            );

            const iso =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, '0')}-${String(
                    date.getDate()
                ).padStart(2, '0')}`;

            const count =
                contributionMap[iso] || 0;

            const level =
                count >= 10
                    ? 4
                    : count >= 6
                    ? 3
                    : count >= 3
                    ? 2
                    : count > 0
                    ? 1
                    : 0;

            const cell =
                ghEl('div', 'cell');

            cell.dataset.l =
                level;

            cell.title =
                `${iso}: ${count} contributions`;

            wrap.appendChild(cell);
        }

        if (legend) {
            legend.replaceChildren();

            legend.appendChild(
                ghEl(
                    'span',
                    '',
                    'Меньше'
                )
            );

            for (let level = 0; level <= 4; level++) {
                const cell =
                    ghEl('span', 'cell');

                cell.dataset.l =
                    level;

                legend.appendChild(cell);
            }

            legend.appendChild(
                ghEl(
                    'span',
                    '',
                    'Больше'
                )
            );
        }

    } catch (error) {
        console.error(
            'Ошибка GitHub heatmap:',
            error
        );

        wrap.replaceChildren(
            ghEl(
                'span',
                '',
                'Не удалось загрузить heatmap'
            )
        );

        if (wrap.firstElementChild) {
            wrap.firstElementChild.style.cssText =
                'font-size:12px;color:var(--muted)';
        }
    }
}


// ============================================================
// 8. КАРТОЧКА GITHUB-РЕПОЗИТОРИЯ
// ============================================================

function ghRepoCard(repo) {
    const card =
        document.createElement('a');

    card.className =
        'gh-repo';

    card.href =
        repo.html_url;

    card.target =
        '_blank';

    card.rel =
        'noopener noreferrer';

    const name =
        ghEl(
            'b',
            '',
            repo.name
        );

    const description =
        ghEl(
            'small',
            '',
            repo.description ||
            'Без описания'
        );

    const meta =
        ghEl(
            'div',
            'gh-meta'
        );

    if (repo.language) {
        meta.appendChild(
            ghEl(
                'span',
                '',
                `💻 ${repo.language}`
            )
        );
    }

    meta.appendChild(
        ghEl(
            'span',
            '',
            `⭐ ${repo.stargazers_count}`
        )
    );

    meta.appendChild(
        ghEl(
            'span',
            '',
            `🍴 ${repo.forks_count}`
        )
    );

    card.append(
        name,
        description,
        meta
    );

    return card;
}


// ============================================================
// 9. ИЗБРАННЫЕ ПРОЕКТЫ
// ============================================================

function ghRenderPinned() {
    const box =
        document.getElementById('ghPinned');

    if (!box) return;

    const pinned =
        [...ghRepos]
            .sort((a, b) => {
                const starsDifference =
                    b.stargazers_count -
                    a.stargazers_count;

                if (starsDifference !== 0) {
                    return starsDifference;
                }

                return (
                    new Date(b.updated_at) -
                    new Date(a.updated_at)
                );
            })
            .slice(0, 4);

    box.replaceChildren();

    if (pinned.length) {
        pinned.forEach(repo => {
            box.appendChild(
                ghRepoCard(repo)
            );
        });
    } else {
        box.appendChild(
            ghEl(
                'p',
                '',
                'Нет репозиториев'
            )
        );
    }
}


// ============================================================
// 10. ВСЕ ПРОЕКТЫ
// ============================================================

function ghRenderAll(filter = '') {
    const box =
        document.getElementById('ghAll');

    if (!box) return;

    const query =
        filter.trim().toLowerCase();

    const list =
        ghRepos.filter(repo => {
            const name =
                repo.name.toLowerCase();

            const description =
                (repo.description || '')
                    .toLowerCase();

            const language =
                (repo.language || '')
                    .toLowerCase();

            return (
                !query ||
                name.includes(query) ||
                description.includes(query) ||
                language.includes(query)
            );
        });

    box.replaceChildren();

    if (list.length) {
        list.forEach(repo => {
            box.appendChild(
                ghRepoCard(repo)
            );
        });
    } else {
        box.appendChild(
            ghEl(
                'p',
                '',
                'Ничего не найдено'
            )
        );
    }
}


// ============================================================
// 11. ПОИСК ПРОЕКТОВ
// ============================================================

function ghFilterRepos() {
    const input =
        document.getElementById('ghSearch');

    ghRenderAll(
        input
            ? input.value
            : ''
    );
}

const ghSearchInput =
    document.getElementById('ghSearch');

if (ghSearchInput) {
    ghSearchInput.addEventListener(
        'input',
        ghFilterRepos
    );
}


// ============================================================
// 12. ЗАГРУЗКА GITHUB-РЕПОЗИТОРИЕВ
// ============================================================

async function ghLoadRepos() {
    const status =
        document.getElementById('ghStatus');

    try {
        if (status) {
            status.textContent =
                `Подключение к GitHub @${GH_USER}...`;
        }

        const response =
            await fetch(
                `https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=100`
            );

        if (!response.ok) {
            throw new Error(
                'GitHub API ' +
                response.status
            );
        }

        const repos =
            await response.json();

        ghRepos =
            repos.filter(repo => {
                const owner =
                    repo.owner &&
                    repo.owner.login
                        ? repo.owner.login
                        : '';

                return (
                    owner.toLowerCase() ===
                    GH_USER.toLowerCase() &&
                    !repo.fork &&
                    !repo.archived
                );
            });

        ghRenderPinned();
        ghRenderAll();

        if (status) {
            status.textContent =
                `Загружено репозиториев: ${ghRepos.length} (@${GH_USER})`;
        }

    } catch (error) {
        console.error(
            'Ошибка GitHub API:',
            error
        );

        if (status) {
            status.textContent =
                'Ошибка загрузки репозиториев: ' +
                error.message;
        }

        const pinned =
            document.getElementById('ghPinned');

        const all =
            document.getElementById('ghAll');

        if (pinned) {
            pinned.replaceChildren(
                ghEl(
                    'p',
                    '',
                    'Не удалось загрузить репозитории'
                )
            );
        }

        if (all) {
            all.replaceChildren(
                ghEl(
                    'p',
                    '',
                    'GitHub временно недоступен'
                )
            );
        }
    }
}


// ============================================================
// 13. ЗАПУСК GITHUB
// ============================================================

ghLoadHeatmap();
ghLoadRepos();
