export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'J' | 'Q' | 'K'; // Không có 10

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
    id: string; // Unique id for rendering
    rank: Rank;
    suit: Suit;
    value: number; // 2-9 is 2-9, J/Q/K is 10, A is 1 or 11
}

export type Action = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT';
