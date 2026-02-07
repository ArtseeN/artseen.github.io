document.addEventListener('DOMContentLoaded', () => {

    const CONFIG = {
        discordID: "623569893589254154",

        steamID: "STEAM_0:1:607823243",
        joinDate: "September 14, 2019",
        bio: `"Welcome to the source engine."<br>Don't forget to reload.`,

        backgroundUrl: "",

        projects: [
            {
                title: "ArtseeN FiveM",
                desc: "Fun and functional open source FiveM scripts developed as a hobby.",
                tech: ["Lua", "FiveM", "Open Source"],
                url: "https://github.com/ArtseeN/artseenfivem2"
            },
            {
                title: "STG Multicharacter",
                desc: "Modern multi-character selection screen for FiveM servers.",
                tech: ["HTML", "CSS", "JS", "Lua"],
                url: "https://www.youtube.com/watch?v=WR8kA969AA0"
            },
            {
                title: "STG Driving School",
                desc: "Modern multi-character selection screen for FiveM servers.",
                tech: ["HTML", "CSS", "JS", "Lua"],
                url: "https://www.youtube.com/watch?v=YSda1gYG3zc"
            },
            {
                title: "AnimeVerse",
                desc: "User-friendly anime watching platform with a modern interface.",
                tech: ["Next.js", "React", "TSX"],
                url: "#"
            },
            {
                title: "Personal Portfolio",
                desc: "Minimalist personal site with Discord API integration.",
                tech: ["HTML", "CSS", "JS"],
                url: "#"
            }
        ],

        contributions: [
            {
                title: "URPV",
                desc: "Advanced system development and infrastructure optimization for FiveM.",
                tech: ["Backend", "FiveM", "Optimization"],
                url: "https://discord.gg/urp"
            },
            {
                title: "HawksRP",
                desc: "System design and game mode integration.",
                tech: ["Backend", "FiveM"],
                url: "https://discord.gg/ZzgEnymBmG"
            },
            {
                title: "ATY Clothing",
                desc: "Backend infrastructure for clothing store system.",
                tech: ["Backend", "Database"],
                url: "https://atiysu.tebex.io/package/7169426"
            }
        ],

        recentGames: [
            { name: "Visual Studio Code", time: "42.5 saat son iki hafta", img: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" },
            { name: "Counter-Strike 2", time: "18.2 saat son iki hafta", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg" },
            { name: "Grand Theft Auto V", time: "4.5 saat son iki hafta", img: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg" }
        ]
    };

    const APP_IMAGES = {
        "Counter-Strike 2": "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
        "Grand Theft Auto V": "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
        "FiveM": "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
        "Visual Studio Code": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg",
        "Spotify": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
        "Roblox": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg",
        "Minecraft": "https://cdn.cloudflare.steamstatic.com/steam/apps/1066780/header.jpg",
        "Valorant": "https://cdn.tracker.gg/valorant/db/agents/viper_full.png",
        "League of Legends": "https://cdn.cloudflare.steamstatic.com/steam/apps/127670/header.jpg"
    };

    let profileData = JSON.parse(localStorage.getItem('steam_bio_data_v6')) || {
        viewCount: 2024
    };

    let ws = null;
    let heartbeatInterval = null;

    function renderStatic() {
        document.getElementById('displayTag').textContent = CONFIG.steamID;
        document.getElementById('displayBio').innerHTML = CONFIG.bio;
        document.getElementById('displayJoinDate').textContent = CONFIG.joinDate;

        if (CONFIG.backgroundUrl) {
            document.body.style.backgroundImage = `url('${CONFIG.backgroundUrl}')`;
        }

        if (!sessionStorage.getItem('viewed_v6')) {
            profileData.viewCount++;
            sessionStorage.setItem('viewed_v6', 'true');
            saveToStorage();
        }
        document.getElementById('viewCount').textContent = profileData.viewCount.toLocaleString();

        renderProjects();
        renderContributions();
        renderGames();
    }

    function connectLanyard() {
        if (!CONFIG.discordID) {
            document.getElementById('displayStatus').textContent = "Offline (No Discord ID)";
            return;
        }

        ws = new WebSocket('wss://api.lanyard.rest/socket');

        ws.onopen = () => {
            console.log("Lanyard Connected");
            ws.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: CONFIG.discordID }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const { op, t, d } = data;

                if (op === 1) {
                    heartbeatInterval = setInterval(() => ws.send(JSON.stringify({ op: 3 })), d.heartbeat_interval);
                }
                if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
                    updateUI(d);
                }
            } catch (e) {
                console.error("Lanyard Message Error:", e);
            }
        };

        ws.onclose = () => {
            console.log("Lanyard Closed, reconnecting...");
            clearInterval(heartbeatInterval);
            setTimeout(connectLanyard, 3000);
        };

        ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
        };
    }

    function updateUI(data) {
        if (!data) return;

        try {
            const user = data.discord_user;
            if (user) {
                document.getElementById('displayUsername').textContent = user.username;
                const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
                document.getElementById('displayAvatar').src = avatarUrl;
            }
        } catch (e) { console.error("UI User Error:", e); }

        try {
            const status = data.discord_status || "offline";
            const frame = document.getElementById('avatarFrame');
            const statusEl = document.getElementById('displayStatus');
            const statusBox = document.querySelector('.status-box');
            const mab = document.getElementById('miniActivityBox');

            let statusText = status.charAt(0).toUpperCase() + status.slice(1);
            let statusClass = `status-${status}`;

            const activities = data.activities || [];
            const game = activities.find(a => a.type !== 4 && a.id !== 'spotify:1');
            const custom = activities.find(a => a.type === 4);

            if (game) {
                frame.style.borderColor = "#90ba3c";
                frame.className = `avatar-frame-large`;
            } else {
                frame.style.borderColor = "";
                frame.className = `avatar-frame-large ${status}`;
            }

            if (game) {
                if (statusBox) statusBox.style.display = "none";
                mab.style.display = "flex";

                document.getElementById('mabName').textContent = game.name;
                document.getElementById('mabDetails').textContent = game.details || game.state || "Oynuyor";

                let imgUrl = APP_IMAGES[game.name];

                if (!imgUrl) {
                    if (game.assets) {
                        if (game.assets.large_image) {
                            if (game.assets.large_image.startsWith('mp:')) {
                                imgUrl = `https://media.discordapp.net/${game.assets.large_image.replace('mp:', '')}`;
                            } else {
                                imgUrl = `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`;
                            }
                        } else if (game.assets.small_image) {
                            if (game.assets.small_image.startsWith('mp:')) {
                                imgUrl = `https://media.discordapp.net/${game.assets.small_image.replace('mp:', '')}`;
                            } else {
                                imgUrl = `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.small_image}.png`;
                            }
                        }
                    }

                    if (!imgUrl && game.application_id) {
                        imgUrl = `https://dcdn.dstn.to/app-icons/${game.application_id}`;
                    }
                }

                if (!imgUrl) imgUrl = "https://community.akamai.steamstatic.com/public/shared/images/apps/10_s.jpg";

                document.getElementById('mabIcon').src = imgUrl;

                if (game.timestamps && game.timestamps.start) {
                    window.currentGameStart = game.timestamps.start;
                    updateGameTimer();
                } else {
                    window.currentGameStart = null;
                    document.getElementById('mabTime').textContent = "Süre yok";
                }

            } else {
                window.currentGameStart = null;
                if (statusBox) statusBox.style.display = "block";
                mab.style.display = "none";

                if (custom && custom.state) {
                    statusText = custom.state;
                }
                statusEl.textContent = statusText;
                statusEl.className = `current-status ${statusClass}`;
            }

        } catch (e) { console.error("UI Status/Activity Error:", e); }

        try {
            if (data.listening_to_spotify && data.spotify) {
                document.getElementById('musicHeader').textContent = "Listening to Spotify";
                document.getElementById('musicHeader').style.color = "#1ed760";

                document.getElementById('songNameDisplay').textContent = data.spotify.song;
                document.getElementById('artistNameDisplay').textContent = data.spotify.artist;
                document.getElementById('musicArt').src = data.spotify.album_art_url;
                document.getElementById('musicProgress').style.width = '100%';
            } else {
                document.getElementById('musicHeader').textContent = "Music Inactive";
                document.getElementById('musicHeader').style.color = "#888";
                document.getElementById('songNameDisplay').textContent = "Not Playing";
                document.getElementById('artistNameDisplay').textContent = "";
                document.getElementById('musicArt').src = "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg";
                document.getElementById('musicProgress').style.width = '0%';
            }
        } catch (e) { console.error("UI Spotify Error:", e); }
    }

    function renderGames() {
        const gList = document.getElementById('discordActivityList');
        if (!gList) return;

        gList.innerHTML = '';
        if (CONFIG.recentGames && CONFIG.recentGames.length > 0) {
            CONFIG.recentGames.forEach(g => {
                const row = document.createElement('div');
                row.className = 'act-row';
                row.innerHTML = `
                    <img src="${g.img}" style="width:60px; height:28px; object-fit:cover; border:1px solid #444;">
                    <div>
                        <div class="act-title"><b>${escapeHtml(g.name)}</b></div>
                        <span class="time">${escapeHtml(g.time)}</span>
                    </div>
                `;
                gList.appendChild(row);
            });
        } else {
            gList.innerHTML = `<div style="padding:5px; color:#666; font-size:10px;">Görüntülenecek son aktivite yok.</div>`;
        }
    }

    function renderProjects() {
        const pList = document.getElementById('projectsList');
        if (!pList) return;
        pList.innerHTML = '';
        CONFIG.projects.forEach(p => {
            const d = document.createElement('a'); d.className = 'project-card'; d.href = p.url; d.target = "_blank";
            const tags = p.tech.map(t => `<span class="p-tag">${t}</span>`).join('');
            d.innerHTML = `
                <div class="p-header">
                    <span class="p-title">${escapeHtml(p.title)}</span>
                    <span class="p-desc">(${escapeHtml(p.desc)})</span>
                </div>
                <div class="p-tags">${tags}</div>
             `;
            pList.appendChild(d);
        });
    }

    function renderContributions() {
        const cList = document.getElementById('contributionsList');
        if (!cList) return;
        cList.innerHTML = '';
        CONFIG.contributions.forEach(p => {
            const d = document.createElement('a'); d.className = 'project-card'; d.href = p.url; d.target = "_blank";
            const tags = p.tech.map(t => `<span class="p-tag">${t}</span>`).join('');
            d.innerHTML = `
                <div class="p-header">
                    <span class="p-title">${escapeHtml(p.title)}</span>
                    <span class="p-desc">(${escapeHtml(p.desc)})</span>
                </div>
                <div class="p-tags">${tags}</div>
             `;
            cList.appendChild(d);
        });
    }

    const tabs = document.querySelectorAll('.steam-tab');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active')); contents.forEach(x => x.classList.remove('active'));
        t.classList.add('active'); document.getElementById(t.getAttribute('data-tab')).classList.add('active');
    }));

    function saveToStorage() { localStorage.setItem('steam_bio_data_v6', JSON.stringify(profileData)); }
    function escapeHtml(text) { return text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""; }

    window.currentGameStart = null;
    function updateGameTimer() {
        if (!window.currentGameStart) return;

        const el = document.getElementById('mabTime');
        if (!el) return;

        const now = Date.now();
        const elapsed = now - window.currentGameStart;

        if (elapsed < 0) return;

        const hrs = Math.floor(elapsed / 3600000);
        const mins = Math.floor((elapsed % 3600000) / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);

        let timeStr = "";
        if (hrs > 0) timeStr += `${hrs}s `;
        timeStr += `${mins}dk ${secs}sn geçen süre`;

        el.textContent = timeStr;
    }
    setInterval(updateGameTimer, 1000);

    renderStatic();
    connectLanyard();
});
