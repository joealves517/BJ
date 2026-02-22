export class BetManager {
    /**
     * Tính cược tối ưu — Kelly Criterion chuẩn ngành cho Blackjack.
     *
     * === CÔNG THỨC KELLY CHUẨN CHO BLACKJACK ===
     *
     * Full Kelly:  f = edge / variance
     * Quarter Kelly:  f = (edge / variance) / 4
     * Bet = bankroll × f
     *
     * Trong đó:
     * - edge = baseEdge + TC × edgePerTC
     * - variance ≈ 1.33 (Spanish 21, do Double/Split/BJ payout ảnh hưởng)
     *   (Standard BJ variance = 1.32, Spanish 21 cao hơn chút do bonus payouts)
     * - Dùng 1/4 Kelly để giảm Risk of Ruin xuống <1%
     *   (Full Kelly ~13% RoR, Half ~1.8%, Quarter ~<0.5%)
     *
     * === BET SPREAD ===
     *
     * Ngoài Kelly, pro counter dùng bet spread theo True Count:
     * TC ≤ 0: Min bet (1 unit)
     * TC 1: 2× min bet
     * TC 2: 4× min bet  
     * TC 3+: Kelly-calculated amount (nhưng không dưới 6× min)
     * 
     * Kết hợp cả 2: Dùng bet spread cho TC thấp, Kelly cho TC cao.
     * Lý do: Kelly không ổn định khi edge rất nhỏ (TC=1 chỉ +0.2% edge).
     *
     * Nguồn: Wizard of Odds, Stanford Wong "Professional Blackjack",
     *         Blackjack Attack (Don Schlesinger)
     */
    static getSuggestedBet(bankroll: number, minBet: number, maxBet: number, trueCount: number): number {
        // === THAM SỐ ===
        // Base edge cho "Vui Nhộn Vô Hạn 21" ~ -0.3%
        // (Spanish 21 H17 no-redouble = 0.76%, game này thấp hơn nhờ tie-21 win, BJ vs BJ win)
        const baseEdge = -0.003;
        // Edge gain per TC: ~0.5% (chuẩn Spanish 21 8-deck, hệ thống Katrina Walker)
        const edgePerTC = 0.005;
        // Variance cho Spanish 21: ~1.33 (bao gồm Double/Split/BJ/Bonus payouts)
        const variance = 1.33;

        const edge = baseEdge + (trueCount * edgePerTC);

        // === TC ≤ 0: Nhà cái có lợi thế → Min bet ===
        if (edge <= 0) {
            // Bet spread: TC=0 hoặc thấp hơn → 1 unit (min bet)
            return minBet;
        }

        // === TC THẤP (1-2): Bet Spread cố định ===
        // Kelly không ổn định khi edge rất nhỏ nên dùng bet spread
        // Đây là cách pro counter thực tế chơi (Wong, Schlesinger)
        if (trueCount >= 1 && trueCount < 2) {
            // TC 1: edge ≈ +0.2%, bet spread = 2× min
            const spread = Math.min(minBet * 2, maxBet);
            return roundToChipSize(spread, minBet);
        }

        if (trueCount >= 2 && trueCount < 3) {
            // TC 2: edge ≈ +0.7%, bet spread = 4× min
            const spread = Math.min(minBet * 4, maxBet);
            return roundToChipSize(spread, minBet);
        }

        // === TC CAO (3+): Kelly Criterion ===
        // Full Kelly: f = edge / variance
        // Quarter Kelly: f = (edge / variance) / 4
        const fullKelly = edge / variance;
        const quarterKelly = fullKelly / 4;

        // Bet = bankroll × quarter Kelly fraction
        let suggestedAmount = bankroll * quarterKelly;

        // Minimum floor: TC 3+ phải ít nhất 6× min (bet spread consistency)
        const spreadFloor = minBet * 6;
        if (suggestedAmount < spreadFloor) {
            suggestedAmount = spreadFloor;
        }

        // Làm tròn theo chip size nhỏ nhất
        suggestedAmount = roundToChipSize(suggestedAmount, minBet);

        // Clamp vào min/max
        if (suggestedAmount < minBet) suggestedAmount = minBet;
        if (suggestedAmount > maxBet) suggestedAmount = maxBet;

        return suggestedAmount;
    }

    /**
     * Thông tin chi tiết về edge/kelly cho UI hiển thị.
     */
    static getBetDetails(bankroll: number, minBet: number, trueCount: number): {
        edge: number;
        kellyFraction: number;
        spreadMultiplier: number;
    } {
        const baseEdge = -0.003;
        const edgePerTC = 0.005;
        const variance = 1.33;
        const edge = baseEdge + (trueCount * edgePerTC);

        let kellyFraction = 0;
        let spreadMultiplier = 1;

        if (edge > 0) {
            kellyFraction = (edge / variance) / 4; // Quarter Kelly
            if (trueCount >= 1 && trueCount < 2) spreadMultiplier = 2;
            else if (trueCount >= 2 && trueCount < 3) spreadMultiplier = 4;
            else if (trueCount >= 3) spreadMultiplier = Math.max(6, Math.round(bankroll * kellyFraction / minBet));
        }

        return { edge, kellyFraction, spreadMultiplier };
    }
}

/**
 * Làm tròn theo kích thước chip nhỏ nhất (minBet).
 * Ví dụ: minBet=20000 → 73000 → 80000
 */
function roundToChipSize(amount: number, chipSize: number): number {
    return Math.round(amount / chipSize) * chipSize;
}
