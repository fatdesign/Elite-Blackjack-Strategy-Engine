# Elite Blackjack: Advanced Strategy & Advantage Play Engine 🃏

Elite Blackjack is a professional-grade decision-support tool for high-stakes card counters and advantage players. It uses the **Hi-Lo system**, **Kelly Criterion betting**, and **Ace Side Counting** to maximize your mathematical edge over the casino.

---

## 🛠️ Getting Started (The Setup)

Before you begin your session, configure the engine in the **Sidebar**:

1.  **Total Bankroll (€):** Input the total amount of funds dedicated to this session (e.g., `2000`).
2.  **Unit Size (€):** Set your base minimum bet (e.g., `10`).
3.  **Betting Aggression:**
    *   **1/2 Kelly (Recommended):** Balanced growth with significantly lower risk of ruin.
    *   **Full Kelly (Aggressive):** Maximum capital growth, but very high volatility.
4.  **Table Rules:** Select the number of decks (e.g., `8 Decks`) and whether the Dealer hits or stands on Soft 17.

---

## 🎮 How to Use (In-Game Workflow)

The engine is designed for a seamless 2-step process during a live round:

### Step 1: Pre-Round Table Tracking 👁️
**Mode: TABLE (Blue Button)**
As soon as the dealer starts dealing to other players and discarding cards:
1.  Toggle the **Input Mode** to **TABLE**.
2.  Click the card values for **every card you see** that is NOT part of your own hand (other players' cards, burns, or discards).
3.  Watch the **Running Count** and **True Count** update in real-time.

### Step 2: Active Round Decision 🎯
**Mode: HAND (Gold Button)**
When it's your turn to act:
1.  Toggle the **Input Mode** to **HAND**.
2.  Click the **Dealer Hand** slot and input their upcard.
3.  Click the **Hand 1** slots and input your two cards.
4.  **The Decision:** Follow the large **OPTIMAL MOVE** advice at the top:
    *   **HIT / STAND / DOUBLE / SPLIT / SURRENDER**
    *   ⭐ **DEVIATION:** If you see this badge, the math dictates an "Illustrious 18" move that breaks from standard strategy because the count is high.
    *   ★ **CD PRECISION:** Composition-dependent advice (e.g., a specific 10+2 vs 4 move).

### Step 3: Post-Round Statistics 📊
1.  Click **WIN**, **PUSH**, or **LOSS** to track your performance.
2.  The engine will clear your hands but **preserve the Count**.
3.  Monitor your **Risk of Ruin (RoR)**. If it stays in the Red (>10%), consider lowering your Unit Size.

---

## 📈 Key Indicators (Pro HUD)

> [!IMPORTANT]
> **Ace Density**: If you see **ACE RICH** (Green), your chance of a 3:2 Blackjack payout is higher. The "Rec. Bet" already factors this in—trust the recommendation!

> [!TIP]
> **Insurance Advisor**: If the dealer shows an Ace and the True Count is ≥ 3.0, a high-visibility **"INSURANCE"** alert will appear. Taking insurance is then mathematically profitable!

*   **Penetration:** Shows how deep you are in the shoe. High penetration (>75%) increases the reliability of the True Count.
*   **Edge:** Your current mathematical advantage. A positive edge (+0.5% or more) means you are the favorite to win long-term.

---

## 🔧 Troubleshooting
*   **Undo:** Use the "Undo" button to fix misclicks. The count and deck exhaustion will revert perfectly.
*   **Reset Shoe:** Only click this after the dealer performs a full shuffle.

---
**Disclaimer:** This tool is for educational and statistical purposes. Always bet responsibly.
