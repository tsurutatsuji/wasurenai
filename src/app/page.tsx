"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRetention, getMemoryStatus } from "@/lib/forgetting-curve";

interface Card {
  id: string;
  front: string;
  back: string;
  createdAt: string;
  lastReviewedAt: string;
  reviewCount: number;
}

const DEMO_CARDS: Card[] = [
  { id: "1", front: "関ヶ原の戦いは何年？", back: "1600年", createdAt: new Date(Date.now() - 3*86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 2*86400000).toISOString(), reviewCount: 1 },
  { id: "2", front: "光の速さは？", back: "約30万km/s", createdAt: new Date(Date.now() - 7*86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 5*86400000).toISOString(), reviewCount: 2 },
  { id: "3", front: "photosynthesisの意味は？", back: "光合成", createdAt: new Date(Date.now() - 86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 86400000).toISOString(), reviewCount: 0 },
  { id: "4", front: "三角形の面積の公式", back: "底辺×高さ÷2", createdAt: new Date(Date.now() - 14*86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 10*86400000).toISOString(), reviewCount: 3 },
  { id: "5", front: "DNA の正式名称は？", back: "デオキシリボ核酸", createdAt: new Date(Date.now() - 5*86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 4*86400000).toISOString(), reviewCount: 1 },
  { id: "6", front: "源氏物語の作者", back: "紫式部", createdAt: new Date(Date.now() - 30*86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 2*86400000).toISOString(), reviewCount: 5 },
  { id: "7", front: "sin 30° の値", back: "1/2（0.5）", createdAt: new Date(Date.now() - 10*86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 8*86400000).toISOString(), reviewCount: 2 },
  { id: "8", front: "明治維新は何年？", back: "1868年", createdAt: new Date(Date.now() - 0.5*86400000).toISOString(), lastReviewedAt: new Date(Date.now() - 0.3*86400000).toISOString(), reviewCount: 0 },
];

