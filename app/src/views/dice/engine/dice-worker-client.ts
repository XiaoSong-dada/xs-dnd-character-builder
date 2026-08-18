import DicePhysicsWorker from '@/views/dice/workers/dicePhysics.worker?worker'

import type { DiceWorkerResponse, RollRequest } from '@/types/dice'

export class DiceWorkerClient {
  private worker: Worker | undefined
  private pending = new Map<string, {
    resolve: (response: DiceWorkerResponse) => void
    timer: ReturnType<typeof setTimeout>
  }>()

  simulate(request: RollRequest): Promise<DiceWorkerResponse> {
    if (!this.worker) {
      this.worker = new DicePhysicsWorker()
      this.worker.addEventListener('message', this.handleMessage)
      this.worker.addEventListener('error', this.handleError)
    }

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(request.id)
        resolve({ type: 'failure', rollId: request.id, reason: 'timeout' })
      }, 9000)
      this.pending.set(request.id, { resolve, timer })
      this.worker?.postMessage(request)
    })
  }

  terminate() {
    this.worker?.removeEventListener('message', this.handleMessage)
    this.worker?.removeEventListener('error', this.handleError)
    this.worker?.terminate()
    this.worker = undefined
    for (const [rollId, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.resolve({ type: 'failure', rollId, reason: 'worker-error' })
    }
    this.pending.clear()
  }

  private handleMessage = (event: MessageEvent<DiceWorkerResponse>) => {
    const rollId = event.data.type === 'success' ? event.data.trajectory.rollId : event.data.rollId
    const pending = this.pending.get(rollId)
    if (!pending) return
    clearTimeout(pending.timer)
    this.pending.delete(rollId)
    pending.resolve(event.data)
  }

  private handleError = () => {
    for (const [rollId, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.resolve({ type: 'failure', rollId, reason: 'worker-error' })
    }
    this.pending.clear()
  }
}

