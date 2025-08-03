#!/usr/bin/env node
/* eslint-env node */
/* global process, Buffer */
// @ts-check
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PARTS_DIR = path.resolve(__dirname, '..', 'assets', 'mork_borg')
const PARTS_FILE = path.join(PARTS_DIR, 'parts.json')
const LOCK_FILE = path.join(PARTS_DIR, 'parts.lock.json')
const DEFAULT_ALGORITHM = 'sha256'

/**
 * @param {string} file
 */
async function loadJson(file) {
  const text = await readFile(file, 'utf8')
  return JSON.parse(text)
}

async function loadParts() {
  return loadJson(PARTS_FILE)
}

async function loadLock() {
  try {
    return await loadJson(LOCK_FILE)
  } catch {
    return {}
  }
}

/**
 * @param {unknown} obj
 * @param {string} [algorithm]
 */
function computeDigest(obj, algorithm = DEFAULT_ALGORITHM) {
  const json = JSON.stringify(obj)
  const value = crypto.createHash(algorithm).update(json).digest('hex')
  return { value, algorithm }
}

async function listPartsToUpdate() {
  const parts = await loadParts()
  const lock = await loadLock()
  const out = []
  for (const [id, data] of Object.entries(parts)) {
    const digest = computeDigest(data)
    const locked = lock[id]
    if (!locked || locked.value !== digest.value || locked.algorithm !== digest.algorithm) {
      out.push(id)
    }
  }
  return out
}

/**
 * @param {string} prompt
 * @returns {Promise<Buffer>}
 */
async function generateImage(prompt) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '512x512' }),
  })
  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.status} ${await response.text()}`)
  }
  const body = await response.json()
  const b64 = body.data && body.data[0] && body.data[0].b64_json
  if (!b64) throw new Error('No image data received')
  return Buffer.from(b64, 'base64')
}

/**
 * @param {string} id
 */
async function updatePart(id) {
  const parts = await loadParts()
  const part = parts[id]
  if (!part) throw new Error(`Unknown part: ${id}`)
  const digest = computeDigest(part)
  const img = await generateImage(part.description)
  await mkdir(PARTS_DIR, { recursive: true })
  await writeFile(path.join(PARTS_DIR, `part_${id}.png`), img)
  const lock = await loadLock()
  lock[id] = digest
  await writeFile(LOCK_FILE, JSON.stringify(lock, null, 2))
}

async function updateAll() {
  const ids = await listPartsToUpdate()
  for (const id of ids) {
    await updatePart(id)
  }
}

const [,,cmd, arg] = process.argv
switch (cmd) {
  case 'list-parts-to-update': {
    const ids = await listPartsToUpdate()
    console.log(JSON.stringify(ids))
    break
  }
  case 'update-part': {
    if (!arg) {
      console.error('Usage: update-part <id>')
      process.exit(1)
    }
    await updatePart(arg)
    break
  }
  case 'update-all': {
    await updateAll()
    break
  }
  default:
    console.error('Unknown command')
    process.exit(1)
}
