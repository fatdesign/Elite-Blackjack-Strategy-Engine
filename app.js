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
    activeSlot: { type: 'dealer', index: 0, hand: 0 },
    tableMode: false,
    history: [],
    stats: { win: 0, loss: 0, push: 0 },
    splitActive: false
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
    hand2: document.getElementById('hand-2')
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
    elements.runningCount.textContent = state.runningCount;
    elements.trueCount.textContent = tc.toFixed(2);
    elements.decksRemaining.textContent = (state.deckCount - (state.totalCardsDealt / 52)).toFixed(1);
    elements.trueCount.style.color = tc >= 2 ? 'var(--accent-success)' : tc <= -2 ? 'var(--accent-danger)' : 'var(--accent-gold)';
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

    if (handInfo.isPair && playerActiveCards.length === 2) move = STRATEGY.pairs[handInfo.sum][dIdx];
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

    if (!handInfo.isSoft && !handInfo.isPair) {
        if (handInfo.sum === 16 && dealerVal === 10 && tc >= 0 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 15 && dealerVal === 10 && tc >= 4 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 12 && dealerVal === 3 && tc >= 2 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 12 && dealerVal === 2 && tc >= 3 && move === 'H') { move = 'S'; isDeviation = true; }
        if (handInfo.sum === 10 && dealerVal === 10 && tc >= 4 && move === 'H') { move = 'D'; isDeviation = true; }
    }

    const moveMap = { 'H': 'HIT', 'S': 'STAND', 'D': 'DOUBLE', 'P': 'SPLIT', 'INSURANCE?': 'INSURE' };
    const classMap = { 'H': 'hit', 'S': 'stand', 'D': 'double', 'P': 'split', 'INSURANCE?': 'double' };
    
    elements.adviceOutput.textContent = moveMap[move];
    elements.adviceOutput.className = `advice-value ${classMap[move]}`;
    elements.adviceDetails.textContent = `${isDeviation ? '★ DEVIATION ★ ' : ''}Hand ${state.activeHandIndex + 1}: ${handInfo.isSoft ? 'Soft' : handInfo.isPair ? 'Pair' : 'Hard'} ${handInfo.sum}`;
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
    refreshHandHighlight();
    updateAdvice();
    saveToStorage(); // New
}

function clearTable() {
    state.playerHands = [[], []]; state.dealerHand = [];
    state.activeSlot = { type: 'dealer', index: 0, hand: 0 };
    state.activeHandIndex = 0;
    state.splitActive = false;
    elements.hand2.classList.add('hidden');
    setTableMode(false); refreshUI();
}

function resetShoe() {
    state.runningCount = 0; state.totalCardsDealt = 0;
    state.history = []; state.tableHistory = [];
    clearTable();
}

function resetStats() {
    state.stats = { win: 0, loss: 0, push: 0 };
    updateStatsUI();
    saveToStorage();
}

init();
