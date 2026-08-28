import type { CharacterMediaRef, CharacterPortraitRef } from '@/types/character'

export const CHARACTER_IMAGE_MAX_FILE_SIZE = 10 * 1024 * 1024
export const CHARACTER_PACKAGE_MAX_SIZE = 25 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const AVATAR_SIZE = 512
const PORTRAIT_MAX_EDGE = 1600

export interface ImageFocus {
  readonly x: number
  readonly y: number
}

interface DecodedImage {
  readonly source: CanvasImageSource
  readonly width: number
  readonly height: number
  readonly close: () => void
}

export class CharacterImageError extends Error {}

export function clampFocus(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.5))
}

export function validateCharacterImage(file: Blob): void {
  if (!ALLOWED_TYPES.has(file.type)) throw new CharacterImageError('仅支持 JPEG、PNG 或 WebP 图片。')
  if (file.size > CHARACTER_IMAGE_MAX_FILE_SIZE) throw new CharacterImageError('图片不能超过 10 MB。')
  if (file.size === 0) throw new CharacterImageError('图片文件为空。')
}

async function decodeImage(blob: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob)
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }
  }
  const url = URL.createObjectURL(blob)
  const image = new Image()
  image.src = url
  try {
    await image.decode()
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    throw new CharacterImageError('无法读取这张图片。')
  }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new CharacterImageError('图片处理失败。')), 'image/webp', 0.86)
  })
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: DecodedImage,
  targetWidth: number,
  targetHeight: number,
  focus: ImageFocus,
): void {
  const scale = Math.max(targetWidth / image.width, targetHeight / image.height)
  const sourceWidth = targetWidth / scale
  const sourceHeight = targetHeight / scale
  const sourceX = (image.width - sourceWidth) * clampFocus(focus.x)
  const sourceY = (image.height - sourceHeight) * clampFocus(focus.y)
  context.drawImage(image.source, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight)
}

export async function processAvatarImage(blob: Blob, focus: ImageFocus = { x: 0.5, y: 0.5 }): Promise<{ blob: Blob; ref: Omit<CharacterMediaRef, 'mediaId'> }> {
  validateCharacterImage(blob)
  const image = await decodeImage(blob)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = AVATAR_SIZE
    canvas.height = AVATAR_SIZE
    const context = canvas.getContext('2d')
    if (!context) throw new CharacterImageError('当前浏览器无法处理图片。')
    drawCover(context, image, AVATAR_SIZE, AVATAR_SIZE, focus)
    return { blob: await canvasBlob(canvas), ref: { mimeType: 'image/webp', width: AVATAR_SIZE, height: AVATAR_SIZE } }
  } finally {
    image.close()
  }
}

export async function processPortraitImage(blob: Blob, focus: ImageFocus = { x: 0.5, y: 0.5 }): Promise<{ blob: Blob; ref: Omit<CharacterPortraitRef, 'mediaId'> }> {
  validateCharacterImage(blob)
  const image = await decodeImage(blob)
  try {
    const scale = Math.min(1, PORTRAIT_MAX_EDGE / Math.max(image.width, image.height))
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new CharacterImageError('当前浏览器无法处理图片。')
    context.drawImage(image.source, 0, 0, width, height)
    return {
      blob: await canvasBlob(canvas),
      ref: { mimeType: 'image/webp', width, height, focusX: clampFocus(focus.x), focusY: clampFocus(focus.y) },
    }
  } finally {
    image.close()
  }
}

