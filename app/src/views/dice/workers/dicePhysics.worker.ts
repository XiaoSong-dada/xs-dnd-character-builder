/// <reference lib="webworker" />

import type { RollRequest } from '@/types/dice'
import { simulateDiceRoll } from '@/views/dice/engine/dice-physics'

self.addEventListener('message', (event: MessageEvent<RollRequest>) => {
  try {
    const response = simulateDiceRoll(event.data)
    if (response.type === 'success') {
      self.postMessage(response, { transfer: [response.trajectory.transforms.buffer] })
    } else {
      self.postMessage(response)
    }
  } catch {
    self.postMessage({ type: 'failure', rollId: event.data.id, reason: 'worker-error' })
  }
})

