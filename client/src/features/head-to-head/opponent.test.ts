import type { User } from '~/types'
import { afterEach, describe, expect, it } from 'vitest'
import { selectedOpponentId, selectOpponent, syncSelectedOpponent } from './opponent'

const bob: User = { id: 2, name: 'Bob', email: 'bob@test.com', avatar: '02' }
const charlie: User = { id: 3, name: 'Charlie', email: 'charlie@test.com', avatar: '03' }

afterEach(() => {
  localStorage.clear()
  selectOpponent(undefined, undefined)
})

describe('selectOpponent', () => {
  it('sets the selected opponent ID', () => {
    selectOpponent(2, 1)
    expect(selectedOpponentId()).toBe(2)
  })

  it('persists to localStorage', () => {
    selectOpponent(2, 1)
    expect(localStorage.getItem('selected_opponent:1')).toBe('2')
  })

  it('removes from localStorage when undefined', () => {
    selectOpponent(2, 1)
    selectOpponent(undefined, 1)
    expect(localStorage.getItem('selected_opponent:1')).toBeNull()
  })
})

describe('syncSelectedOpponent', () => {
  it('restores stored opponent if available', () => {
    localStorage.setItem('selected_opponent:1', '2')
    syncSelectedOpponent([bob, charlie], 1)
    expect(selectedOpponentId()).toBe(2)
  })

  it('auto-selects when only one opponent', () => {
    syncSelectedOpponent([bob], 1)
    expect(selectedOpponentId()).toBe(2)
  })

  it('clears selection when multiple opponents and no stored value', () => {
    syncSelectedOpponent([bob, charlie], 1)
    expect(selectedOpponentId()).toBeUndefined()
  })

  it('falls back when stored opponent is not in list', () => {
    localStorage.setItem('selected_opponent:1', '99')
    syncSelectedOpponent([bob, charlie], 1)
    expect(selectedOpponentId()).toBeUndefined()
  })

  it('keeps current selection if still valid', () => {
    selectOpponent(2, 1)
    syncSelectedOpponent([bob, charlie], 1)
    expect(selectedOpponentId()).toBe(2)
  })
})
