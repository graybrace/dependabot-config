import { has } from "./array";

it('has returns true if item is first', () => {
    expect(has([ 1, 2, 3 ], 1)).toBe(true)
})

it('has returns true if item is middle', () => {
    expect(has([ 1, 2, 3 ], 2)).toBe(true)
})

it('has returns true if item is last', () => {
    expect(has([ 1, 2, 3 ], 3)).toBe(true)
})

it('has returns false if item is missing', () => {
    expect(has([ 1, 2, 3 ], 4)).toBe(false)
})