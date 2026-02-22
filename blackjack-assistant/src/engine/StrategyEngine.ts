import { Card, Action } from './types';

export function getHandTotal(hand: Card[]): { total: number, isSoft: boolean } {
    let total = 0;
    let aceCount = 0;

    for (const card of hand) {
        if (card.rank === 'A') {
            aceCount++;
            total += 1;
        } else {
            total += card.value;
        }
    }

    // Chỉ 1 Ace có thể tính 11 (nếu tính 2 Ace = 11 thì vượt 21)
    if (aceCount > 0 && total + 10 <= 21) {
        return { total: total + 10, isSoft: true };
    }

    return { total, isSoft: false };
}

export class StrategyEngine {
    /**
     * Calculate optimal action based on Player hand, Dealer upcard, and True Count.
     * 
     * Strategy table: Spanish 21 H17 (Dealer Hits Soft 17)
     * Reference: Wizard of Odds Spanish 21 Basic Strategy
     * 
     * Special rules for "Infinite Fun 21 Blackjack":
     * - No 10-cards (8 decks x 48 cards)
     * - Double on ANY number of cards
     * - Player 21 always wins (including push at 21)
     * - Player BJ beats Dealer BJ
     * - Dealer Hits Soft 17
     * - Split only once per hand
     * - Split Aces receive only 1 card
     * - Bonus 21: 5-card(2:1), 6-card(3:1), 7-card(4:1), 6-7-8, 7-7-7
     * - Super Bonus: 7-7-7 vs Dealer 7 = 50:1
     * - NO Surrender (game has Cash Out instead, handled separately)
     */
    static getOptimalAction(playerHand: Card[], dealerUpcard: Card, trueCount: number): Action {
        const { total, isSoft } = getHandTotal(playerHand);
        const dealerValue = dealerUpcard.rank === 'A' ? 11 : dealerUpcard.value;
        const numCards = playerHand.length;

        const isPair = numCards === 2 && playerHand[0].rank === playerHand[1].rank;
        // Game allows Double on any number of cards (bj.md §4.3)
        const canDouble = true;
        // Cannot double on soft 21
        const isSoft21 = isSoft && total === 21;

        // === SPECIAL OVERRIDES === //

        // 1. Already 21 or Bust → Stand
        if (total >= 21) return 'STAND';

        // 2. SUPER BONUS Override: 7-7 vs Dealer 7 → Must HIT for 7-7-7 (50:1)
        //    NEVER Split or Double (cancels Super Bonus)
        if (numCards === 2 && playerHand[0].rank === '7' && playerHand[1].rank === '7' && dealerUpcard.rank === '7') {
            return 'HIT';
        }

        // 3. Multi-card Hard 17 vs Ace: HIT (Wizard of Odds confirmed, +2.8% EV)
        //    Because player 21 always wins + multi-card 21 bonus
        if (total === 17 && !isSoft && numCards >= 3 && dealerValue === 11) {
            return 'HIT';
        }

        // 4. True Count Deviations
        //    - Hard 16 vs 10: Stand when TC >= 3 (instead of Hit)
        if (total === 16 && !isSoft && dealerValue === 10 && trueCount >= 3) {
            return 'STAND';
        }

        // 5. Insurance recommendation (TC >= 3 when dealer A)
        //    Handled at UI layer, does not affect action

        // === PAIR SPLITS === //
        // Standard Spanish 21 H17 table
        if (isPair) {
            const rank = playerHand[0].rank;

            switch (rank) {
                case 'A':
                    return 'SPLIT'; // Always Split

                case '8':
                    return 'SPLIT'; // Always Split

                case '9':
                    // Split except D=7, D=10, D=A (Stand when 18 is strong enough)
                    if (dealerValue === 7 || dealerValue === 10 || dealerValue === 11) return 'STAND';
                    return 'SPLIT';

                case '7':
                    if (dealerValue >= 2 && dealerValue <= 7) return 'SPLIT'; // Split D=2-7
                    // Else fall through to hard total logic (14)
                    break;

                case '6':
                    if (dealerValue >= 2 && dealerValue <= 7) return 'SPLIT'; // Split D=2-7
                    break; // Else fall through to hard total logic (12)

                case '5':
                    break; // NEVER split 5s — treat as Hard 10

                case '4':
                    if (!isSoft21 && canDouble && dealerValue >= 5 && dealerValue <= 6) return 'DOUBLE'; // Double D=5-6
                    return 'HIT';

                case '3':
                    if (dealerValue >= 2 && dealerValue <= 7) return 'SPLIT'; // Split D=2-7
                    return 'HIT';

                case '2':
                    if (dealerValue >= 2 && dealerValue <= 7) return 'SPLIT'; // Split D=2-7
                    return 'HIT';

                case 'J': case 'Q': case 'K': // J, Q, K (value 10): NEVER split
                    return 'STAND'; // Hard 20, always stand
            }
        }

        // === SOFT HANDS (Ace counted as 11) === //
        if (isSoft) {
            if (total === 20) return 'STAND'; // Soft 20 (A-9): Always Stand

            if (total === 19) { // Soft 19 (A-8): Double D=6, else Stand
                if (!isSoft21 && canDouble && dealerValue === 6) return 'DOUBLE';
                return 'STAND';
            }

            if (total === 18) { // Soft 18 (A-7): Double D=3-6, Hit D=9/A, Stand else
                if (!isSoft21 && canDouble && dealerValue >= 3 && dealerValue <= 6) return 'DOUBLE';
                if (dealerValue >= 9 || dealerValue === 11) return 'HIT';
                return 'STAND';
            }

            if (total === 17) { // Soft 17 (A-6): Double D=3-6, else Hit
                if (!isSoft21 && canDouble && dealerValue >= 3 && dealerValue <= 6) return 'DOUBLE';
                return 'HIT';
            }

            if (total === 16) { // Soft 16 (A-5): Double D=4-6, else Hit
                if (!isSoft21 && canDouble && dealerValue >= 4 && dealerValue <= 6) return 'DOUBLE';
                return 'HIT';
            }

            if (total === 15) { // Soft 15 (A-4): Double D=4-6, else Hit
                if (!isSoft21 && canDouble && dealerValue >= 4 && dealerValue <= 6) return 'DOUBLE';
                return 'HIT';
            }

            if (total === 14) { // Soft 14 (A-3): Double D=4-6, else Hit
                if (!isSoft21 && canDouble && dealerValue >= 4 && dealerValue <= 6) return 'DOUBLE';
                return 'HIT';
            }

            if (total === 13) { // Soft 13 (A-2): Double D=4-6, else Hit
                if (!isSoft21 && canDouble && dealerValue >= 4 && dealerValue <= 6) return 'DOUBLE';
                return 'HIT';
            }

            return 'HIT'; // Soft 12 (A-A handled by pair logic)
        }

        // === HARD HANDS === //

        // Hard 17+: Stand (except multi-card 17 vs A handled above)
        if (total >= 17) return 'STAND';

        // Hard 16: Stand D=4-6, else Hit (no Surrender in this game)
        if (total === 16) {
            if (dealerValue >= 4 && dealerValue <= 6) return 'STAND';
            return 'HIT';
        }

        // Hard 15: Stand D=4-6, else Hit
        if (total === 15) {
            if (dealerValue >= 4 && dealerValue <= 6) return 'STAND';
            return 'HIT';
        }

        // Hard 14: Stand D=4-6, else Hit
        if (total === 14) {
            if (dealerValue >= 4 && dealerValue <= 6) return 'STAND';
            return 'HIT';
        }

        // Hard 13: Stand D=4-6, else Hit
        if (total === 13) {
            if (dealerValue >= 4 && dealerValue <= 6) return 'STAND';
            return 'HIT';
        }

        // Hard 12: Stand D=4-6, else Hit
        if (total === 12) {
            if (dealerValue >= 4 && dealerValue <= 6) return 'STAND';
            return 'HIT';
        }

        // Hard 11: Double ALL dealers (including Ace)
        if (total === 11) {
            if (canDouble) return 'DOUBLE';
            return 'HIT';
        }

        // Hard 10: Double D=2-8, else Hit
        if (total === 10) {
            if (canDouble && dealerValue >= 2 && dealerValue <= 8) return 'DOUBLE';
            return 'HIT';
        }

        // Hard 9: Double D=3-6, else Hit
        if (total === 9) {
            if (canDouble && dealerValue >= 3 && dealerValue <= 6) return 'DOUBLE';
            return 'HIT';
        }

        // Hard 8 or less: Always Hit
        return 'HIT';
    }

