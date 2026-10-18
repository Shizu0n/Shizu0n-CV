import { describe, expect, it } from 'vitest'
import { scoreAnswer } from '../scripts/run-chat-evals.js'

describe('scoreAnswer', () => {
  it('matches terms case- and accent-insensitively', () => {
    const entry = { must_include: ['idempot', 'CampusCycle'] }
    expect(scoreAnswer(entry, 'O campuscycle sincroniza de forma idempotente.').pass).toBe(true)
    expect(scoreAnswer({ must_include: ['integrações'] }, 'Tem integracoes com três APIs.').pass).toBe(true)
  })

  it('needs one of the must_include_any terms', () => {
    const entry = { must_include: ['contact'], must_include_any: ['not on record', "don't have"] }
    expect(scoreAnswer(entry, 'That is not on record; contact Paulo.').pass).toBe(true)
    expect(scoreAnswer(entry, 'Contact Paulo.').missing).toEqual(["one of: not on record | don't have"])
  })

  it('fails a held title or inflated claim, not the internship names', () => {
    const entry = { must_include: ['Paulo'] }
    expect(scoreAnswer(entry, 'Paulo is an AI Engineer.').forbidden).toHaveLength(1)
    expect(scoreAnswer(entry, 'Paulo rigorously tested it.').pass).toBe(false)
    expect(scoreAnswer(entry, 'Paulo targets AI Engineering and Software Engineering internships.').pass).toBe(true)
  })

  it('fails an empty answer', () => {
    expect(scoreAnswer({ must_include: [] }, '').pass).toBe(false)
  })
})
