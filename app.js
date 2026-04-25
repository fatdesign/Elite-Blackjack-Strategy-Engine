// Blackjack Elite Pro - Core Logic
const state = {
    runningCount: 0,
    totalCardsDealt: 0,
    deckCount: 8,
    dealerHand: [],
    playerHands: [[], []],
    activeHandIndex: 0,
    tableHistory: [],
    dealerHitsS17: false,
    activeSlot: { type: 'player', index: 0, hand: 0 },
    tableMode: false,
    history: [],
    stats: { win: 0, loss: 0, push: 0 },
    splitActive: false,
    unitSize: 10,
    bankroll: 1000,
    aceCount: 0,
    kellyMode: '1/2',
    targetGoal: 2000,
    // RNG Mode
    rngMode: false,
    rngRoundsTracked: 0   // Completed rounds observed without shoe reset
};

const COUNT_VALUES = {
    '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
    '7': 0, '8': 0, '9': 0,
    '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
};

const STRATEGY = {
    hard: {
        5:  ['H','H','H','H','H','H','H','H','H','H'],
        6:  ['H','H','H','H','H','H','H','H','H','H'],
        7:  ['H','H','H','H','H','H','H','H','H','H'],
        8:  ['H','H','H','H','H','H','H','H','H','H'],
        9:  ['H','D','D','D','D','H','H','H','H','H'],
        10: ['D','D','D','D','D','D','D','D','H','H'],
        11: ['D','D','D','D','D','D','D','D','D','H'],
        12: ['H','H','S','S','S','H','H','H','H','H'],
        13: ['S','S','S','S','S','H','H','H','H','H'],
        14: ['S','S','S','S','S','H','H','H','H','H'],
        15: ['S','S','S','S','S','H','H','H','H','H'],
        16: ['S','S','S','S','S','H','H','H','H','H'],
        17: ['S','S','S','S','S','S','S','S','S','S']
    },
    soft: {
        13: ['H','H','H','D','D','H','H','H','H','H'],
        14: ['H','H','H','D','D','H','H','H','H','H'],
        15: ['H','H','D','D','D','H','H','H','H','H'],
        16: ['H','H','D','D','D','H','H','H','H','H'],
        17: ['H','D','D','D','D','H','H','H','H','H'],
        18: ['S','D','D','D','D','S','S','H','H','H'],
        19: ['S','S','S','S','S','S','S','S','S','S']
    },
    pairs: {
        2:  ['P','P','P','P','P','P','H','H','H','H'],
        4:  ['H','H','H','P','P','H','H','H','H','H'],
        6:  ['H','H','H','H','H','H','H','H','H','H'],
        8:  ['D','D','D','D','D','D','D','D','H','H'],
        10: ['P','P','P','P','P','H','H','H','H','H'],
        12: ['P','P','P','P','P','P','H','H','H','H'],
        14: ['P','P','P','P','P','P','P','P','P','P'],
        16: ['P','P','P','P','P','S','P','P','S','S'],
        18: ['S','S','S','S','S','S','S','S','S','S'],
        20: ['P','P','P','P','P','P','P','P','P','P']
    }
};

const elements = {
    runningCount: document.getElementById('running-count'),
    trueCount: document.getElementById('true-count'),
    decksRemaining: document.getElementById('decks-remaining'),
    adviceOutput: document.getElementById('advice-output'),
    adviceDetails: document.getElementById('advice-details'),
    tableHistoryFeed: document.getElementById('table-history-feed'),
    toggleTableBtn: document.getElementById('toggle-table-mode'),
    keys: document.querySelectorAll('.key'),
    deckSelect: document.getElementById('deck-count'),
    newRoundBtn: document.getElementById('new-round'),
    clearHandBtn: document.getElementById('clear-hand'),
    undoBtn: document.getElementById('undo-btn'),
    resetShoeBtn: document.getElementById('reset-shoe'),
    resetStatsBtn: document.getElementById('reset-stats'),
    splitBtn: document.getElementById('split-btn'),
    s17Stand: document.getElementById('s17-stand'),
    s17Hit: document.getElementById('s17-hit'),
    statWin: document.getElementById('stat-win'),
    statLoss: document.getElementById('stat-loss'),
    statPush: document.getElementById('stat-push'),
    winRate: document.getElementById('win-rate-val'),
    outcomeWin: document.getElementById('outcome-win'),
    outcomeLoss: document.getElementById('outcome-loss'),
    outcomePush: document.getElementById('outcome-push'),
    dealerTotal: document.getElementById('dealer-total'),
    playerTotal0: document.getElementById('player-total-0'),
    playerTotal1: document.getElementById('player-total-1'),
    hand1: document.getElementById('hand-1'),
    hand2: document.getElementById('hand-2'),
    penetrationVal: document.getElementById('penetration-val'),
    penetrationBar: document.getElementById('penetration-bar'),
    betMultiplier: document.getElementById('bet-multiplier'),
    recBetVal: document.getElementById('rec-bet-val'),
    edgeVal: document.getElementById('edge-val'),
    aceDensity: document.getElementById('ace-density'),
    rorVal: document.getElementById('ror-val'),
    penetrationStatus: document.getElementById('penetration-status'),
    minBankrollVal: document.getElementById('min-bankroll-val'),
    bankrollInput: document.getElementById('bankroll-input'),
    unitSizeInput: document.getElementById('unit-size-input'),
    modeKelly12: document.getElementById('mode-kelly-1-2'),
    modeKellyFull: document.getElementById('mode-kelly-full'),
    dealerBustProb: document.getElementById('dealer-bust-prob'),
    exportLogsBtn: document.getElementById('export-logs'),
    // RNG Mode elements
    rngModeOff: document.getElementById('rng-mode-off'),
    rngModeOn: document.getElementById('rng-mode-on'),
    rngWarningBanner: document.getElementById('rng-warning-banner'),
    rngStatusBadge: document.getElementById('rng-status-badge'),
    rngConfidencePct: document.getElementById('rng-confidence-pct'),
    rngConfidenceBar: document.getElementById('rng-confidence-bar'),
    rngNoteText: document.getElementById('rng-note-text'),
    rngSidebarIndicator: document.getElementById('rng-sidebar-indicator'),
    rngSidebarVal: document.getElementById('rng-sidebar-val'),
    rngSidebarBar: document.getElementById('rng-sidebar-bar'),
    rngRoundsVal: document.getElementById('rng-rounds-val')
};

