// Live Score Dashboard JavaScript - RMIT MAI Attack Level System with Firebase
document.addEventListener('DOMContentLoaded', async function() {
    // Attack level management for 18 tasks (each task pair starts at 100)
    let taskAttackLevels = Array(19).fill(100); // Index 1-18 for tasks
    let currentPeriod = 1;
    let timerInterval;
    let seconds = 0;
    let minutes = 0;
    let isTimerRunning = false;

    // DOM elements - declare first
    const scoreDisplays = {};
    const statusIndicators = {};
    const teamNames = {};

    for (let i = 1; i <= 18; i++) {
        scoreDisplays[i] = document.getElementById(`task${i}Score`);
        statusIndicators[i] = document.getElementById(`task${i}Status`);
        // Get defender and attacker name elements for editable team names
        const container = document.querySelector(`[id="task${i}Status"]`).closest('.task-container');
        teamNames[i] = {
            defender: container.querySelector('.defender-name'),
            attacker: container.querySelector('.attacker-name')
        };
    }

    const currentPeriodDisplay = document.getElementById('currentPeriod');
    const actionLog = document.getElementById('actionLog');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');

    // Firebase integration
    let db = null;
    let scoresDocRef = null;

    // Initialize Firebase if available
    if (window.firebaseDB) {
        console.log('Firebase is available, initializing...');
        db = window.firebaseDB;
        
        // Try different possible document paths
        const possiblePaths = [
            ['scores', 'current'],
            ['scores', 'scores'], 
            ['data', 'scores'],
            ['scores', 'data']
        ];
        
        for (const [collection, docId] of possiblePaths) {
            try {
                scoresDocRef = window.firebaseDoc(db, collection, docId);
                console.log(`Trying Firebase path: ${collection}/${docId}`);
                const docSnap = await window.firebaseGetDoc(scoresDocRef);
                if (docSnap.exists()) {
                    console.log(`Found scores document at ${collection}/${docId}:`, docSnap.data());
                    break;
                } else {
                    console.log(`No document found at ${collection}/${docId}`);
                }
            } catch (error) {
                console.log(`Error checking ${collection}/${docId}:`, error);
            }
        }
        
        // If no document found, use default path
        if (!scoresDocRef) {
            scoresDocRef = window.firebaseDoc(db, 'scores', 'current');
            console.log('Using default path: scores/current');
        }
        
        await loadScoresFromFirebase();
        
        // Listen for real-time updates from Firebase
        if (window.firebaseOnSnapshot) {
            window.firebaseOnSnapshot(scoresDocRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    console.log('Firebase real-time update received:', data);
                    if (data.scores && Array.isArray(data.scores)) {
                        data.scores.forEach(pair => {
                            if (pair.pair_id >= 1 && pair.pair_id <= 18) {
                                taskAttackLevels[pair.pair_id] = pair.score;
                                scoreDisplays[pair.pair_id].textContent = pair.score;
                                updateStatusIndicator(pair.pair_id);
                            }
                        });
                        logAction('Scores updated from Firebase (real-time)');
                    }
                } else {
                    console.log('Firebase document does not exist');
                }
            }, (error) => {
                console.error('Firebase real-time listener error:', error);
                logAction('Error listening to Firebase updates');
            });
        }
    }

    // Firebase functions
    async function loadScoresFromFirebase() {
        if (!db || !scoresDocRef) return;

        try {
            const docSnap = await window.firebaseGetDoc(scoresDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.scores && Array.isArray(data.scores)) {
                    data.scores.forEach(pair => {
                        if (pair.pair_id >= 1 && pair.pair_id <= 18) {
                            taskAttackLevels[pair.pair_id] = pair.score;
                            scoreDisplays[pair.pair_id].textContent = pair.score;
                            updateStatusIndicator(pair.pair_id);
                        }
                    });
                    logAction('Scores loaded from Firebase');
                }
            } else {
                // Create initial scores document
                await saveScoresToFirebase();
                logAction('Initial scores document created in Firebase');
            }
        } catch (error) {
            console.error('Error loading scores from Firebase:', error);
            logAction('Error loading scores from Firebase');
        }
    }

    async function saveScoresToFirebase() {
        if (!db || !scoresDocRef) return;

        try {
            const scoresData = {
                scores: []
            };

            for (let i = 1; i <= 18; i++) {
                const defenderName = teamNames[i].defender.textContent;
                const attackerName = teamNames[i].attacker.textContent;
                const pairName = `${defenderName} vs ${attackerName}`;

                scoresData.scores.push({
                    pair_id: i,
                    name: `Pair ${i}`,
                    score: taskAttackLevels[i]
                });
            }

            console.log('Saving scores to Firebase:', scoresData);
            await window.firebaseSetDoc(scoresDocRef, scoresData);
            console.log('Scores saved successfully to Firebase');
        } catch (error) {
            console.error('Error saving scores to Firebase:', error);
            logAction('Error saving scores to Firebase');
        }
    }

    // Timer functions
    function updateTimerDisplay() {
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    function startTimer() {
        if (!isTimerRunning) {
            isTimerRunning = true;
            timerInterval = setInterval(() => {
                seconds++;
                if (seconds === 60) {
                    seconds = 0;
                    minutes++;
                }
                updateTimerDisplay();
            }, 1000);
            logAction('Timer started');
        }
    }

    function pauseTimer() {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            logAction('Timer paused');
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        minutes = 0;
        seconds = 0;
        updateTimerDisplay();
        logAction('Timer reset');
    }

    // Attack Level functions
    async function updateAttackLevel(task, change) {
        // Apply the change to attack level
        taskAttackLevels[task] += change;
        
        // Clamp between 0 and 100
        taskAttackLevels[task] = Math.max(0, Math.min(100, taskAttackLevels[task]));
        
        scoreDisplays[task].textContent = taskAttackLevels[task];
        updateStatusIndicator(task);
        
        const action = change > 0 ? 'Block' : 'Attack';
        const absDifference = Math.abs(change);
        logAction(`Task ${task} - ${action} action: Level now ${taskAttackLevels[task]}`);

        // Save to Firebase
        await saveScoresToFirebase();
    }

    function updateStatusIndicator(task) {
        const level = taskAttackLevels[task];
        const indicator = statusIndicators[task];

        // Remove existing classes
        indicator.classList.remove('high-defense', 'mid-defense', 'low-defense', 'critical');

        // Color code based on attack level (100 = safe, 0 = compromised)
        if (level >= 75) {
            indicator.classList.add('high-defense'); // Green - well defended
        } else if (level >= 50) {
            indicator.classList.add('mid-defense'); // Yellow - moderate defense
        } else if (level >= 25) {
            indicator.classList.add('low-defense'); // Orange - weak defense
        } else {
            indicator.classList.add('critical'); // Red - critical
        }
    }

    // Period functions
    function changePeriod(direction) {
        if (direction === 'next') {
            currentPeriod++;
        } else if (direction === 'prev' && currentPeriod > 1) {
            currentPeriod--;
        }
        currentPeriodDisplay.textContent = currentPeriod;
        logAction(`Round changed to ${currentPeriod}`);
    }

    // Action logging
    function logAction(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        logEntry.textContent = `[${timestamp}] ${message}`;
        actionLog.appendChild(logEntry);

        // Keep only last 10 entries
        while (actionLog.children.length > 10) {
            actionLog.removeChild(actionLog.firstChild);
        }

        // Auto-scroll to bottom
        actionLog.scrollTop = actionLog.scrollHeight;
    }

    // Quick actions
    async function resetScores() {
        for (let i = 1; i <= 18; i++) {
            taskAttackLevels[i] = 100; // Reset all tasks to 100
            scoreDisplays[i].textContent = '100';
            updateStatusIndicator(i);
        }
        logAction('All task attack levels reset to 100');
        await saveScoresToFirebase();
    }

    function swapTeams() {
        // Swap defender and attacker names for all tasks
        for (let i = 1; i <= 18; i++) {
            const defenderName = teamNames[i].defender.textContent;
            const attackerName = teamNames[i].attacker.textContent;
            
            teamNames[i].defender.textContent = attackerName;
            teamNames[i].attacker.textContent = defenderName;
        }
        logAction('All defender/attacker teams swapped');
    }

    async function testFirebaseConnection() {
        if (!db) {
            console.log('Firebase not initialized');
            return;
        }

        try {
            console.log('Testing Firebase connection...');
            const testDoc = window.firebaseDoc(db, 'test', 'connection');
            await window.firebaseSetDoc(testDoc, { timestamp: new Date().toISOString() });
            console.log('Firebase write test successful');

            const docSnap = await window.firebaseGetDoc(testDoc);
            if (docSnap.exists()) {
                console.log('Firebase read test successful:', docSnap.data());
            }
        } catch (error) {
            console.error('Firebase connection test failed:', error);
        }
    }

    // Event listeners
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);

    // Attack/Block buttons
    document.querySelectorAll('.attack-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const task = parseInt(this.dataset.task);
            await updateAttackLevel(task, -5); // Attack reduces by 5
        });
    });

    document.querySelectorAll('.block-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const task = parseInt(this.dataset.task);
            await updateAttackLevel(task, 5); // Block increases by 5
        });
    });

    // Period buttons
    document.getElementById('prevPeriod').addEventListener('click', () => changePeriod('prev'));
    document.getElementById('nextPeriod').addEventListener('click', () => changePeriod('next'));

    // Quick action buttons
    document.getElementById('resetScores').addEventListener('click', resetScores);
    document.getElementById('swapTeams').addEventListener('click', swapTeams);
    document.getElementById('newGame').addEventListener('click', newCompetition);
    document.getElementById('refreshFirebase').addEventListener('click', refreshFromFirebase);
    document.getElementById('testFirebase').addEventListener('click', testFirebaseConnection);

    // Team name editing - log when names are changed
    for (let i = 1; i <= 18; i++) {
        teamNames[i].defender.addEventListener('blur', function() {
            logAction(`Task ${i} Defender renamed to "${this.textContent}"`);
        });
        teamNames[i].attacker.addEventListener('blur', function() {
            logAction(`Task ${i} Attacker renamed to "${this.textContent}"`);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', async function(e) {
        // Task 1: Q for +5, A for -5
        if (e.key.toLowerCase() === 'q') {
            e.preventDefault();
            await updateAttackLevel(1, 5);
        } else if (e.key.toLowerCase() === 'a') {
            e.preventDefault();
            await updateAttackLevel(1, -5);
        }
        // Task 2: W for +5, S for -5
        else if (e.key.toLowerCase() === 'w') {
            e.preventDefault();
            await updateAttackLevel(2, 5);
        } else if (e.key.toLowerCase() === 's') {
            e.preventDefault();
            await updateAttackLevel(2, -5);
        }
        // Space for timer start/pause
        else if (e.code === 'Space') {
            e.preventDefault();
            if (isTimerRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }
        // R for reset scores
        else if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            await resetScores();
        }
    });

    // Initialize
    updateTimerDisplay();
    for (let i = 1; i <= 18; i++) {
        updateStatusIndicator(i);
    }
    logAction('RMIT MAI Scoring System initialized - Ready for competition!');
});