const DISCORD_ID = '623569893589254154';
const API_KEY = '';

const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
const themeToggleBtn = document.getElementById('theme-toggle');
const coffeeBtn = document.getElementById('drink-coffee');
const coffeeCountSpan = document.getElementById('coffee-count');


window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;


    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;


    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});


const words = [
    "discord.gg/stg",
    "discord.gg/leainfo",
    "github.com/artseen",
    "brazze, opss..."
];
let i = 0;
let timer;

const typingElement = document.querySelector('.typing-text');

function typingEffect() {
    if (!typingElement) return;
    const word = words[i].split("");
    var loopTyping = function () {
        if (word.length > 0) {
            typingElement.innerHTML += word.shift();
        } else {
            setTimeout(deletingEffect, 2000);
            return false;
        }
        timer = setTimeout(loopTyping, 100);
    };
    loopTyping();
}

function deletingEffect() {
    if (!typingElement) return;
    const word = words[i].split("");
    var loopDeleting = function () {
        if (word.length > 0) {
            word.pop();
            typingElement.innerHTML = word.join("");
        } else {
            if (words.length > (i + 1)) {
                i++;
            } else {
                i = 0;
            }
            typingEffect();
            return false;
        }
        timer = setTimeout(loopDeleting, 50);
    };
    loopDeleting();
}

if (typingElement) {
    typingEffect();
}


