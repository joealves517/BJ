import { Rank } from './types';

// Katarina Walker's system (modified for our simplified counting)
// +1: 3, 4, 5, 6 (16 cards)
// 0: 2, 7, 8, 9 (16 cards)
// -1: J, Q, K, A (16 cards)
const TAG_VALUES: Record<Rank, number> = {
    'A': -1,
    '2': 0,
    '3': 1,
    '4': 1,
    '5': 1,
    '6': 1,
    '7': 0,
    '8': 0,
    '9': 0,
    'J': -1,
    'Q': -1,
    'K': -1
};

export class CardCountingEngine {
    private runningCount: number = 0;
    private totalDecks: number;
    private remainingCards: number;

    constructor(decks: number = 8) {
        this.totalDecks = decks;
        // Mỗi bộ bài có 48 lá (vì không có 10)
        this.remainingCards = decks * 48;
    }

    // Ghi nhận một lá bài và cập nhật đếm
    recordCard(rank: Rank) {
        if (this.remainingCards > 0) {
            this.runningCount += TAG_VALUES[rank];
            this.remainingCards -= 1;
        }
    }

    // Hoàn tác đếm bài (khi user nhập sai)
    unrecordCard(rank: Rank) {
        this.runningCount -= TAG_VALUES[rank];
        this.remainingCards += 1;
    }

    // Khôi phục bộ bài (xào bài)
    reset() {
        this.runningCount = 0;
        this.remainingCards = this.totalDecks * 48;
    }

    getRunningCount(): number {
        return this.runningCount;
    }

    getRemainingCards(): number {
        return this.remainingCards;
    }

    getTrueCount(): number {
        // True count = Running count / số bộ bài còn lại
        const remainingDecks = this.remainingCards / 48;
        if (remainingDecks <= 0) return 0;

        // Thường lấy 1 chữ số thập phân, nhưng để tính toán thì trả raw.
        return this.runningCount / remainingDecks;
    }
}
