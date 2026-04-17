// Live Score Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Score management for 16 teams
    let teamScores = Array(17).fill(0); // Index 1-16 for teams
    let currentPeriod = 1;
    let timerInterval;
    let seconds = 0;
    let minutes = 0;
    let isTimerRunning = false;

    // Team roles: alternate defender/attacker
    const teamRoles = {};
    for (let i = 1; i <= 16; i++) {
        teamRoles[i] = i % 2 === 1 ? 'defender' : 'attacker';
    }

    // DOM elements
    const scoreDisplays = {};
    const roleIndicators = {};
    const statusIndicators = {};
    const teamNames = {};

    for (let i = 1; i <= 16; i++) {
        scoreDisplays[i] = document.getElementById(`team${i}Score`);
        roleIndicators[i] = document.getElementById(`team${i}Role`);
        statusIndicators[i] = document.getElementById(`team${i}Status`);
        teamNames[i] = document.getElementById(`team${i}Name`);

        // Set initial role indicators
        roleIndicators[i].textContent = teamRoles[i] === 'defender' ? 'Defender' : 'Attacker';
        roleIndicators[i].setAttribute('data-role', teamRoles[i]);
    }

    const currentPeriodDisplay = document.getElementById('currentPeriod');
    const actionLog = document.getElementById('actionLog');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');

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

    // Score functions
    function updateScore(team, change) {
        teamScores[team] += change;
        teamScores[team] = Math.max(0, teamScores[team]); // Prevent negative scores
        scoreDisplays[team].textContent = teamScores[team];
        updateStatusIndicator(team);
        logAction(`${teamNames[team].textContent} ${change > 0 ? '+' : '-'}${Math.abs(change)} point${Math.abs(change) !== 1 ? 's' : ''} (${teamScores[team]})`);
    }

    function updateStatusIndicator(team) {
        const score = teamScores[team];
        const role = teamRoles[team];
        const indicator = statusIndicators[team];

        // Remove existing classes
        indicator.classList.remove('defender-winning', 'attacker-losing', 'neutral');

        if (role === 'defender' && score > 0) {
            indicator.classList.add('defender-winning');
        } else if (role === 'attacker' && score < 0) {
            indicator.classList.add('attacker-losing');
        } else {
            indicator.classList.add('neutral');
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
    function resetScores() {
        for (let i = 1; i <= 16; i++) {
            teamScores[i] = 0;
            scoreDisplays[i].textContent = '0';
            updateStatusIndicator(i);
        }
        logAction('All scores reset to 0');
    }

    function swapTeams() {
        // Swap names and roles for all teams
        for (let i = 1; i <= 16; i += 2) {
            const teamA = i;
            const teamB = i + 1;

            // Swap names
            const tempName = teamNames[teamA].textContent;
            teamNames[teamA].textContent = teamNames[teamB].textContent;
            teamNames[teamB].textContent = tempName;

            // Swap scores
            const tempScore = teamScores[teamA];
            teamScores[teamA] = teamScores[teamB];
            teamScores[teamB] = tempScore;
            scoreDisplays[teamA].textContent = teamScores[teamA];
            scoreDisplays[teamB].textContent = teamScores[teamB];

            // Update status indicators
            updateStatusIndicator(teamA);
            updateStatusIndicator(teamB);
        }
        logAction('All team pairs swapped');
    }

    function newCompetition() {
        resetScores();
        resetTimer();
        currentPeriod = 1;
        currentPeriodDisplay.textContent = '1';

        // Reset team names to defaults
        const defaultNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi'];
        for (let i = 1; i <= 16; i++) {
            teamNames[i].textContent = `Team ${defaultNames[i-1]}`;
        }

        logAction('New RMIT MAI competition started');
    }

    // Event listeners
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);

    // Score buttons
    document.querySelectorAll('.score-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const team = parseInt(this.dataset.team);
            const change = this.classList.contains('increment') ? 1 : -1;
            updateScore(team, change);
        });
    });

    // Period buttons
    document.getElementById('prevPeriod').addEventListener('click', () => changePeriod('prev'));
    document.getElementById('nextPeriod').addEventListener('click', () => changePeriod('next'));

    // Quick action buttons
    document.getElementById('resetScores').addEventListener('click', resetScores);
    document.getElementById('swapTeams').addEventListener('click', swapTeams);
    document.getElementById('newGame').addEventListener('click', newGame);

    // Team name editing
    for (let i = 1; i <= 16; i++) {
        teamNames[i].addEventListener('input', function() {
            logAction(`Team ${i} renamed to "${this.textContent}"`);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Team 1: Q for +1, A for -1
        if (e.key.toLowerCase() === 'q') {
            e.preventDefault();
            updateScore(1, 1);
        } else if (e.key.toLowerCase() === 'a') {
            e.preventDefault();
            updateScore(1, -1);
        }
        // Team 2: E for +1, D for -1
        else if (e.key.toLowerCase() === 'e') {
            e.preventDefault();
            updateScore(2, 1);
        } else if (e.key.toLowerCase() === 'd') {
            e.preventDefault();
            updateScore(2, -1);
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
            resetScores();
        }
    });

    // Initialize
    updateTimerDisplay();
    for (let i = 1; i <= 16; i++) {
        updateStatusIndicator(i);
    }
    logAction('RMIT MAI Scoring System initialized - Ready for competition!');
});