/* ── 円形メモリゲージ ── */
function MemoryGauge({ retention, size = 120 }: { retention: number; size?: number }) {
  const { color } = getMemoryStatus(retention);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (retention / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景円 */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#111" strokeWidth="6" />
        {/* ゲージ */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-light text-white">{retention}%</span>
        <span className="text-[0.55rem]" style={{ color }}>{getMemoryStatus(retention).label}</span>
      </div>
    </div>
  );
}

/* ── 忘却曲線グラフ（アニメーション付き） ── */
function ForgettingCurveGraph() {
  const hours = [0, 1, 6, 12, 24, 48, 72, 168, 336, 720];
  const curves = [0, 1, 3, 5].map((rc) => ({
    rc,
    points: hours.map((h) => Math.round(Math.exp(-h / (24 * Math.pow(2.5, rc))) * 100)),
  }));
  const colors = ["#ef4444", "#f59e0b", "#22d3ee", "#22c55e"];
  const labels = ["初回学習", "1回復習後", "3回復習後", "5回復習後"];
  const xLabels = ["今", "1h", "6h", "12h", "1日", "2日", "3日", "1週", "2週", "1ヶ月"];

  return (
    <div className="border border-[#a855f7]/15 bg-[#08080f] p-6 glow-purple">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white text-sm">忘却曲線 — 復習するほど記憶が長持ちする</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
          <span className="text-[#a855f7]/50 text-[0.6rem]">リアルタイム</span>
        </div>
      </div>

      <div className="relative h-48 mb-2">
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[0.55rem] text-[#555] py-1">
          <span>100%</span><span>50%</span><span>0%</span>
        </div>
        <svg viewBox="0 0 400 180" className="w-full h-full ml-10" preserveAspectRatio="none">
          {/* グリッド */}
          {[0, 45, 90, 135, 180].map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#1a1a2e" strokeWidth="0.5" />
          ))}
          {/* 危険ゾーン */}
          <rect x="0" y="108" width="400" height="72" fill="#ef444408" />
          <line x1="0" y1="108" x2="400" y2="108" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="4" opacity="0.3" />
          <text x="385" y="155" fill="#ef4444" fontSize="8" textAnchor="end" opacity="0.4">危険ゾーン</text>
          {/* 曲線 */}
          {curves.map((curve, ci) => (
            <motion.polyline
              key={ci}
              fill="none"
              stroke={colors[ci]}
              strokeWidth="2.5"
              opacity={0.8}
              points={curve.points.map((p, i) => `${(i / 9) * 400},${180 - p * 1.8}`).join(" ")}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: ci * 0.4, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${colors[ci]}40)` }}
            />
          ))}
        </svg>
      </div>

      {/* X軸 */}
      <div className="flex justify-between ml-10 text-[0.55rem] text-[#555]">
        {xLabels.map((l) => <span key={l}>{l}</span>)}
      </div>

      {/* 凡例 */}
      <div className="flex gap-5 mt-4 ml-10">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[0.6rem]">
            <span className="w-4 h-[2px] rounded" style={{ backgroundColor: colors[i], boxShadow: `0 0 4px ${colors[i]}60` }} />
            <span className="text-[#888]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 記憶カード ── */
function MemoryCard({ card, retention, onClick }: { card: Card; retention: number; onClick: () => void }) {
  const { color, label } = getMemoryStatus(retention);
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left p-4 border border-[#1a1a2e] bg-[#0a0a12] hover:bg-[#0d0d18] transition-all active:scale-[0.99]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-white text-sm flex-1">{card.front}</p>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <div className="text-right">
            <span className="text-lg font-light" style={{ color }}>{retention}%</span>
          </div>
        </div>
      </div>
      <div className="w-full h-[2px] bg-[#111] rounded-full overflow-hidden mb-1.5">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${retention}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="flex items-center justify-between text-[0.6rem] text-[#555]">
        <span>{label}</span>
        <span>復習{card.reviewCount}回</span>
      </div>
    </motion.button>
  );
}

export default function MemorizeApp() {
  const [cards, setCards] = useState<Card[]>(DEMO_CARDS);
  const [mode, setMode] = useState<"dashboard" | "review" | "add">("dashboard");
  const [reviewCard, setReviewCard] = useState<Card | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(i);
  }, []);

  const withRetention = cards.map((c) => ({
    ...c,
    retention: calculateRetention(c.lastReviewedAt, c.reviewCount),
  })).sort((a, b) => a.retention - b.retention);

  const needsReview = withRetention.filter((c) => c.retention < 80);
  const avgRetention = Math.round(withRetention.reduce((s, c) => s + c.retention, 0) / (withRetention.length || 1));
  const strongCards = withRetention.filter((c) => c.retention >= 80).length;

  const startReview = () => {
    if (needsReview.length === 0) return;
    setReviewCard(needsReview[0]);
    setShowAnswer(false);
    setMode("review");
  };

  const handleReview = (remembered: boolean) => {
    if (!reviewCard) return;
    setCards((prev) => prev.map((c) => c.id === reviewCard.id
      ? { ...c, lastReviewedAt: new Date().toISOString(), reviewCount: remembered ? c.reviewCount + 1 : 0 }
      : c
    ));
    const remaining = needsReview.filter((c) => c.id !== reviewCard.id);
    if (remaining.length > 0) {
      setReviewCard(remaining[0]);
      setShowAnswer(false);
    } else {
      setMode("dashboard");
      setReviewCard(null);
    }
  };

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    const now = new Date().toISOString();
    setCards((prev) => [...prev, { id: String(Date.now()), front: newFront.trim(), back: newBack.trim(), createdAt: now, lastReviewedAt: now, reviewCount: 0 }]);
    setNewFront("");
    setNewBack("");
    setMode("dashboard");
  };

  return (
    <div className="min-h-screen">
      {/* ━━━ ヘッダー ━━━ */}
      <header className="px-6 py-4 border-b border-[#1a1a2e]/50 sticky top-0 bg-[#06060a]/90 backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-wider">
              <span className="text-[#a855f7] text-glow-purple">ワスレナイ</span>
            </h1>
            <p className="text-[#555] text-xs">脳科学×忘却曲線で、最適なタイミングに復習して確実に覚える</p>
          </div>
          <div className="flex items-center gap-8 text-[0.7rem]">
            <div className="text-center">
              <div className="text-2xl text-white font-light">{cards.length}</div>
              <div className="text-[#555]">カード数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#22c55e] font-light text-glow-green">{strongCards}</div>
              <div className="text-[#555]">定着済み</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#f59e0b] font-light">{needsReview.length}</div>
              <div className="text-[#555]">要復習</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {mode === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* 上部: ゲージ + アクション */}
              <div className="grid grid-cols-12 gap-4">
                {/* 平均記憶率ゲージ */}
                <div className="col-span-4 border border-[#1a1a2e] bg-[#0a0a12] p-6 flex flex-col items-center justify-center">
                  <MemoryGauge retention={avgRetention} size={140} />
                  <p className="text-[#555] text-xs mt-3">全体の平均記憶率</p>
                </div>

                {/* アクションボタン */}
                <div className="col-span-8 flex flex-col gap-3">
                  <button
                    onClick={startReview}
                    disabled={needsReview.length === 0}
                    className="flex-1 py-6 border border-[#a855f7]/30 bg-[#a855f708] text-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all text-lg font-light active:scale-[0.98] disabled:opacity-20 glow-purple"
                  >
                    {needsReview.length > 0
                      ? `🧠 今すぐ復習する（${needsReview.length}枚が忘れかけている）`
                      : "✓ 全て覚えています！"}
                  </button>
                  <button
                    onClick={() => setMode("add")}
                    className="py-4 border border-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#06060a] transition-all text-sm active:scale-[0.98]"
                  >
                    + 新しいカードを追加
                  </button>
                </div>
              </div>

              {/* 忘却曲線グラフ */}
              <ForgettingCurveGraph />

              {/* カード一覧 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#888] text-xs">あなたのカード（記憶が薄い順）</p>
                  <p className="text-[#555] text-[0.6rem]">{tick > 0 ? "記憶率はリアルタイムで変化しています" : ""}</p>
                </div>
                <div className="space-y-2">
                  {withRetention.map((card) => (
                    <MemoryCard key={card.id} card={card} retention={card.retention} onClick={() => {}} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {mode === "review" && reviewCard && (
            <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-[#a855f7]/60 text-xs tracking-widest">復習中</p>
                <p className="text-[#555] text-sm mt-1">残り {needsReview.length} 枚</p>
              </div>

              <motion.div
                className="border border-[#a855f7]/20 bg-[#0a0a14] p-10 text-center min-h-[280px] flex flex-col items-center justify-center glow-purple"
                whileHover={{ scale: 1.01 }}
              >
                <p className="text-white text-2xl font-light mb-6 leading-relaxed">{reviewCard.front}</p>

                {showAnswer ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                    <div className="border-t border-[#a855f7]/20 pt-6">
                      <p className="text-[#a855f7] text-xl text-glow-purple">{reviewCard.back}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setShowAnswer(true)}
                    className="mt-4 px-8 py-3 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all"
                    whileTap={{ scale: 0.95 }}
                  >
                    答えを見る
                  </motion.button>
                )}
              </motion.div>

              {showAnswer && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => handleReview(false)}
                    className="py-5 border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all text-base active:scale-[0.97] glow-red"
                  >
                    😅 忘れていた
                  </button>
                  <button
                    onClick={() => handleReview(true)}
                    className="py-5 border border-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e] hover:text-white transition-all text-base active:scale-[0.97] glow-green"
                  >
                    ✓ 覚えていた
                  </button>
                </motion.div>
              )}

              <button onClick={() => { setMode("dashboard"); setReviewCard(null); }} className="w-full mt-4 py-2 text-[#555] hover:text-white text-xs">
                戻る
              </button>
            </motion.div>
          )}

          {mode === "add" && (
            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
              <h2 className="text-white text-lg font-light mb-6">新しいカードを追加</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[#888] text-xs block mb-2">問題（表面）</label>
                  <input type="text" value={newFront} onChange={(e) => setNewFront(e.target.value)} placeholder="例: 関ヶ原の戦いは何年？"
                    className="w-full bg-[#0a0a14] border border-[#1a1a2e] px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-[#888] text-xs block mb-2">答え（裏面）</label>
                  <input type="text" value={newBack} onChange={(e) => setNewBack(e.target.value)} placeholder="例: 1600年"
                    className="w-full bg-[#0a0a14] border border-[#1a1a2e] px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMode("dashboard")} className="py-3 border border-[#333] text-[#888] hover:text-white text-sm">キャンセル</button>
                <button onClick={addCard} disabled={!newFront.trim() || !newBack.trim()}
                  className="py-3 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all text-sm disabled:opacity-30">追加する</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