function init() {
    loadFromStorage(); // New
    setupEventListeners();
    updateHUD();
    refreshSlots();
    refreshUI(); // Ensure consistent UI state
}

function setupEventListeners() {
    elements.keys.forEach(key => {
        key.addEventListener('click', () => handleKeyInput(key.dataset.val));
    });

    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('click', () => {
            setTableMode(false);
            selectSlot(slot);
        });
    });

    elements.toggleTableBtn.addEventListener('click', () => setTableMode(!state.tableMode));
    elements.newRoundBtn.addEventListener('click', clearTable);
    elements.clearHandBtn.addEventListener('click', clearTable);
    elements.undoBtn.addEventListener('click', undoLastAction);
    elements.resetShoeBtn.addEventListener('click', resetShoe);
    elements.resetStatsBtn.addEventListener('click', resetStats);
    elements.resetStatsBtn.addEventListener('click', () => resetStats());
    elements.splitBtn.addEventListener('click', executeSplit);
    
    elements.outcomeWin.addEventListener('click', () => recordOutcome('win'));
    elements.outcomeLoss.addEventListener('click', () => recordOutcome('loss'));
    elements.outcomePush.addEventListener('click', () => recordOutcome('push'));

    elements.deckSelect.addEventListener('change', (e) => {
        state.deckCount = parseInt(e.target.value);
        resetShoe();
    });

    elements.s17Stand.addEventListener('click', () => {
        state.dealerHitsS17 = false;
        elements.s17Stand.classList.add('active');
        elements.s17Hit.classList.remove('active');
        refreshUI();
    });

    elements.s17Hit.addEventListener('click', () => {
        state.dealerHitsS17 = true;
        elements.s17Hit.classList.add('active');
        elements.s17Stand.classList.remove('active');
        refreshUI();
    });

    elements.bankrollInput.addEventListener('change', (e) => {
        state.bankroll = parseFloat(e.target.value) || 1000;
        refreshUI();
    });

    elements.unitSizeInput.addEventListener('change', (e) => {
        state.unitSize = parseFloat(e.target.value) || 10;
        refreshUI();
    });

    elements.modeKelly12.addEventListener('click', () => {
        state.kellyMode = '1/2';
        elements.modeKelly12.classList.add('active');
        elements.modeKellyFull.classList.remove('active');
        refreshUI();
    });

    elements.modeKellyFull.addEventListener('click', () => {
        state.kellyMode = 'full';
        elements.modeKellyFull.classList.add('active');
        elements.modeKelly12.classList.remove('active');
        refreshUI();
    });

    elements.exportLogsBtn.addEventListener('click', exportSessionCSV);

    // --- RNG Mode Toggles ---
    elements.rngModeOff.addEventListener('click', () => setRNGMode(false));
    elements.rngModeOn.addEventListener('click', () => setRNGMode(true));
}

// Persistence Methods
function saveToStorage() {
    localStorage.setItem('blackjackElite_state', JSON.stringify(state));
}

