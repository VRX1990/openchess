// Off-main-thread chess engine: bot move search and coach move classification
// run here so the UI never freezes (a depth-3 search blocks the main thread
// for 200ms+ otherwise).
import { chooseBotMove } from './engine';
import { evaluateCoachStudentMove } from './coach';
import type { CoachPersonaId } from './coach';
import type { BotId } from './engine';

export interface WorkerRequest {
  reqId: number;
  kind: 'botmove' | 'lesson';
  fen: string;
  botId?: BotId;
  elo?: number;
  from?: string;
  to?: string;
  promotion?: string;
  ply?: number;
  coachId?: CoachPersonaId;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;
  try {
    if (msg.kind === 'botmove') {
      const move = chooseBotMove(msg.fen, msg.botId!, Math.random, msg.elo);
      (self as unknown as Worker).postMessage({
        reqId: msg.reqId,
        result: move
          ? { from: move.from, to: move.to, promotion: move.promotion ?? undefined }
          : null,
      });
      return;
    }
    if (msg.kind === 'lesson') {
      const lesson = evaluateCoachStudentMove(
        msg.fen,
        msg.from!,
        msg.to!,
        (msg.promotion ?? 'q') as 'q',
        msg.ply ?? 0,
        msg.coachId ?? 'viktor',
      );
      (self as unknown as Worker).postMessage({ reqId: msg.reqId, result: lesson });
      return;
    }
  } catch {
    (self as unknown as Worker).postMessage({ reqId: msg.reqId, result: null });
  }
};
