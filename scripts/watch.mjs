#!/usr/bin/env node
// Poll the board and print which factory command is waiting.
//
//   node scripts/watch.mjs [--interval 60] [--once]
//
// No model call, no state on disk, nothing to clean up. Closing the terminal
// ends it. The previous reading lives in a variable, so starting the watcher
// prints a baseline once and then stays quiet until something moves.

import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIN_INTERVAL = 15

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}

const once = process.argv.includes('--once')
const interval = Math.max(MIN_INTERVAL, Number(arg('interval', 60)) || 60)

// What each column means. Read from board.json by role rather than by name,
// because the column list has already changed four times.
function meanings(cfg) {
  return new Map([
    [cfg.refineColumn, 'run /factory-start'],
    [cfg.specColumn, 'run /factory-create-spec'],
    [cfg.buildColumn, 'run /factory-build'],
    [cfg.retroColumn, 'run /factory-retro'],
    [cfg.approvalColumn, 'waiting on you, answer the DECISIONS rows'],
    [cfg.reviewColumn, 'waiting on CodeRabbit'],
    [cfg.mergeColumn, 'waiting on you, read the diff and merge'],
    [cfg.stuckColumn, 'STUCK, yours to decide'],
  ])
}

async function readBoard(cfg) {
  const { stdout } = await run('bash', [join(ROOT, 'scripts', 'board.sh'), 'list'], { cwd: ROOT })
  const cards = new Map()
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue
    const [id, status, , number, , title] = line.split('\t')
    // Bob's Draft Notes is private. Drop it here, before anything is formatted.
    if (status === cfg.privateColumn) continue
    cards.set(id, { status, label: `${number === '-' ? '' : number + ' '}${title ?? ''}`.trim() })
  }
  return cards
}

function firstLine(err) {
  return String(err.message).split(String.fromCharCode(10))[0].trim()
}

function pad(s, n) {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

function baseline(cards, cfg, how) {
  const byColumn = new Map()
  for (const card of cards.values()) {
    if (card.status === cfg.doneColumn) continue
    if (!byColumn.has(card.status)) byColumn.set(card.status, [])
    byColumn.get(card.status).push(card.label)
  }
  if (byColumn.size === 0) {
    console.log('board is quiet')
    return
  }
  for (const column of cfg.columns) {
    const labels = byColumn.get(column)
    if (!labels) continue
    console.log(`${pad(column, 20)} ${pad(String(labels.length), 3)} ${how.get(column) ?? ''}`)
    for (const label of labels) console.log(`  ${label}`)
  }
}

function report(before, after, cfg, how) {
  for (const [id, card] of after) {
    const was = before.get(id)
    if (was && was.status === card.status) continue
    if (card.status === cfg.doneColumn) continue
    const from = was ? `${was.status} -> ${card.status}` : `new in ${card.status}`
    console.log(`${pad(card.label, 44)} ${pad(from, 40)} ${how.get(card.status) ?? ''}`)
  }
}

const cfg = JSON.parse(await readFile(join(ROOT, '.factory', 'board.json'), 'utf8'))
const how = meanings(cfg)

let failures = 0
let previous = new Map()

// One line on failure, never a stack trace. A broken first read starts the
// loop with an empty baseline, so the next good poll reports the whole board.
async function poll() {
  try {
    const cards = await readBoard(cfg)
    failures = 0
    return cards
  } catch (err) {
    failures += 1
    console.error(failures >= 3
      ? `board.sh has failed ${failures} times in a row: ${firstLine(err)}`
      : `board read failed, keeping the last one: ${firstLine(err)}`)
    return null
  }
}

const first = await poll()
if (first) {
  previous = first
  baseline(previous, cfg, how)
}

if (once) process.exit(first ? 0 : 1)

console.log(`\nwatching every ${interval}s. ctrl-c to stop.`)

setInterval(async () => {
  // A blip keeps the last good reading, so it cannot produce phantom moves.
  const current = await poll()
  if (!current) return
  report(previous, current, cfg, how)
  previous = current
}, interval * 1000)
