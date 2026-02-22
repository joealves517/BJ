import { useGameStore } from '../store/GameStore';
import type { Rank } from '../engine/types';

export const ActionKeyboard = () => {
    const { addPlayerCard, addDealerCard, addDeadCard, inputTarget } = useGameStore();

    const click = (rank: Rank) => {
        if (inputTarget === 'PLAYER') addPlayerCard(rank);
        else if (inputTarget === 'DEALER') addDealerCard(rank);
        else addDeadCard(rank);
    };

    const cls = "bg-zinc-900 text-zinc-100 font-black text-lg py-3 rounded-xl hover:bg-zinc-800 active:scale-90 active:bg-zinc-700 transition-all border border-zinc-800/60 focus:outline-none select-none";

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-zinc-800/50 px-3 pt-2 z-50" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
            <div className="max-w-xl mx-auto grid grid-cols-5 gap-2">
                <button type="button" onClick={() => click('A')} className={cls}>A</button>
                <button type="button" onClick={() => click('2')} className={cls}>2</button>
                <button type="button" onClick={() => click('3')} className={cls}>3</button>
                <button type="button" onClick={() => click('4')} className={cls}>4</button>
                <button type="button" onClick={() => click('5')} className={cls}>5</button>
                <button type="button" onClick={() => click('6')} className={cls}>6</button>
                <button type="button" onClick={() => click('7')} className={cls}>7</button>
                <button type="button" onClick={() => click('8')} className={cls}>8</button>
                <button type="button" onClick={() => click('9')} className={cls}>9</button>
                <button type="button" onClick={() => click('J')} className={cls}>10</button>
            </div>
        </div>
    );
};
