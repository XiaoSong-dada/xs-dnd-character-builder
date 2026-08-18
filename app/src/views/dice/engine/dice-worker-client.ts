import DicePhysicsWorker from '@/views/dice/workers/dicePhysics.worker?worker'

import type { DiceWorkerResponse, RollRequest } from '@/types/dice'

export class DiceWorkerClient {
  private worker: Worker | undefined
  private pending = new Map<string, {
    resolve: (response: DiceWorkerResponse) => void
  }>()

  simulate(request: RollRequest): Promise<DiceWorkerResponse> {
    if (!this.worker) {
      this.worker = new DicePhysicsWorker()
      this.worker.addEventListener('message', this.handleMessage)
      this.worker.addEventListener('error', this.handleError)
    }

    return new Promise((resolve) => {
      this.pending.set(request.id, { resolve })
      this.worker?.postMessage(request)
    })
  }

  cancel(rollId: string) {
    const cancelled = this.pending.get(rollId)
    if (!cancelled) return
    this.pending.delete(rollId)
    this.disposeWorker()
    cancelled.resolve({ type: 'failure', rollId, reason: 'timeout' })
    for (const [pendingRollId, pending] of this.pending) {
      pending.resolve({ type: 'failure', rollId: pendingRollId, reason: 'worker-error' })
    }
    this.pending.clear()
  }

  terminate() {
    this.disposeWorker()
    for (const [rollId, pending] of this.pending) {
      pending.resolve({ type: 'failure', rollId, reason: 'worker-error' })
    }
    this.pending.clear()
  }

  private handleMessage = (event: MessageEvent<DiceWorkerResponse>) => {
    const rollId = event.data.type === 'success' ? event.data.trajectory.rollId : event.data.rollId
    const pending = this.pending.get(rollId)
    if (!pending) return
    this.pending.delete(rollId)
    pending.resolve(event.data)
  }

  private handleError = () => {
    for (const [rollId, pending] of this.pending) {
      pending.resolve({ type: 'failure', rollId, reason: 'worker-error' })
    }
    this.pending.clear()
  }

  private disposeWorker() {
    this.worker?.removeEventListener('message', this.handleMessage)
    this.worker?.removeEventListener('error', this.handleError)
    this.worker?.terminate()
    this.worker = undefined
  }
}