    /**
     * Insurance Recommendation.
     * When dealer shows Ace, player can buy Insurance.
     * Only recommended when TC >= 3 (higher probability of dealer BJ).
     */
    static shouldInsure(dealerUpcard: Card, trueCount: number): boolean | null {
        if (dealerUpcard.rank !== 'A') return null; // null = not applicable
        return trueCount >= 3;
    }

    /**
     * Bonus 21 Detection.
     * Bonus 21 is CANCELLED if player chooses Double.
     * Detects when player has an opportunity to create a bonus hand.
     */
    static getBonusWarning(playerHand: Card[], dealerUpcard: Card): string | null {
        const numCards = playerHand.length;
        const { total } = getHandTotal(playerHand);
        const ranks = playerHand.map(c => c.rank);

        // 1. Super Bonus: 7-7 vs Dealer 7 → must HIT for 7-7-7 (50:1)
        if (numCards === 2 && ranks[0] === '7' && ranks[1] === '7' && dealerUpcard.rank === '7') {
            return '🔥 SUPER BONUS 50:1! Must HIT for 7-7-7. NEVER Split/Double!';
        }

        // 2. Has 7-7, can create 7-7-7 bonus (3:1 to 5:1)
        if (numCards === 2 && ranks[0] === '7' && ranks[1] === '7') {
            return '⚡ Can make 7-7-7 bonus (3:1~5:1). HIT, do NOT Split/Double!';
        }

        // 3. Can create 6-7-8 (if holding 2 of 3)
        const has6 = ranks.includes('6');
        const has7 = ranks.includes('7');
        const has8 = ranks.includes('8');
        if (numCards === 2 && ((has6 && has7) || (has6 && has8) || (has7 && has8))) {
            const missing = !has6 ? '6' : !has7 ? '7' : '8';
            return `💎 Can make 6-7-8 bonus (2:1~4:1). Need a ${missing}. Consider HIT!`;
        }

        // 4. Multi-card 21 bonus (5-card 2:1, 6-card 3:1, 7-card 4:1)
        if (numCards >= 4 && total >= 16 && total <= 20) {
            const nextBonus = numCards === 4 ? '5-card 21 (2:1)' : numCards === 5 ? '6-card 21 (3:1)' : '7-card 21 (4:1)';
            return `🎯 Close to ${nextBonus}! Double CANCELS bonus. Consider HIT instead.`;
        }

        return null;
    }
}