function loadFromStorage() {
    const saved = localStorage.getItem('blackjackElite_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
            // Sync settings UI
            elements.deckSelect.value = state.deckCount;
            if (state.dealerHitsS17) {
                elements.s17Hit.classList.add('active');
                elements.s17Stand.classList.remove('active');
            } else {
                elements.s17Stand.classList.add('active');
                elements.s17Hit.classList.remove('active');
            }
            if (state.splitActive) {
                elements.hand2.classList.remove('hidden');
            }
            // Restore RNG Mode UI if it was active
            if (state.rngMode) {
                elements.rngModeOff.classList.remove('active');
                elements.rngModeOn.classList.add('active');
                elements.rngModeOn.classList.add('rng-active');
                elements.rngWarningBanner.classList.remove('hidden');
                elements.rngSidebarIndicator.classList.remove('hidden');
                // updateRNGIndicator() will be called via refreshUI() in init()
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }
}

function setTableMode(val) {
    state.tableMode = val;
    if (val) {
        elements.toggleTableBtn.textContent = "TABLE";
        elements.toggleTableBtn.classList.add('table-active');
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
    } else {
        elements.toggleTableBtn.textContent = "HAND";
        elements.toggleTableBtn.classList.remove('table-active');
        const slotSelector = `.slot[data-type="${state.activeSlot.type}"][data-index="${state.activeSlot.index}"]${state.activeSlot.type==='player' ? `[data-hand="${state.activeSlot.hand}"]` : ''}`;
        const slot = document.querySelector(slotSelector);
        if (slot) slot.classList.add('active');
    }
}

function selectSlot(slot) {
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
    slot.classList.add('active');
    state.activeSlot = { 
        type: slot.dataset.type, 
        index: parseInt(slot.dataset.index),
        hand: slot.dataset.hand ? parseInt(slot.dataset.hand) : 0
    };
    if (state.activeSlot.type === 'player') {
        state.activeHandIndex = state.activeSlot.hand;
    }
    refreshHandHighlight();
}

function refreshHandHighlight() {
    elements.hand1.classList.toggle('active', state.activeHandIndex === 0 && !state.tableMode);
    elements.hand2.classList.toggle('active', state.activeHandIndex === 1 && !state.tableMode);
}

function handleKeyInput(val) {
    if (state.tableMode) addTableCard(val);
    else addCard(val);
}

function addCard(val) {
    state.history.push({
        val, 
        type: state.activeSlot.type, 
        index: state.activeSlot.index,
        hand: state.activeSlot.hand || 0,
        prevRunningCount: state.runningCount, 
        prevTotalDealt: state.totalCardsDealt
    });
    state.runningCount += COUNT_VALUES[val];
    state.totalCardsDealt++;
    
    if (state.activeSlot.type === 'dealer') {
        state.dealerHand[state.activeSlot.index] = val;
    } else {
        state.playerHands[state.activeHandIndex][state.activeSlot.index] = val;
    }
    
    if (val === 'A') state.aceCount++;
    
    refreshUI();
    advanceSlot();
    updateAdvice();
}

function addTableCard(val) {
    state.history.push({
        val, type: 'table', index: state.tableHistory.length,
        prevRunningCount: state.runningCount, prevTotalDealt: state.totalCardsDealt
    });
    state.runningCount += COUNT_VALUES[val];
    state.totalCardsDealt++;
    state.tableHistory.push(val);
    
    if (val === 'A') state.aceCount++;

    refreshUI();
}


function executeSplit() {
    if (state.playerHands[0].length !== 2) return;
    state.splitActive = true;
    const secondCard = state.playerHands[0][1];
    state.playerHands[0][1] = undefined;
    state.playerHands[1][0] = secondCard;
    
    state.activeHandIndex = 0;
    state.activeSlot = { type: 'player', index: 1, hand: 0 };
    
    elements.hand2.classList.remove('hidden');
    elements.splitBtn.classList.add('hidden');
    
    refreshUI();
    updateAdvice();
}

function recordOutcome(type) {
    state.stats[type]++;
    // Track rounds for RNG confidence building
    if (state.rngMode) {
        state.rngRoundsTracked++;
    }
    // Log the round for export
    state.history.push({
        timestamp: new Date().toLocaleTimeString(),
        type: type,
        tc: calculateTrueCount().toFixed(2),
        rc: state.runningCount,
        bet: state.unitSize * Math.max(1, Math.floor(calculateTrueCount() * (state.kellyMode === '1/2' ? 0.5 : 1) * 2))
    });
    updateStatsUI();
    clearTable();
}

function updateStatsUI() {
    elements.statWin.textContent = state.stats.win;
    elements.statLoss.textContent = state.stats.loss;
    elements.statPush.textContent = state.stats.push;
    const total = state.stats.win + state.stats.loss + state.stats.push;
    if (total > 0) {
        const rate = ((state.stats.win / total) * 100).toFixed(1);
        elements.winRate.textContent = `${rate}%`;
    } else {
        elements.winRate.textContent = `0%`;
    }
}

function undoLastAction() {
    if (state.history.length === 0) return;
    const lastAction = state.history.pop();
    state.runningCount = lastAction.prevRunningCount;
    state.totalCardsDealt = lastAction.prevTotalDealt;
    
    if (lastAction.type === 'dealer') {
        state.dealerHand[lastAction.index] = undefined;
        selectSlot(document.querySelector(`.slot[data-type="dealer"][data-index="${lastAction.index}"]`));
        setTableMode(false);
    } else if (lastAction.type === 'player') {
        state.playerHands[lastAction.hand][lastAction.index] = undefined;
        selectSlot(document.querySelector(`.slot[data-type="player"][data-hand="${lastAction.hand}"][data-index="${lastAction.index}"]`));
        setTableMode(false);
    } else if (lastAction.type === 'table') {
        state.tableHistory.pop();
    }
    
    if (state.splitActive && state.playerHands[1].filter(Boolean).length === 0) {
        state.splitActive = false;
        elements.hand2.classList.add('hidden');
    }
    
    if (lastAction.val === 'A') state.aceCount--;
    
    refreshUI();
}

function advanceSlot() {
    let nextIndex = state.activeSlot.index + 1;
    let nextType = state.activeSlot.type;
    let nextHand = state.activeHandIndex;
    
    if (nextType === 'dealer' && nextIndex >= 5) { 
        nextType = 'player'; 
        nextIndex = 0; 
        nextHand = 0;
    }
    else if (nextType === 'player' && nextIndex >= 6) {
        if (state.splitActive && nextHand === 0) {
            nextHand = 1;
            nextIndex = 1;
        } else {
            nextIndex = 5;
        }
    }
    
    const selector = `.slot[data-type="${nextType}"][data-index="${nextIndex}"]${nextType==='player' ? `[data-hand="${nextHand}"]` : ''}`;
    const nextSlot = document.querySelector(selector);
    if (nextSlot) {
        selectSlot(nextSlot);
    }
}

function calculateTrueCount() {
    const cardsPerDeck = 52;
    const decksDealt = state.totalCardsDealt / cardsPerDeck;
    const remainingDecks = Math.max(0.5, state.deckCount - decksDealt);
    return state.runningCount / remainingDecks;
}

function updateHUD() {
    const tc = calculateTrueCount();
    const cardsPerDeck = 52;
    const totalCards = state.deckCount * cardsPerDeck;
    const penetration = (state.totalCardsDealt / totalCards) * 100;

    elements.runningCount.textContent = state.runningCount;
    elements.trueCount.textContent = tc.toFixed(2);
    elements.decksRemaining.textContent = (state.deckCount - (state.totalCardsDealt / 52)).toFixed(1);
    
    // Ace Density Calculation
    const expectedAces = (state.totalCardsDealt / 13);
    const aceDiff = expectedAces - state.aceCount;
    let densityText = "NEUTRAL";
    let densityColor = "var(--text-secondary)";
    
    if (aceDiff >= 1) { densityText = "ACE RICH"; densityColor = "var(--accent-success)"; }
    else if (aceDiff <= -1) { densityText = "ACE POOR"; densityColor = "var(--accent-danger)"; }
    
    if (elements.aceDensity) {
        elements.aceDensity.textContent = densityText;
        elements.aceDensity.style.color = densityColor;
    }

    // Update Penetration UI
    if (elements.penetrationVal) elements.penetrationVal.textContent = `${penetration.toFixed(1)}%`;
    if (elements.penetrationBar) elements.penetrationBar.style.width = `${Math.min(100, penetration)}%`;
    
    if (elements.penetrationStatus) {
        if (penetration < 50) {
            elements.penetrationStatus.textContent = "LOW RELIABILITY";
            elements.penetrationStatus.style.background = "rgba(255, 77, 77, 0.15)";
            elements.penetrationStatus.style.color = "var(--accent-danger)";
        } else if (penetration < 75) {
            elements.penetrationStatus.textContent = "STABLE";
            elements.penetrationStatus.style.background = "rgba(255, 170, 0, 0.15)";
            elements.penetrationStatus.style.color = "var(--risk-med)";
        } else {
            elements.penetrationStatus.textContent = "MASTER LEVEL";
            elements.penetrationStatus.style.background = "rgba(0, 255, 136, 0.15)";
            elements.penetrationStatus.style.color = "var(--accent-success)";
        }
    }

    elements.trueCount.style.color = tc >= 2 ? 'var(--accent-success)' : tc <= -2 ? 'var(--accent-danger)' : 'var(--accent-gold)';
    
    updateDealerBustHUD(tc);
    updateBettingAdvice(tc, aceDiff);
}

function updateDealerBustHUD(tc) {
    if (!elements.dealerBustProb) return;
    const dealerUp = state.dealerHand[0];
    if (!dealerUp) {
        elements.dealerBustProb.classList.add('hidden');
        return;
    }
    
    elements.dealerBustProb.classList.remove('hidden');
    const baseBust = { '2': 35, '3': 37, '4': 40, '5': 43, '6': 42, '7': 26, '8': 24, '9': 23, '10': 21, 'J': 21, 'Q': 21, 'K': 21, 'A': 17 };
    const val = dealerUp;
    // Simple adjustment: Each point of TC adds or subtracts from bust chance
    // High TC = more big cards = dealer busts more on 2-6
    const adjustment = getCardValue(val) <= 6 ? tc * 1.5 : -tc * 0.5;
    const prob = Math.min(60, Math.max(5, baseBust[val] + adjustment));
    elements.dealerBustProb.textContent = `Bust: ${prob.toFixed(0)}%`;
}

function updateBettingAdvice(tc, aceDiff) {
    // Base edge calculation
    // Hi-Lo Edge: +0.5% per True Count point, Ace factor: +0.1% per point
    const rawEdge = -0.5 + (tc * 0.5) + (aceDiff * 0.1);

    if (state.rngMode) {
        // ─── RNG MODE: Confidence-adjusted betting ───
        const confidence = calculateRNGConfidence(); // 0-100
        const confidenceFactor = confidence / 100;  // 0.0 to 1.0

        // Edge is scaled by confidence: low confidence → base house edge only
        const adjustedEdge = -0.5 + ((tc * 0.5) + (aceDiff * 0.1)) * confidenceFactor;

        // Bet: only go above 1x unit if confidence is > 50% AND edge is positive
        const kellyFactor = state.kellyMode === '1/2' ? 0.5 : 1.0;
        let multiplier = 1;
        if (confidence >= 50 && adjustedEdge > 0) {
            multiplier = Math.max(1, Math.floor(tc * kellyFactor * confidenceFactor * 2));
        }
        const recBet = state.unitSize * multiplier;

        if (elements.betMultiplier) {
            elements.betMultiplier.textContent = confidence < 50 ? `BASE BET` : `${multiplier}x Unit`;
        }
        if (elements.recBetVal) elements.recBetVal.textContent = `€${recBet}`;
        if (elements.edgeVal) {
            elements.edgeVal.textContent = `${adjustedEdge >= 0 ? '+' : ''}${adjustedEdge.toFixed(2)}%`;
            elements.edgeVal.style.color = adjustedEdge > 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
            // Dim edge if low confidence
            elements.edgeVal.classList.toggle('edge-unreliable', confidence < 30);
        }

        // RoR uses adjusted edge
        if (elements.rorVal) {
            if (adjustedEdge <= 0) {
                elements.rorVal.textContent = "100%";
                elements.rorVal.style.color = "var(--risk-high)";
            } else {
                const ror = Math.exp(-2 * (adjustedEdge/100) * state.bankroll / (1.15 * Math.pow(state.unitSize, 2)));
                const rorPercent = (ror * 100).toFixed(2);
                elements.rorVal.textContent = `${rorPercent}%`;
                elements.rorVal.style.color = rorPercent < 1 ? "var(--risk-low)" : rorPercent < 5 ? "var(--risk-med)" : "var(--risk-high)";
            }
        }
        if (elements.minBankrollVal) {
            const positiveEdge = Math.max(0.01, adjustedEdge) / 100;
            const suggested = Math.ceil(-Math.log(0.05) * (1.15 * Math.pow(state.unitSize, 2)) / (2 * positiveEdge));
            elements.minBankrollVal.textContent = `€${suggested.toLocaleString()}`;
            elements.minBankrollVal.style.color = state.bankroll >= suggested ? "var(--accent-success)" : "var(--risk-med)";
        }

        updateRNGIndicator();
        return;
    }

    // ─── NORMAL MODE: Standard Kelly betting ───
    const edge = rawEdge;
    const kellyFactor = state.kellyMode === '1/2' ? 0.5 : 1.0;
    const multiplier = edge <= 0 ? 1 : Math.max(1, Math.floor(tc * kellyFactor * 2));
    const recBet = state.unitSize * multiplier;

    if (elements.betMultiplier) elements.betMultiplier.textContent = `${multiplier}x Unit`;
    if (elements.recBetVal) elements.recBetVal.textContent = `€${recBet}`;
    if (elements.edgeVal) {
        elements.edgeVal.textContent = `${edge >= 0 ? '+' : ''}${edge.toFixed(2)}%`;
        elements.edgeVal.style.color = edge > 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
        elements.edgeVal.classList.remove('edge-unreliable');
    }

    // Risk of Ruin Approximation
    // RoR = exp(-2 * Edge * Bankroll / (Variance * Unit^2)),  Variance ≈ 1.15
    if (elements.rorVal) {
        if (edge <= 0) {
            elements.rorVal.textContent = "100%";
            elements.rorVal.style.color = "var(--risk-high)";
        } else {
            const ror = Math.exp(-2 * (edge/100) * state.bankroll / (1.15 * Math.pow(state.unitSize, 2)));
            const rorPercent = (ror * 100).toFixed(2);
            elements.rorVal.textContent = `${rorPercent}%`;
            elements.rorVal.style.color = rorPercent < 1 ? "var(--risk-low)" : rorPercent < 5 ? "var(--risk-med)" : "var(--risk-high)";
        }
    }
    
    // Suggested Bankroll for 5% RoR
    if (elements.minBankrollVal) {
        const positiveEdge = Math.max(0.01, edge) / 100;
        const suggested = Math.ceil(-Math.log(0.05) * (1.15 * Math.pow(state.unitSize, 2)) / (2 * positiveEdge));
        elements.minBankrollVal.textContent = `€${suggested.toLocaleString()}`;
        elements.minBankrollVal.style.color = state.bankroll >= suggested ? "var(--accent-success)" : "var(--risk-med)";
    }
}

function updateAdvice() {
    const dealerUpcard = state.dealerHand[0];
    const playerActiveCards = state.playerHands[state.activeHandIndex].filter(Boolean);
    
    if (!dealerUpcard || playerActiveCards.length < 1) {
        elements.adviceOutput.textContent = "WAITING";
        elements.adviceOutput.className = "advice-value pulse";
        elements.adviceDetails.textContent = "Input Dealer and Player Cards";
        elements.splitBtn.classList.add('hidden');
        return;
    }

    const tc = calculateTrueCount();
    const dealerVal = getCardValue(dealerUpcard);
    const handInfo = analyzeHand(playerActiveCards);
    let move = "HIT";
    let isDeviation = false;

    // --- Insurance Advisor ---
    if (dealerVal === 11 && tc >= 3) {
        elements.adviceOutput.textContent = "INSURANCE";
        elements.adviceOutput.className = "advice-value insurance pulse";
        elements.adviceDetails.textContent = `★ TC is ${tc.toFixed(1)} - Take Insurance! ★`;
        return;
    }

    if (!state.splitActive && playerActiveCards.length === 2 && playerActiveCards[0] === playerActiveCards[1]) {
        elements.splitBtn.classList.remove('hidden');
    } else {
        elements.splitBtn.classList.add('hidden');
    }

    const dIdx = dealerVal === 11 ? 9 : dealerVal - 2;
    if (handInfo.sum > 21) {
        elements.adviceOutput.textContent = "BUST";
        elements.adviceOutput.className = "advice-value stand";
        elements.adviceDetails.textContent = `Total: ${handInfo.sum}`;
        return;
    }

    // --- Fab 4 Surrender ---
    if (playerActiveCards.length === 2) {
        if (handInfo.sum === 15 && dealerVal === 10 && tc >= 0) move = 'SUR';
        else if (handInfo.sum === 15 && dealerVal === 9 && tc >= 2) move = 'SUR';
        else if (handInfo.sum === 15 && dealerVal === 11 && tc >= 1) move = 'SUR';
        else if (handInfo.sum === 14 && dealerVal === 10 && tc >= 3) move = 'SUR';
        
        if (move === 'SUR') {
            elements.adviceOutput.textContent = "SURRENDER";
            elements.adviceOutput.className = "advice-value surrender pulse";
            elements.adviceDetails.textContent = `★ Deviation: Surrender vs D-${dealerVal}`;
            return;
        }
    }

    if (handInfo.isPair && playerActiveCards.length === 2) {
        move = STRATEGY.pairs[handInfo.sum][dIdx];
        // Illustrious 18: 10,10 Split
        if (handInfo.sum === 20) {
            if (dealerVal === 5 && tc >= 5) { move = 'P'; isDeviation = true; }
            else if (dealerVal === 6 && tc >= 4) { move = 'P'; isDeviation = true; }
            else move = 'S';
        }
    }
    else if (handInfo.isSoft) {
        const softSum = handInfo.sum;
        if (softSum >= 19) move = 'S';
        else if (softSum <= 12) move = 'H';
        else move = STRATEGY.soft[softSum][dIdx];
        if (move === 'D' && playerActiveCards.length > 2) move = (softSum === 18 && [2,7,8].includes(dealerVal)) ? 'S' : 'H';
    } else {
        const hardSum = Math.min(17, Math.max(5, handInfo.sum));
        if (handInfo.sum >= 17) move = 'S';
        else if (handInfo.sum <= 8) move = 'H';
        else move = STRATEGY.hard[hardSum][dIdx];
        if (move === 'D' && playerActiveCards.length > 2) move = 'H';
    }

    // --- Illustrious 18 Deviations ---
    if (!handInfo.isSoft && !handInfo.isPair) {
        // Stand Deviations
        if (handInfo.sum === 16 && dealerVal === 10 && tc >= 0 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 16 && dealerVal === 9 && tc >= 5 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 15 && dealerVal === 10 && tc >= 4 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 13 && dealerVal === 2 && tc >= -1 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 13 && dealerVal === 3 && tc >= -2 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 12 && dealerVal === 2 && tc >= 3 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 12 && dealerVal === 3 && tc >= 2 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 12 && dealerVal === 4 && tc >= 0 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 12 && dealerVal === 5 && tc >= -2 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 12 && dealerVal === 6 && tc >= -1 && move === 'H') { move = 'S'; isDeviation = true; }
        
        // --- Composition-Dependent Exceptions ---
        // 12 (10+2) vs 4 -> Standard move is S, but with exactly 10+2, the removal of the 10 makes it slightly better to hit at very low counts.
        // For simplicity, we flag common CD errors:
        const hasTen = playerActiveCards.some(c => ['10', 'J', 'Q', 'K'].includes(c));
        if (handInfo.sum === 12 && dealerVal === 4 && hasTen && tc < 0) { move = 'H'; isDeviation = true; }

        // Double Deviations
        if (handInfo.sum === 11 && dealerVal === 11 && tc >= 1 && move === 'H') { move = 'D'; isDeviation = true; }
        if (handInfo.sum === 10 && dealerVal === 10 && tc >= 4 && move === 'H') { move = 'D'; isDeviation = true; }
        if (handInfo.sum === 10 && dealerVal === 11 && tc >= 4 && move === 'H') { move = 'D'; isDeviation = true; }
        if (handInfo.sum === 9 && dealerVal === 2 && tc >= 1 && move === 'H') { move = 'D'; isDeviation = true; }
        if (handInfo.sum === 9 && dealerVal === 7 && tc >= 3 && move === 'H') { move = 'D'; isDeviation = true; }

        // --- Master Strategist Expansion: Soft Hand & Advanced Deviations ---
        if (handInfo.isSoft) {
            if (handInfo.sum === 13 && dealerVal === 5 && tc >= 1 && move === 'H') { move = 'D'; isDeviation = true; }
            if (handInfo.sum === 13 && dealerVal === 6 && tc >= -1 && move === 'H') { move = 'D'; isDeviation = true; }
            if (handInfo.sum === 18 && dealerVal === 2 && tc >= 1 && move === 'S') { move = 'D'; isDeviation = true; }
            if (handInfo.sum === 19 && dealerVal === 6 && tc >= 1 && move === 'S') { move = 'D'; isDeviation = true; }
        }
    }

    // --- Side Bet Advisor & Wonging ---
    let sideBetAdvice = "";
    if (tc >= 4) sideBetAdvice = " [21+3 POSITIVE]";
    if (tc <= -4) sideBetAdvice = " [POOR SHOE]";
    if (tc <= -2.0 && (state.totalCardsDealt / (state.deckCount * 52)) < 0.7) {
        sideBetAdvice = " [LOW ADVANTAGE - EXIT?]";
    }

    const moveMap = { 'H': 'HIT', 'S': 'STAND', 'D': 'DOUBLE', 'P': 'SPLIT', 'SUR': 'SURRENDER' };
    const classMap = { 'H': 'hit', 'S': 'stand', 'D': 'double', 'P': 'split', 'SUR': 'surrender' };
    
    elements.adviceOutput.textContent = moveMap[move];
    elements.adviceOutput.className = `advice-value ${classMap[move]}`;
    elements.adviceDetails.textContent = `${isDeviation ? '★ DEVIATION ★ ' : ''}Hand ${state.activeHandIndex + 1}: ${handInfo.isSoft ? 'Soft' : handInfo.isPair ? 'Pair' : 'Hard'} ${handInfo.sum}${sideBetAdvice}`;
}

function analyzeHand(cards) {
    let sum = 0, aces = 0;
    const vals = cards.map(getCardValue);
    vals.forEach(v => { sum += v; if (v === 11) aces++; });
    while (sum > 21 && aces > 0) { sum -= 10; aces--; }
    const isPair = cards.length === 2 && cards[0] === cards[1];
    const isSoft = aces > 0;
    return { sum, isSoft, isPair };
}

function getCardValue(c) {
    if (['J', 'Q', 'K', '10'].includes(c)) return 10;
    if (c === 'A') return 11;
    return parseInt(c);
}

function refreshSlots() {
    document.querySelectorAll('.slot').forEach(slot => {
        const type = slot.dataset.type, index = parseInt(slot.dataset.index);
        let val;
        if (type === 'dealer') {
            val = state.dealerHand[index];
        } else {
            const handIdx = parseInt(slot.dataset.hand);
            val = state.playerHands[handIdx][index];
        }

        if (val) {
            slot.innerHTML = `<div class="v-card"><span>${val}</span></div>`;
            slot.classList.remove('empty');
            if (type === 'dealer' && index === 0) slot.classList.add('dealer-upcard');
        } else {
            slot.innerHTML = "+"; slot.classList.add('empty'); slot.classList.remove('dealer-upcard');
        }
    });

    const dealerActive = state.dealerHand.filter(Boolean);
    if (dealerActive.length > 0) {
        const dInfo = analyzeHand(dealerActive);
        elements.dealerTotal.textContent = dInfo.sum;
        elements.dealerTotal.style.display = 'block';
    } else {
        elements.dealerTotal.style.display = 'none';
    }

    state.playerHands.forEach((hand, idx) => {
        const activeCards = hand.filter(Boolean);
        const totalElem = elements[`playerTotal${idx}`];
        if (activeCards.length > 0) {
            const pInfo = analyzeHand(activeCards);
            totalElem.textContent = `${pInfo.sum}${pInfo.isSoft ? ' (Soft)' : ''}`;
            totalElem.classList.toggle('bust', pInfo.sum > 21);
            totalElem.style.display = 'block';
        } else {
            totalElem.style.display = 'none';
        }
    });
}

function refreshTableFeed() {
    elements.tableHistoryFeed.innerHTML = '';
    state.tableHistory.slice(-14).forEach(val => {
        const div = document.createElement('div'); div.className = 'mini-card'; div.textContent = val;
        elements.tableHistoryFeed.appendChild(div);
    });
}

function refreshUI() { 
    refreshSlots(); 
    refreshTableFeed(); 
    updateHUD(); 
    updateStatsUI(); 
    updateAdvice();
    updateRNGIndicator(); // Sync RNG confidence display
    saveToStorage();
}


function clearTable() {
    state.playerHands = [[], []]; state.dealerHand = [];
    state.activeSlot = { type: 'player', index: 0, hand: 0 };
    state.activeHandIndex = 0;
    state.splitActive = false;
    elements.hand2.classList.add('hidden');
    setTableMode(false); refreshUI();
}

function resetShoe() {
    state.runningCount = 0; state.totalCardsDealt = 0;
    state.aceCount = 0;
    // Reset RNG tracking on shoe reset (manual shuffle signal)
    state.rngRoundsTracked = 0;
    state.history = []; state.tableHistory = [];
    clearTable();
    updateRNGIndicator();
}

// =========================================================
// RNG MODE FUNCTIONS
// =========================================================

/**
 * Toggle RNG mode on or off.
 * When ON: shows warning banner, resets confidence tracking.
 * When OFF: hides all RNG UI, restores normal mode.
 */
function setRNGMode(active) {
    state.rngMode = active;

    // Update toggle button states
    elements.rngModeOff.classList.toggle('active', !active);
    elements.rngModeOn.classList.toggle('active', active);
    elements.rngModeOn.classList.toggle('rng-active', active);

    // Show/hide RNG UI elements
    elements.rngWarningBanner.classList.toggle('hidden', !active);
    elements.rngSidebarIndicator.classList.toggle('hidden', !active);

    if (active) {
        // Reset confidence when entering RNG mode for a new session
        // (keep rngRoundsTracked if already set — user may toggle back and forth)
        updateRNGIndicator();
    } else {
        // Restore clean edge display
        if (elements.edgeVal) elements.edgeVal.classList.remove('edge-unreliable');
    }

    refreshUI();
}

/**
 * Calculate the shoe confidence score (0–85%).
 *
 * Algorithm:
 *  - Each completed round without a manual shoe reset → +7% (max 56%)
 *  - Penetration > 30% → +10% bonus (shoe appears persistent)
 *  - Penetration > 50% → +20% bonus (very likely persistent shoe)
 *  - Hard cap at 85% — we can never be 100% certain on an RNG table.
 */
function calculateRNGConfidence() {
    if (!state.rngMode) return 100;

    const roundsBonus = Math.min(56, state.rngRoundsTracked * 7);

    const penetration = (state.totalCardsDealt / (state.deckCount * 52)) * 100;
    const penetrationBonus = penetration > 50 ? 20 : penetration > 30 ? 10 : 0;

    return Math.min(85, roundsBonus + penetrationBonus);
}

/**
 * Sync all RNG Mode UI elements to the current confidence level.
 * Called after each betting advice update and on shoe reset.
 */
function updateRNGIndicator() {
    if (!state.rngMode) return;

    const confidence = calculateRNGConfidence();
    const pct = `${confidence.toFixed(0)}%`;

    // Update confidence bars
    if (elements.rngConfidenceBar) elements.rngConfidenceBar.style.width = pct;
    if (elements.rngConfidencePct) elements.rngConfidencePct.textContent = pct;
    if (elements.rngSidebarBar) elements.rngSidebarBar.style.width = pct;
    if (elements.rngSidebarVal) elements.rngSidebarVal.textContent = pct;
    if (elements.rngRoundsVal) elements.rngRoundsVal.textContent = state.rngRoundsTracked;

    // Update status badge & note text
    const badge = elements.rngStatusBadge;
    const note = elements.rngNoteText;

    if (confidence < 30) {
        if (badge) { badge.textContent = 'UNCERTAIN'; badge.className = 'rng-status-badge uncertain'; }
        if (note) note.textContent = 'Shoe nicht verifiziert — Bet-Sizing basiert auf Base-Wahrscheinlichkeiten. Count wird beobachtet.';
    } else if (confidence < 65) {
        if (badge) { badge.textContent = 'BUILDING'; badge.className = 'rng-status-badge building'; }
        if (note) note.textContent = `${state.rngRoundsTracked} Runden ohne Shuffle erkannt — Count wird partiell berücksichtigt. Bet-Sizing konservativ.`;
    } else {
        if (badge) { badge.textContent = 'STABLE'; badge.className = 'rng-status-badge stable'; }
        if (note) note.textContent = `Shoe erscheint persistent (${state.rngRoundsTracked} Runden). Count wird mit ${confidence.toFixed(0)}% Gewichtung verwendet.`;
    }
}

function resetStats() {
    state.stats = { win: 0, loss: 0, push: 0 };
    updateStatsUI();
    saveToStorage();
}


init();

function exportSessionCSV() {
    if (state.history.length === 0) return alert("No data to export yet.");
    
    let csv = "Timestamp,Result,True Count,Running Count,Bet Size\n";
    state.history.forEach(row => {
        csv += `${row.timestamp},${row.type},${row.tc},${row.rc},€${row.bet}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackjack_session_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
}
