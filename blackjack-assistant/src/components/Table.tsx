import { useGameStore } from '../store/GameStore';
import { getHandTotal } from '../engine/StrategyEngine';
import { Action } from '../engine/types';
import { Undo2, ShieldCheck, ShieldX } from 'lucide-react';

export const Table = () => {
    const {
        playerHand, dealerHand, otherCards,
        suggestedAction, clearTable, splitHand, undoLastCard,
        inputTarget, setInputTarget,
        insuranceRecommendation, bonusWarning
    } = useGameStore();

    const playerTotal = getHandTotal(playerHand);
    const dealerTotal = getHandTotal(dealerHand);

    const getActionColor = (action: Action | null) => {
        switch (action) {
            case 'HIT': return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
            case 'STAND': return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
            case 'DOUBLE': return 'text-sky-400 border-sky-500/40 bg-sky-950/30';
            case 'SPLIT': return 'text-violet-400 border-violet-500/40 bg-violet-950/30';
            default: return 'text-zinc-600 border-zinc-800 bg-black';
        }
    };

    const getActionText = (action: Action | null) => {
        switch (action) {
            case 'HIT': return 'HIT';
            case 'STAND': return 'STAND';
            case 'DOUBLE': return 'DOUBLE';
            case 'SPLIT': return 'SPLIT';
            default: return 'WAITING...';
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Dealer Section */}
            <div
                onClick={() => setInputTarget('DEALER')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${inputTarget === 'DEALER' ? 'bg-zinc-900/80 border-zinc-600' : 'bg-zinc-950 border-zinc-800/60 hover:border-zinc-700'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${inputTarget === 'DEALER' ? 'text-zinc-300' : 'text-zinc-600'}`}>Dealer</h3>
                    {dealerHand.length > 0 && (
                        <span className="text-zinc-400 text-sm font-black tabular-nums">
                            {dealerTotal.total || 0} {dealerTotal.isSoft && dealerTotal.total <= 21 ? '(S)' : ''}
                        </span>
                    )}
                </div>
                <div className="flex gap-1.5 flex-wrap min-h-[3rem] items-center">
                    {dealerHand.length > 0 ? dealerHand.map(card => (
                        <div key={card.id} className="bg-zinc-800/80 border border-zinc-700/50 text-white font-black text-base rounded-lg w-9 h-12 flex items-center justify-center">
                            {card.rank === 'J' ? '10' : card.rank}
                        </div>
                    )) : (
                        <span className="text-zinc-700 text-[10px]">No cards yet</span>
                    )}
                </div>
            </div>

            {/* Insurance Recommendation */}
            {insuranceRecommendation !== null && (
                <div className={`py-2 px-3 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider border ${insuranceRecommendation
                    ? 'bg-yellow-900/20 border-yellow-700/30 text-yellow-400'
                    : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-600'
                    }`}>
                    {insuranceRecommendation
                        ? <span className="flex items-center justify-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Buy Insurance (TC ≥ 3)</span>
                        : <span className="flex items-center justify-center gap-1.5"><ShieldX className="w-3 h-3" /> Skip Insurance</span>
                    }
                </div>
            )}

            {/* Recommendation & Controls */}
            <div className="flex gap-2 items-stretch" style={{ minHeight: '4.5rem' }}>
                <div className={`flex-1 p-2.5 rounded-2xl text-center border-2 ${getActionColor(suggestedAction)} transition-all duration-300 flex flex-col justify-center`}>
                    <p className="text-[8px] uppercase tracking-[0.2em] opacity-50 mb-0.5 font-bold">Recommended</p>
                    <h2 className="text-xl font-black leading-tight tracking-wide">
                        {getActionText(suggestedAction)}
                    </h2>
                </div>
                <div className="flex flex-col gap-1.5 w-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); undoLastCard(); }}
                        className="flex-1 text-[9px] bg-zinc-900 hover:bg-zinc-800 text-zinc-500 rounded-xl border border-zinc-800/60 font-bold uppercase transition-colors flex items-center justify-center gap-1 active:scale-95"
                    >
                        <Undo2 className="w-3 h-3" /> Undo
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); clearTable(); }}
                        className="flex-1 text-[9px] bg-zinc-900 hover:bg-zinc-800 text-zinc-500 rounded-xl border border-zinc-800/60 font-bold uppercase transition-colors active:scale-95"
                    >
                        Clear
                    </button>
                    {playerHand.length === 2 && playerHand[0].value === playerHand[1].value && (
                        <button
                            onClick={(e) => { e.stopPropagation(); splitHand(); }}
                            className="flex-1 text-[9px] bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold uppercase transition-colors active:scale-95"
                        >
                            SPLIT
                        </button>
                    )}
                </div>
            </div>

            {/* Bonus Warning */}
            {bonusWarning && (
                <div className="py-2 px-3 rounded-xl text-[11px] font-semibold border bg-amber-900/15 border-amber-700/30 text-amber-300 leading-relaxed">
                    {bonusWarning}
                </div>
            )}

            {/* Player Section */}
            <div
                onClick={() => setInputTarget('PLAYER')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${inputTarget === 'PLAYER' ? 'bg-zinc-900/80 border-zinc-600' : 'bg-zinc-950 border-zinc-800/60 hover:border-zinc-700'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${inputTarget === 'PLAYER' ? 'text-zinc-300' : 'text-zinc-600'}`}>Your Hand</h3>
                    <span className="text-zinc-400 text-sm font-black tabular-nums">
                        {playerTotal.total || 0} {playerTotal.isSoft && playerTotal.total <= 21 ? '(S)' : ''}
                    </span>
                </div>
                <div className="flex gap-1.5 flex-wrap min-h-[3rem] items-center">
                    {playerHand.length > 0 ? playerHand.map(card => (
                        <div key={card.id} className="bg-zinc-800/80 border border-zinc-700/50 text-white font-black text-base rounded-lg w-9 h-12 flex items-center justify-center">
                            {card.rank === 'J' ? '10' : card.rank}
                        </div>
                    )) : (
                        <span className="text-zinc-700 text-[10px]">Enter your cards...</span>
                    )}
                </div>
            </div>

            {/* Others/Discard Section */}
            <div
                onClick={() => setInputTarget('DISCARD')}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${inputTarget === 'DISCARD' ? 'bg-zinc-900/80 border-zinc-600' : 'bg-zinc-950 border-zinc-800/60 hover:border-zinc-700'}`}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${inputTarget === 'DISCARD' ? 'text-zinc-300' : 'text-zinc-600'}`}>Others</h3>
                    {otherCards.length > 0 && <span className="text-zinc-600 text-[9px] font-bold">{otherCards.length} cards</span>}
                </div>
                <div className="flex gap-1 flex-wrap min-h-[2rem] items-center">
                    {otherCards.length > 0 ? otherCards.map(card => (
                        <div key={card.id} className="bg-zinc-900 border border-zinc-800/50 text-zinc-500 font-bold text-[10px] rounded w-6 h-8 flex items-center justify-center">
                            {card.rank === 'J' ? '10' : card.rank}
                        </div>
                    )) : (
                        <span className="text-zinc-800 text-[9px]">Add other visible cards here</span>
                    )}
                </div>
            </div>
        </div>
    );
};
