import { describe, expect, it } from 'vitest'
import { takeLines } from '../useChat'

describe('takeLines', () => {
  it('keeps a line cut between two reads until it is complete', () => {
    const [first, rest] = takeLines('data: {"text":"Hel')
    expect(first).toEqual([])
    const [second, tail] = takeLines(`${rest}lo"}\n\ndata: {"te`)
    expect(second).toEqual(['data: {"text":"Hello"}', ''])
    expect(tail).toBe('data: {"te')
  })
})
