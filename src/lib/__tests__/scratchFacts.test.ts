import test from 'node:test'
import assert from 'node:assert/strict'
import { scratchFacts, SCRATCH_APPLY_URL, SCRATCH_BRIEFING_URL, SCRATCH_CONTACT } from '../scratchFacts.js'

const VERIFIED_URLS = [SCRATCH_APPLY_URL, SCRATCH_BRIEFING_URL]

test('open wording through 5 October, and it names the application link', () => {
  for (const d of ['2026-09-30', '2026-10-05']) {
    const t = scratchFacts(d)
    assert.match(t, /Applications close on 5 October 2026/)
    assert.ok(t.includes(SCRATCH_APPLY_URL), d)
  }
})

test('closed wording from 6 October to 28 December: no application link, says closed', () => {
  for (const d of ['2026-10-06', '2026-12-28']) {
    const t = scratchFacts(d)
    assert.match(t, /Applications closed on 5 October 2026/)
    assert.equal(t.includes(SCRATCH_APPLY_URL), false, d)
    assert.match(t, /You cannot take applications/)
  }
})

test('nothing after 28 December', () => {
  assert.equal(scratchFacts('2026-12-29'), '')
  assert.equal(scratchFacts('2027-03-01'), '')
})

test('every URL in the block is one of the verified links', () => {
  for (const d of ['2026-09-30', '2026-10-06']) {
    const urls = scratchFacts(d).match(/https?:\/\/[^\s)]+/g) ?? []
    for (const u of urls) {
      assert.ok(VERIFIED_URLS.includes(u.replace(/[.,;]+$/, '')), `${d}: ${u}`)
    }
  }
})

test('the only email address is the contact address', () => {
  for (const d of ['2026-09-30', '2026-10-06']) {
    const emails = scratchFacts(d).match(/[^\s@]+@[^\s@]+\.[^\s@.,)]+/g) ?? []
    assert.ok(emails.length > 0)
    for (const e of emails) assert.equal(e.replace(/[.,;]+$/, ''), SCRATCH_CONTACT)
  }
})

test('the hard rules are present: no place implied, no applicants named, no details taken', () => {
  const open = scratchFacts('2026-09-30')
  assert.match(open, /never say or imply that someone has a place/)
  assert.match(open, /never say who has applied/)
  assert.match(open, /do not ask for or accept personal details in the chat/)
  assert.match(open, /eight places/)
})

test('facts match the public page', () => {
  const t = scratchFacts('2026-09-30')
  for (const f of ['eight Black queer men in Croydon', 'Waterside Centre, South Norwood', 'Monday 28 December', 'Stanley Arts', 'within 48 hours', 'Derek Aidoo']) {
    assert.ok(t.includes(f), f)
  }
})