async function fetchDiscordStatus() {
    const discordUsername = document.getElementById('discord-username');
    if (!discordUsername) return;

    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, {
            headers: {
                'Authorization': API_KEY
            }
        });


        if (!response.ok) {
            if (response.status === 404) {
                discordUsername.textContent = 'Bağlantı Gerekli';
                document.getElementById('discord-discriminator').textContent = 'Lanyard';
                document.getElementById('discord-activity').innerHTML = `
                    <p style="color: #ff5f56; font-size: 0.8rem;">
                        Lanyard sizi göremiyor.<br>
                        Discord sunucusuna katılmanız lazım.<br>
                        <a href="https://discord.gg/lanyard" target="_blank" style="color: #fff; text-decoration: underline;">Buraya Tıkla ve Katıl</a>
                    </p>
                `;
                document.getElementById('discord-status').style.backgroundColor = '#f04747';
                return;
            }
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            const { discord_user, discord_status, activities } = data.data;


            const avatarUrl = discord_user.avatar
                ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=256`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            document.getElementById('discord-avatar').src = avatarUrl;

            // Banner Handling
            const bannerElement = document.querySelector('.discord-banner');
            if (bannerElement) {
                if (discord_user.banner) {
                    const bannerExtension = discord_user.banner.startsWith('a_') ? 'gif' : 'png';
                    const bannerUrl = `https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.${bannerExtension}?size=512`;
                    bannerElement.style.backgroundImage = `url(${bannerUrl})`;
                    bannerElement.style.backgroundSize = 'cover';
                    bannerElement.style.backgroundPosition = 'center';
                } else {
                    if (discord_user.banner_color) {
                        bannerElement.style.backgroundImage = 'none';
                        bannerElement.style.backgroundColor = discord_user.banner_color;
                    } else {
                        bannerElement.style.backgroundImage = ''; // Revert to CSS (stripes)
                        bannerElement.style.backgroundColor = '';
                    }
                }
            }


            const globalName = discord_user.global_name || discord_user.username || "Kullanıcı";
            const username = discord_user.discriminator === "0" ? `@${discord_user.username}` : `${discord_user.username}#${discord_user.discriminator}`;

            document.getElementById('discord-username').textContent = globalName;
            document.getElementById('discord-discriminator').textContent = username;


            let badgeBox = document.getElementById('discord-badges');
            if (!badgeBox) {
                badgeBox = document.createElement('div');
                badgeBox.id = 'discord-badges';
                badgeBox.style.cssText = 'position: absolute; top: 12px; right: 12px; display: flex; gap: 6px; background: rgba(0,0,0,0.6); padding: 4px; border-radius: 8px; backdrop-filter: blur(4px); z-index: 100;';
                document.querySelector('.discord-card').appendChild(badgeBox);
            }
            badgeBox.innerHTML = '';

            if (discord_user.public_flags) {
                const flags = discord_user.public_flags;
                if (flags & 4194304) {
                    badgeBox.innerHTML += `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f4bb.png" title="Active Developer" style="width:18px; height:18px;">`;
                }
                if (flags & 256) {
                    badgeBox.innerHTML += `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f7e2.png" title="HypeSquad Balance" style="width:18px; height:18px;">`;
                }
                if (flags & 64) {
                    badgeBox.innerHTML += `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f7e3.png" title="HypeSquad Bravery" style="width:18px; height:18px;">`;
                }
                if (flags & 128) {
                    badgeBox.innerHTML += `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f7e0.png" title="HypeSquad Brilliance" style="width:18px; height:18px;">`;
                }
                if (flags & 512) {
                    badgeBox.innerHTML += `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f48e.png" title="Early Supporter" style="width:18px; height:18px;">`;
                }
            }


            const statusColor = {
                online: '#43b581',
                idle: '#faa61a',
                dnd: '#f04747',
                offline: '#747f8d'
            };
            document.getElementById('discord-status').style.backgroundColor = statusColor[discord_status] || statusColor.offline;


            const activityElement = document.getElementById('discord-activity');


            activityElement.innerHTML = '';

            if (activities && activities.length > 0) {
                const spotify = activities.find(a => a.id === 'spotify:1');
                const game = activities.find(a => a.type === 0);
                const custom = activities.find(a => a.type === 4);

                const activity = spotify || game || custom || activities[0];

                let iconHtml = '';
                if (activity.assets && activity.assets.large_image) {
                    let imgUrl = activity.assets.large_image;
                    if (imgUrl.startsWith('spotify:')) {
                        imgUrl = `https://i.scdn.co/image/${imgUrl.split(':')[1]}`;
                    } else {
                        imgUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                    }
                    iconHtml = `<img src="${imgUrl}" style="width: 60px; height: 60px; border-radius: 8px; margin-right: 10px; float: left;">`;
                }

                activityElement.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        ${iconHtml}
                        <div>
                            <div style="font-weight: bold; font-size: 0.9rem; color: #fff;">${activity.name}</div>
                            <div style="font-size: 0.8rem; color: #bbb;">${activity.details || ''}</div>
                            <div style="font-size: 0.8rem; color: #bbb;">${activity.state || ''}</div>
                        </div>
                    </div>
                `;
            } else {
                activityElement.innerHTML = '<p style="color: #bbb; font-style: italic;">Şu an bir şey yapmıyor.</p>';
            }
        }
    } catch (error) {
        console.error('Discord verisi çekilemedi:', error);
        if (document.getElementById('discord-username').textContent !== 'Bağlantı Gerekli') {
            document.getElementById('discord-username').textContent = 'Hata';
            document.getElementById('discord-activity').innerHTML = '<p>Veri çekilemedi. Konsola bak.</p>';
        }
    }
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 30000);

const surpriseBtn = document.getElementById('surprise-btn');
const surpriseOverlay = document.getElementById('surprise-overlay');
const giftContainer = document.getElementById('gift-container');
const giftBox = document.querySelector('.gift-box');
const minigameContainer = null;
const closeGameBtn = null;
const gameArea = null;
const targetDot = null;
const scoreSpan = null;

let clickCount = 0;
const CLICKS_TO_OPEN = 3;

if (surpriseBtn) {
    surpriseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        surpriseOverlay.classList.add('active');
    });
}

if (surpriseOverlay) {
    surpriseOverlay.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 20;
        const y = (window.innerHeight / 2 - e.clientY) / 20;
        giftBox.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
    });

    giftContainer.addEventListener('click', () => {
        clickCount++;

        giftBox.style.transform += " scale(0.95)";
        setTimeout(() => {
        }, 100);

        if (clickCount >= CLICKS_TO_OPEN) {
            giftBox.classList.add('open');
            setTimeout(() => {
                window.location.href = 'suprise.html';
            }, 1000);
        }
    });
}

const translations = {
    tr: {
        nav_home: "Ana Sayfa",
        nav_about: "Hakkımda",
        hero_greeting: "Selam, ben",
        hero_headline: "Takılıyorum,",
        cta_whatido: "Neler Yapıyorum?",
        cta_surprise: "Sürprizi Gör",
        discord_loading: "Yükleniyor...",
        discord_idle: "Şu an bir şey yapmıyor.",
        skills_title: "Yetenekler & Araçlar",
        footer_rights: "2025 Tüm hakları saklıdır.",
        about_title: "Hakkımda",
        about_text: `Adım <strong>Alper</strong>, 2019'dan beri yazılım ile uğraşıyorum, aktif olarak <a href="https://discord.gg/stg" target="_blank" style="color: #5865F2; text-decoration: none; font-weight: bold;">STG</a> üzerinde Geliştirici olarak takılıyorum.`,
        projects_title: "Projelerim",
        contributions_title: "Katkıda Bulunduklarım",
        proj_artseen_title: "ArtseeN FiveM",
        proj_artseen_desc: "Boş zamanlarımda hobi amaçlı geliştirdiğim, eğlenceli ve işlevsel açık kaynaklı FiveM scriptleri.",
        proj_animeverse_title: "AnimeVerse",
        proj_animeverse_desc: "Kendi zevkime göre tasarladığım, modern arayüzlü ve kullanıcı dostu bir anime izleme platformu.",
        proj_stgmulti_desc: "FiveM için yapılmış Modern arayüzlü ve kullanıcı dostu çoklu karakter oluşturma ve seçme ekranı.",
        proj_stgmult_title: "STG Multi Character",
        proj_portfolio_title: "Kişisel Portföy",
        proj_portfolio_desc: "Minimalist ve modern tasarıma sahip, Discord API entegreli kişisel tanıtım sitesi.",
        contrib_urpv_title: "URPV",
        contrib_urpv_desc: "FiveM sunucusu için sistem geliştirme, altyapı optimizasyonu ve oyun modlarının entegrasyonu.",
        contrib_hawksrp_title: "HawksRP",
        contrib_hawksrp_desc: "FiveM sunucusu için sistem geliştirme, altyapı optimizasyonu ve oyun modlarının entegrasyonu.",
        contrib_aty_title: "ATY Clothing",
        contrib_aty_desc: "FiveM için Giyim mağazası sisteminin backend altyapısının kurulması, veritabanı bağlantısı."
    },
    en: {
        nav_home: "Home",
        nav_about: "About Me",
        hero_greeting: "Hi, I'm",
        hero_headline: "Just hanging out,",
        cta_whatido: "What I Do?",
        cta_surprise: "See Surprise",
        discord_loading: "Loading...",
        discord_idle: "Currently idling.",
        skills_title: "Skills & Tools",
        footer_rights: "2025 All rights reserved.",
        about_title: "About Me",
        about_text: `My name is <strong>Alper</strong>, I've been into software since 2019, I'm currently active as a Developer at <a href="https://discord.gg/stg" target="_blank" style="color: #5865F2; text-decoration: none; font-weight: bold;">STG</a>.`,
        projects_title: "My Projects",
        contributions_title: "Contributions",
        proj_artseen_title: "ArtseeN FiveM",
        proj_artseen_desc: "Fun and functional open-source FiveM scripts I developed in my spare time as a hobby.",
        proj_animeverse_title: "AnimeVerse",
        proj_animeverse_desc: "A modern, user-friendly anime streaming platform designed to my taste.",
        proj_stgmulti_desc: "A modern, user-friendly multi-character creation and selection interface developed for FiveM.",
        proj_stgmult_title: "STG Multi Character",
        proj_portfolio_title: "Personal Portfolio",
        proj_portfolio_desc: "A minimalist and modern personal portfolio site with Discord API integration.",
        contrib_urpv_title: "URPV",
        contrib_urpv_desc: "Advanced system development, infrastructure optimization, and game mode integration for a FiveM server.",
        contrib_hawksrp_title: "HawksRP",
        contrib_hawksrp_desc: "Advanced system development, infrastructure optimization, and game mode integration for a FiveM server.",
        contrib_aty_title: "ATY Clothing",
        contrib_aty_desc: "Backend system development for an in-game clothing store in FiveM."
    }
};

let currentLang = localStorage.getItem('siteLang') || 'tr';
const langToggleBtn = document.getElementById('lang-toggle');

function updateContent() {
    const texts = translations[currentLang];


    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) {
            if (key === 'about_text') {
                el.innerHTML = texts[key];
            } else {
                el.textContent = texts[key];
            }
        }
    });
}

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentLang = currentLang === 'tr' ? 'en' : 'tr';
        localStorage.setItem('siteLang', currentLang);
        updateContent();
    });
}


updateContent();



