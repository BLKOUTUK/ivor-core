import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import express from 'express'
import { validateInput, detectUrgent, checkOutput, buildPrompt } from '../consult.js'
import { createConsultRouter } from '../../api/consultRoutes.js'

const base = {
  gesture: 'your application for Making Ourselves From Scratch',
  surface: 'scratch',
  audience: 'man',
  first_name: 'Test',
  his_words: 'I want to learn to speak in public and meet other Black queer men in Croydon.',
  promise: { owed: 'How the programme works and what happens next.', follow_on: 'An invitation to the Hub.' },
  allowed_links: ['https://blkoutuk.com/scratch', 'https://blkouthub.com'],
}
const goodDraft =
  'Test, this is AIvor, BLKOUT\'s assistant, not a person. Your application is in. You said you want to learn to speak in public, and the briefing sets out how the sessions work and what happens next: https://blkoutuk.com/scratch . If you would like company between now and then, the Hub is open to you: https://blkouthub.com'

test('valid input passes', () => {
  assert.equal(validateInput(base).ok, true)
})

test('an email address anywhere is rejected', () => {
  const r = validateInput({ ...base, his_words: 'write to me at someone@example.com' })
  assert.deepEqual(r, { ok: false, error: 'personal_identifiers_rejected' })
})

test('a UK phone number is rejected', () => {
  const r = validateInput({ ...base, his_words: 'ring me on 07700 900123' })
  assert.deepEqual(r, { ok: false, error: 'personal_identifiers_rejected' })
})

test('over-long words and non-https links are rejected', () => {
  assert.equal(validateInput({ ...base, his_words: 'x'.repeat(1501) }).ok, false)
  assert.equal(validateInput({ ...base, allowed_links: ['http://insecure.example'] }).ok, false)
})

test('urgent language is caught', () => {
  assert.equal(detectUrgent('I have nowhere to go tonight'), true)
  assert.equal(detectUrgent('I want to die'), true)
  assert.equal(detectUrgent('looking forward to the picnic'), false)
})

test('a good draft is accepted and keeps its theme', () => {
  const r = checkOutput(JSON.stringify({ theme: 'belonging', draft: goodDraft }), validateInput(base).ok ? (validateInput(base) as any).value : null)
  assert.equal(r.flags.length, 0)
  assert.equal(r.theme, 'belonging')
})

test('a draft that breaks a rule is refused, not repaired', () => {
  const i = (validateInput(base) as any).value
  const cases: [string, string][] = [
    ['draft_uses_unlisted_link', goodDraft + ' https://elsewhere.example'],
    ['draft_does_not_say_it_is_aivor', goodDraft.replace(/AIvor/g, 'we')],
    ['draft_contains_identifier', goodDraft + ' Write to me at a@b.co'],
    ['draft_contains_emoji', goodDraft + ' \u{1F60A}'],
    ['draft_length_out_of_range', 'AIvor here.'],
  ]
  for (const [flag, draft] of cases) {
    const r = checkOutput(JSON.stringify({ theme: 'other', draft }), i)
    assert.equal(r.draft, null, flag)
    assert.deepEqual(r.flags, [flag])
  }
  assert.deepEqual(checkOutput('not json at all', i).flags, ['model_output_not_json'])
})

test('the prompt never contains an email address', () => {
  const p = buildPrompt((validateInput(base) as any).value)
  assert.equal(/@/.test(p.system + p.user), false)
})

async function call(secretEnv: string | undefined, header: string | undefined, body: any, complete: (s: string, u: string) => Promise<string>) {
  const app = express()
  app.use(express.json())
  app.use('/api/consult', createConsultRouter({ secret: () => secretEnv, complete }))
  const server = http.createServer(app)
  await new Promise<void>((r) => server.listen(0, r))
  const port = (server.address() as any).port
  const res = await fetch(`http://127.0.0.1:${port}/api/consult/gesture`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(header ? { 'x-consult-secret': header } : {}) },
    body: JSON.stringify(body),
  })
  const json: any = await res.json()
  server.close()
  return { status: res.status, json }
}

test('route fails closed when no secret is configured', async () => {
  const r = await call(undefined, 'x', base, async () => { throw new Error('should not be called') })
  assert.equal(r.status, 503)
})

test('route refuses a wrong secret and does not call the model', async () => {
  let called = false
  const r = await call('right', 'wrong', base, async () => { called = true; return '' })
  assert.equal(r.status, 403)
  assert.equal(called, false)
})

test('urgent text is returned as urgent and never sent to the model', async () => {
  let called = false
  const r = await call('s', 's', { ...base, his_words: 'I have nowhere to go and I am not safe' }, async () => { called = true; return '' })
  assert.equal(r.status, 200)
  assert.equal(r.json.urgent, true)
  assert.equal(r.json.draft, null)
  assert.equal(called, false)
})

test('a payload with an email address never reaches the model', async () => {
  let called = false
  const r = await call('s', 's', { ...base, his_words: 'me@example.com' }, async () => { called = true; return '' })
  assert.equal(r.status, 400)
  assert.equal(called, false)
})

test('a model failure is a 503, never a made-up draft', async () => {
  const r = await call('s', 's', base, async () => { throw new Error('boom') })
  assert.equal(r.status, 503)
  assert.equal(r.json.draft, undefined)
})

test('happy path returns the checked draft', async () => {
  const r = await call('s', 's', base, async () => JSON.stringify({ theme: 'belonging', draft: goodDraft }))
  assert.equal(r.status, 200)
  assert.equal(r.json.draft, goodDraft)
  assert.equal(r.json.urgent, false)
})
