import { create } from 'zustand';
import { Card, Action, Rank } from '../engine/types';
import { CardCountingEngine } from '../engine/CardCountingEngine';
import { BetManager } from '../engine/BetManager';
import { StrategyEngine } from '../engine/StrategyEngine';

// Khởi tạo engine đếm bài ngoại vi
const counter = new CardCountingEngine(8);

interface GameState {
    bankroll: number;

    runningCount: number;
    trueCount: number;
    remainingCards: number;

    playerHand: Card[];
    dealerHand: Card[];
    otherCards: Card[];

    suggestedAction: Action | null;
    suggestedBet: number;
    inputTarget: 'PLAYER' | 'DEALER' | 'DISCARD';

    // Mới: Insurance & Bonus
    insuranceRecommendation: boolean | null; // null = không áp dụng, true = mua, false = bỏ qua
    bonusWarning: string | null;

    setBankroll: (v: number) => void;
    setInputTarget: (target: 'PLAYER' | 'DEALER' | 'DISCARD') => void;

    addPlayerCard: (rank: Rank) => void;
    addDealerCard: (rank: Rank) => void;
    addDeadCard: (rank: Rank) => void;

    undoLastCard: () => void;
    clearTable: () => void;
    resetShoe: () => void;
    recalculate: () => void;
    splitHand: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    bankroll: 1000000,

    runningCount: counter.getRunningCount(),
    trueCount: counter.getTrueCount(),
    remainingCards: counter.getRemainingCards(),

    playerHand: [],
    dealerHand: [],
    otherCards: [],

    suggestedAction: null,
    suggestedBet: 20000,
    inputTarget: 'PLAYER',
    insuranceRecommendation: null,
    bonusWarning: null,

    setBankroll: (bankroll) => {
        set({ bankroll });
        get().recalculate();
    },

    setInputTarget: (inputTarget) => set({ inputTarget }),

    addPlayerCard: (rank: Rank) => {
        counter.recordCard(rank);
        const val = rank === 'A' ? 1
            : ['J', 'Q', 'K'].includes(rank) ? 10
                : parseInt(rank, 10);

        const newCard: Card = {
            id: crypto.randomUUID(),
            rank,
            suit: 'spades',
            value: val
        };

        set((state) => ({ playerHand: [...state.playerHand, newCard] }));
        get().recalculate();
    },

    addDealerCard: (rank: Rank) => {
        counter.recordCard(rank);
        const val = rank === 'A' ? 1
            : ['J', 'Q', 'K'].includes(rank) ? 10
                : parseInt(rank, 10);

        const newCard: Card = {
            id: crypto.randomUUID(),
            rank,
            suit: 'hearts',
            value: val
        };

        set((state) => ({ dealerHand: [...state.dealerHand, newCard] }));
        get().recalculate();
    },

    addDeadCard: (rank: Rank) => {
        counter.recordCard(rank);
        const val = rank === 'A' ? 1
            : ['J', 'Q', 'K'].includes(rank) ? 10
                : parseInt(rank, 10);

        const newCard: Card = {
            id: crypto.randomUUID(),
            rank,
            suit: 'clubs',
            value: val
        };

        set((state) => ({ otherCards: [...state.otherCards, newCard] }));
        get().recalculate();
    },

    undoLastCard: () => {
        const state = get();
        const { inputTarget } = state;

        if (inputTarget === 'PLAYER' && state.playerHand.length > 0) {
            const lastCard = state.playerHand[state.playerHand.length - 1];
            counter.unrecordCard(lastCard.rank);
            set({ playerHand: state.playerHand.slice(0, -1) });
        } else if (inputTarget === 'DEALER' && state.dealerHand.length > 0) {
            const lastCard = state.dealerHand[state.dealerHand.length - 1];
            counter.unrecordCard(lastCard.rank);
            set({ dealerHand: state.dealerHand.slice(0, -1) });
        } else if (inputTarget === 'DISCARD' && state.otherCards.length > 0) {
            const lastCard = state.otherCards[state.otherCards.length - 1];
            counter.unrecordCard(lastCard.rank);
            set({ otherCards: state.otherCards.slice(0, -1) });
        }

        get().recalculate();
    },

    clearTable: () => {
        set({ playerHand: [], dealerHand: [], otherCards: [], suggestedAction: null, insuranceRecommendation: null, bonusWarning: null });
        get().recalculate();
    },

    splitHand: () => {
        const state = get();
        if (state.playerHand.length === 2 && state.playerHand[0].value === state.playerHand[1].value) {
            const splitCard = state.playerHand[1];
            set({
                playerHand: [state.playerHand[0]],
                otherCards: [...state.otherCards, splitCard]
            });
            get().recalculate();
        }
    },

    resetShoe: () => {
        counter.reset();
        set({ playerHand: [], dealerHand: [], otherCards: [], suggestedAction: null, insuranceRecommendation: null, bonusWarning: null });
        get().recalculate();
    },

    recalculate: () => {
        const state = get();
        const currentTrueCount = counter.getTrueCount();

        const suggestedBet = BetManager.getSuggestedBet(state.bankroll, 20000, 5000000, currentTrueCount);

        let suggestedAction: Action | null = null;
        let insuranceRecommendation: boolean | null = null;
        let bonusWarning: string | null = null;

        if (state.playerHand.length >= 2 && state.dealerHand.length > 0) {
            suggestedAction = StrategyEngine.getOptimalAction(state.playerHand, state.dealerHand[0], currentTrueCount);
            insuranceRecommendation = StrategyEngine.shouldInsure(state.dealerHand[0], currentTrueCount);
            bonusWarning = StrategyEngine.getBonusWarning(state.playerHand, state.dealerHand[0]);
        }

        set({
            runningCount: counter.getRunningCount(),
            trueCount: currentTrueCount,
            remainingCards: counter.getRemainingCards(),
            suggestedBet,
            suggestedAction,
            insuranceRecommendation,
            bonusWarning
        });
    }
}));
