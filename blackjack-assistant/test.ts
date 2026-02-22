import { CardCountingEngine } from './src/engine/CardCountingEngine';
import { Rank } from './src/engine/types';

function runTest() {
    const engine = new CardCountingEngine(8);

    const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K'];

    // Simulate pushing every card 32 times (8 decks * 4 suits)
    let count = 0;
    for (let rank of RANKS) {
        for (let i = 0; i < 32; i++) {
            engine.recordCard(rank);
            count++;
        }
    }

    console.log(`Total process: ${count} / ${8 * 48} cards.`);
    console.log('Final Running Count:', engine.getRunningCount());
    console.log('Final True Count:', engine.getTrueCount());

    if (engine.getRunningCount() === 0) {
        console.log('✅ TEST PASSED: Engine correctly balances at 0.');
    } else {
        console.log('❌ TEST FAILED: Engine is not balanced.');
    }
}

runTest();
