// Promise-based access to the engine worker, with a synchronous fallback if
// workers are unavailable. Keeps chess searches off the UI thread so coach
// games stay perfectly smooth.
import type { Move, PieceSymbol } from 'chess.js';
import { chooseBotMove, type BotId } from './engine';
import { evaluateCoachStudentMove, type CoachLessonFeedback, type CoachPersonaId } from './coach';

let worker: Worker | null = null;
let workerFailed = false;
let nextReqId = 1;
const pending = new Map<number, (value: unknown) => void>();

function getWorker(): Worker | null {
  if (workerFailed) return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ reqId: number; result: unknown }>) => {
      const { reqId, result } = e.data;
      const resolve = pending.get(reqId);
      if (resolve) {
        pending.delete(reqId);
        resolve(result);
      }
    };
    worker.onerror = () => {
      workerFailed = true;
      for (const resolve of pending.values()) resolve(undefined);
      pending.clear();
    };
  } catch {
    workerFailed = true;
    worker = null;
  }
  return worker;
}

function callWorker<T>(msg: Record<string, unknown>, fallback: () => T, timeoutMs = 3000): Promise<T> {
  const w = getWorker();
  if (!w) return Promise.resolve(fallback());
  const reqId = nextReqId++;
  return new Promise<T>((resolve) => {
    let settled = false;
    const done = (value: unknown) => {
      if (settled) return;
      settled = true;
      pending.delete(reqId);
      resolve(value === undefined ? fallback() : (value as T));
    };
    pending.set(reqId, done);
    w.postMessage({ reqId, ...msg });
    window.setTimeout(() => done(undefined), timeoutMs);
  });
}

export interface BotMoveOut {
  from: string;
  to: string;
  promotion?: PieceSymbol;
}

export function requestBotMove(
  fen: string,
  botId: BotId,
  elo?: number,
): Promise<BotMoveOut | null> {
  return callWorker<BotMoveOut | null>(
    { kind: 'botmove', fen, botId, elo },
    () => {
      const move = chooseBotMove(fen, botId, Math.random, elo);
      return move
        ? { from: move.from, to: move.to, promotion: move.promotion ?? undefined }
        : null;
    },
    4000,
  );
}

export function requestCoachLesson(params: {
  fen: string;
  from: string;
  to: string;
  promotion: PieceSymbol;
  ply: number;
  coachId: CoachPersonaId;
}): Promise<CoachLessonFeedback | null> {
  return callWorker<CoachLessonFeedback | null>(
    {
      kind: 'lesson',
      fen: params.fen,
      from: params.from,
      to: params.to,
      promotion: params.promotion,
      ply: params.ply,
      coachId: params.coachId,
    },
    () =>
      evaluateCoachStudentMove(
        params.fen,
        params.from,
        params.to,
        params.promotion,
        params.ply,
        params.coachId,
      ),
  );
}
