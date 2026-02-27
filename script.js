document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DATA STRUCTURE (From Table) ---
    const aiSkillsData = {
        "Penulisan, Mesej & Kandungan": {
            colorClass: "cat-writing",
            tools: {
                "ChatGPT": "Menulis emel dan mesej",
                "Google Gemini": "Membalas mesej pelanggan atau kerja",
                "DeepSeek": "Membetulkan tatabahasa dan ejaan",
                "Microsoft Copilot (Word / Outlook)": "Menulis semula atau memperbaiki ayat",
                "Google Docs (Ciri AI)": "Merumuskan dokumen atau nota",
                "Notion AI": "Menyediakan kandungan pejabat",
                "Grammarly": "Membetulkan ayat dan ejaan"
            }
        },
        "Reka Bentuk, Poster & Imej": {
            colorClass: "cat-design",
            tools: {
                "ChatGPT": "Bagi idea poster dan flyer",
                "Google Gemini": "Mereka bentuk imej media sosial",
                "DeepSeek": "Buat gambar untuk pemasaran",
                "Canva Magic Studio": "Mengedit gambar",
                "Adobe Firefly": "Membuang atau menukar latar belakang",
                "Bing Image Creator": "Menjana gambar daripada teks",
                "PicsArt (Ciri AI)": "Mengedit dan dan buat gambar"
            }
        },
        "Video, Suara & Media": {
            colorClass: "cat-video",
            tools: {
                "CapCut": "Membuat video pendek",
                "Canva Video": "Mengedit video dengan senang",
                "InVideo": "Membuat video promosi atau pemasaran",
                "VEED.io": "Menambah sari kata pada video",
                "Descript": "Menukar teks kepada video",
                "Pictory": "Merakam atau mengedit suara",
                "HeyGen": "Membuat video avatar bercakap"
            }
        },
        "Pejabat, Mesyuarat & Kerja Harian": {
            colorClass: "cat-office",
            tools: {
                "Microsoft 365 Copilot": "Menulis emel dan dokumen dengan lebih cepat",
                "Google Workspace (AI)": "Merumuskan mesyuarat dan perbincangan",
                "Otter.ai": "Mengambil nota mesyuarat secara automatik",
                "Fireflies.ai": "Menyusun tugasan dan kerja harian",
                "Notion": "Merancang kerja dan menjejak kemajuan",
                "ClickUp AI": "Menyediakan pembentangan dan laporan",
                "Trello (Ciri AI)": "Mengurus tugasan dan projek pasukan"
            }
        },
        "Data, Laporan & Penyelidikan": {
            colorClass: "cat-data",
            tools: {
                "ChatGPT": "Menganalisis data dan nombor",
                "Google Gemini": "Menyediakan laporan dan ringkasan",
                "DeepSeek": "Membuat carta dan graf",
                "Microsoft Excel Copilot": "Mencari trend dan maklumat penting",
                "Google Sheets (Ciri AI)": "Menyelidik pasaran atau pesaing",
                "Perplexity AI": "Memahami data kaji selidik atau maklum balas",
                "Power BI Copilot": "Menerangkan data dengan senang faham"
            }
        },
        "Kejuruteraan, IT & Kerja Teknikal": {
            colorClass: "cat-tech",
            tools: {
                "ChatGPT": "Menulis kod menggunakan AI",
                "Google Gemini": "Menukar arahan kepada kod (vibe coding)",
                "DeepSeek": "Cadangan kod secara automatik",
                "Claude": "Membetulkan ralat kod",
                "GitHub Copilot": "Memperbaiki dan membersihkan kod",
                "Cursor": "Merancang cara sistem berfungsi",
                "JetBrains AI Assistant": "Mendapat bantuan apabila tersekat dengan kod"
            }
        }
    };

    // --- 2. APP STATE ---
    const state = {
        screen: 'lobby',
        stage: 1, // 1: Category -> Head, 2: Tool -> Body, 3: Usage -> Legs
        selectedCategory: null,
        selectedCategoryColor: null,
        selectedTool: null,
        completed: false,
        answers: {}
    };

    // --- 3. DOM ELEMENTS ---
    const screens = {
        lobby: document.getElementById('lobby'),
        gameplay: document.getElementById('gameplay'),
        completion: document.getElementById('completion')
    };

    const startBtn = document.getElementById('start-btn');
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const tutorialSkipBtn = document.getElementById('tutorial-skip');

    // Gameplay UI
    const tokenContainer = document.getElementById('token-container');
    const currentStageEl = document.getElementById('current-stage');
    const instructionMain = document.querySelector('.instruction-main');
    const instructionSub = document.querySelector('.instruction-sub');

    // Robot Parts & Drop Zones
    const robotParts = {
        head: document.getElementById('head'),
        body: document.getElementById('body'),
        arms: document.getElementById('arms'),
        legs: document.getElementById('legs')
    };

    const dropTargets = document.querySelectorAll('.drop-target');

    // --- 4. NAVIGATION LOGIC ---
    function switchScreen(screenName) {
        Object.values(screens).forEach(el => {
            el.classList.remove('active');
            setTimeout(() => {
                if (!el.classList.contains('active')) el.classList.add('hidden');
            }, 500);
        });

        const target = screens[screenName];
        target.classList.remove('hidden');
        // Force reflow
        void target.offsetWidth;
        target.classList.add('active');

        state.screen = screenName;
    }

    // --- 5. DRAG AND DROP SETUP ---
    let draggedItem = null;

    function setupTokens() {
        tokenContainer.innerHTML = '';
        let itemsToRender = [];
        let itemClass = 'cat-gray'; // Default

        // Determine what to show based on stage
        if (state.stage === 1) {
            instructionMain.innerText = 'Pilih kategori penggunaan AI dalam kerja anda.';
            instructionSub.innerText = 'Drag item ke arah Kepala Robot.';
            itemsToRender = Object.keys(aiSkillsData).map(cat => ({
                text: cat,
                value: cat,
                cssClass: aiSkillsData[cat].colorClass
            }));
        } else if (state.stage === 2) {
            instructionMain.innerText = 'Pilih alatan AI yang anda sering gunakan.';
            instructionSub.innerText = 'Drag alat (tool) ke arah Badan robot.';
            const toolsObj = aiSkillsData[state.selectedCategory].tools;
            itemsToRender = Object.keys(toolsObj).map(tool => ({
                text: tool,
                value: tool,
                cssClass: state.selectedCategoryColor
            }));
        } else if (state.stage === 3) {
            instructionMain.innerText = 'Bagaimana anda menggunakan alat tersebut?';
            instructionSub.innerText = 'Drag kegunaan ke arah Kaki robot.';

            // Just show the specific use case for the selected tool, or all if we want them to pick
            // Based on the table, it Maps 1:1, but the user implies they select the usage. Let's list all usages for that category to make it a choice.
            const toolsObj = aiSkillsData[state.selectedCategory].tools;
            // Get unique usages for this category
            const usages = [...new Set(Object.values(toolsObj))];

            itemsToRender = usages.map(usage => ({
                text: usage,
                value: usage,
                cssClass: state.selectedCategoryColor
            }));
        }

        // Render Tokens
        itemsToRender.forEach(item => {
            const token = document.createElement('div');
            token.classList.add('token', item.cssClass);
            token.textContent = item.text;
            token.setAttribute('draggable', 'true');
            token.dataset.value = item.value;

            // Drag Events
            token.addEventListener('dragstart', handleDragStart);
            token.addEventListener('dragend', handleDragEnd);

            // Touch events for mobile
            token.addEventListener('touchstart', handleTouchStart, { passive: false });
            token.addEventListener('touchmove', handleTouchMove, { passive: false });
            token.addEventListener('touchend', handleTouchEnd);
            token.addEventListener('touchcancel', handleTouchEnd);

            tokenContainer.appendChild(token);
        });

        if (currentStageEl) {
            currentStageEl.innerText = state.stage;
        }
        updateDropTargetsActiveState();
    }

    function updateDropTargetsActiveState() {
        // Only allow dropping on the current active target
        const activeTargetName = state.stage === 1 ? 'head' : (state.stage === 2 ? 'body' : 'legs');
        dropTargets.forEach(target => {
            if (target.dataset.target === activeTargetName) {
                target.style.display = ''; // Revert to default SVG display
                target.style.pointerEvents = 'all';
            } else {
                target.style.display = 'none';
                target.style.pointerEvents = 'none';
            }
        });
    }

    // --- HTML5 Drag Events ---
    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => this.style.opacity = '0.5', 0);
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        draggedItem = null;
        dropTargets.forEach(t => t.classList.remove('highlight'));
    }

    // Drop Zones Events
    dropTargets.forEach(target => {
        target.addEventListener('dragover', e => {
            e.preventDefault();
            target.classList.add('highlight');
        });

        target.addEventListener('dragleave', e => {
            target.classList.remove('highlight');
        });

        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('highlight');
            if (draggedItem) {
                processDrop(target.dataset.target, draggedItem.dataset.value);
            }
        });
    });

    // --- Mobile Touch Drag Logic (Simplified for SVGs) ---
    // A more robust implementation would create a clone for following the finger, 
    // but we'll use a basic intersection logic here.
    let touchClone = null;

    function handleTouchStart(e) {
        draggedItem = this;

        // Visual feedback
        this.style.opacity = '0.5';

        // Cleanup prev if any
        if (touchClone && touchClone.parentNode) {
            touchClone.parentNode.removeChild(touchClone);
        }

        // Create visual clone
        touchClone = this.cloneNode(true);
        touchClone.style.position = 'absolute';
        touchClone.style.zIndex = '9999';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.opacity = '0.9';
        document.body.appendChild(touchClone);

        moveTouchClone(e.touches[0]);
    }

    function handleTouchMove(e) {
        if (!touchClone) return;
        e.preventDefault(); // Prevent scrolling
        moveTouchClone(e.touches[0]);
    }

    function moveTouchClone(touch) {
        touchClone.style.left = touch.clientX - (touchClone.offsetWidth / 2) + 'px';
        touchClone.style.top = touch.clientY - (touchClone.offsetHeight / 2) + 'px';
    }

    function handleTouchEnd(e) {
        let targetName = null;
        let droppedVal = draggedItem ? draggedItem.dataset.value : null;

        if (touchClone) {
            const touch = e.changedTouches ? e.changedTouches[0] : null;
            if (touch) {
                touchClone.style.display = 'none';
                const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                if (elemBelow && elemBelow.classList.contains('drop-target')) {
                    targetName = elemBelow.dataset.target;
                }
            }

            if (touchClone.parentNode) {
                touchClone.parentNode.removeChild(touchClone);
            }
            touchClone = null;
        }

        if (draggedItem) {
            draggedItem.style.opacity = '1';
            draggedItem = null;
        }

        if (targetName && droppedVal) {
            processDrop(targetName, droppedVal);
        }
    }


    // --- 6. GAME PROGRESSION ---
    function processDrop(targetName, droppedValue) {
        console.log(`Dropped ${droppedValue} onto ${targetName}`);

        if (state.stage === 1 && targetName === 'head') {
            // Stage 1 -> Head
            state.selectedCategory = droppedValue;
            state.selectedCategoryColor = Object.keys(aiSkillsData).find(key => key === droppedValue)
                ? aiSkillsData[droppedValue].colorClass : 'cat-gray';

            robotParts.head.classList.add('active');
            state.answers.category = droppedValue;

            state.stage = 2;
            setupTokens();

        } else if (state.stage === 2 && targetName === 'body') {
            // Stage 2 -> Body
            state.selectedTool = droppedValue;
            robotParts.body.classList.add('active');
            // Arms activate with body logic
            robotParts.arms.classList.add('active');
            state.answers.tool = droppedValue;

            state.stage = 3;
            setupTokens();

        } else if (state.stage === 3 && targetName === 'legs') {
            // Stage 3 -> Legs
            robotParts.legs.classList.add('active');
            state.answers.usage = droppedValue;

            setTimeout(() => {
                showEmailPopup();
            }, 800);
        }
    }

    function showEmailPopup() {
        // Hide gameplay screen to remove the white box behind the popup
        const gameplayScreen = document.getElementById('gameplay');
        gameplayScreen.classList.remove('active');
        gameplayScreen.classList.add('hidden');

        document.getElementById('email-overlay').classList.remove('hidden');
    }

    function completeGame() {
        state.completed = true;
        console.log("Final Answers:", state.answers);
        switchScreen('completion');
    }

    // --- 7. INIT EVENTS ---
    startBtn.addEventListener('click', () => {
        tutorialOverlay.classList.remove('hidden');
    });

    tutorialSkipBtn.addEventListener('click', () => {
        tutorialOverlay.classList.add('hidden');
        switchScreen('gameplay');
        setupTokens(); // Initialize Stage 1 here
    });

    const submitEmailBtn = document.getElementById('submit-email-btn');
    const emailInput = document.getElementById('user-email');
    const emailError = document.getElementById('email-error');
    const emailOverlay = document.getElementById('email-overlay');

    if (submitEmailBtn) {
        submitEmailBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            // Basic email validation
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                emailError.style.display = 'none';
                state.answers.email = email;

                // Hide popup
                emailOverlay.classList.add('hidden');

                // Proceed to completion screen
                completeGame();
            } else {
                emailError.style.display = 'block';
            }
        });
    }

    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    console.log('System Initialized');
});
