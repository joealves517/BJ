import { useGameStore } from '../store/GameStore';
import { BetManager } from '../engine/BetManager';

export const Dashboard = () => {
    const { bankroll, runningCount, trueCount, remainingCards, suggestedBet, resetShoe, setBankroll } = useGameStore();

    const totalCards = 384;
    const shoeProgress = 100 - (remainingCards / totalCards) * 100;

    const betDetails = BetManager.getBetDetails(bankroll, 20000, trueCount);
    const edgePercent = (betDetails.edge * 100).toFixed(2);
    const isPositiveEdge = betDetails.edge > 0;

    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800/60">
            {/* Top Row: Bankroll + True Count */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800/40">
                    <h2 className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest mb-0.5">Bankroll</h2>
                    <input
                        type="number"
                        className="w-full bg-transparent text-base font-black text-zinc-200 outline-none tabular-nums"
                        value={bankroll}
                        onChange={(e) => setBankroll(Number(e.target.value))}
                    />
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800/40 flex flex-col items-end justify-center">
                    <h2 className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest mb-0.5">True Count</h2>
                    <p className="text-xl font-black text-zinc-200 tabular-nums leading-none">
                        {trueCount > 0 ? '+' : ''}{trueCount.toFixed(1)}
                    </p>
                    <p className="text-[8px] text-zinc-600 mt-0.5 tabular-nums">RC: {runningCount > 0 ? '+' : ''}{runningCount}</p>
                </div>
            </div>

            {/* Suggested Bet */}
            <div className="bg-black p-3 rounded-xl flex flex-col items-center border border-zinc-800/40">
                <p className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest mb-0.5">Suggested Bet</p>
                <p className="text-xl font-black text-zinc-200 tabular-nums">
                    {new Intl.NumberFormat('en-US').format(suggestedBet)}
                </p>
                <div className="flex gap-3 mt-1">
                    <span className={`text-[9px] font-bold tabular-nums ${isPositiveEdge ? 'text-emerald-500' : 'text-red-500'}`}>
                        Edge: {isPositiveEdge ? '+' : ''}{edgePercent}%
                    </span>
                    {betDetails.spreadMultiplier > 1 && (
                        <span className="text-[9px] font-bold text-zinc-500 tabular-nums">
                            {betDetails.spreadMultiplier}× min
                        </span>
                    )}
                    {isPositiveEdge && (
                        <span className="text-[9px] font-bold text-zinc-600 tabular-nums">
                            ¼K: {(betDetails.kellyFraction * 100).toFixed(2)}%
                        </span>
                    )}
                </div>
            </div>

            {/* Shoe Progress */}
            <div className="px-1 mt-0.5">
                <div className="flex justify-between text-[9px] text-zinc-600 mb-1 font-bold uppercase tracking-tight tabular-nums">
                    <span>Shoe</span>
                    <span>{remainingCards} / {totalCards}</span>
                </div>
                <div className="w-full bg-black rounded-full h-1 border border-zinc-800/50 overflow-hidden">
                    <div
                        className="h-full bg-zinc-500 transition-all duration-700 rounded-full"
                        style={{ width: `${shoeProgress}%` }}
                    ></div>
                </div>
                {shoeProgress > 80 && (
                    <p className="text-[9px] text-red-500/80 mt-1 text-center font-bold">⚠ SHUFFLE INCOMING</p>
                )}
            </div>

            {/* Reset Button */}
            <button
                onClick={resetShoe}
                className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/30 border border-zinc-800/50 rounded-xl py-2 transition-all uppercase tracking-widest active:scale-95"
            >
                Shuffle (Reset)
            </button>
        </div>
    );
};
