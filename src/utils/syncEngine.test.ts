import { describe, it, expect } from 'vitest';
import { remoteWinsIds, pruneTombstones, stampOf } from './syncEngine';

describe('stampOf', () => {
  it('prefers updated_at, then timestamp, then created_at', () => {
    expect(stampOf({ updated_at: 'u', timestamp: 't', created_at: 'c' })).toBe('u');
    expect(stampOf({ timestamp: 't', created_at: 'c' })).toBe('t');
    expect(stampOf({ created_at: 'c' })).toBe('c');
    expect(stampOf({})).toBe('');
  });
});

describe('remoteWinsIds (last-write-wins)', () => {
  it('remote newer than local wins', () => {
    const local = new Map([['a', '2026-10-01T00:00:00Z']]);
    const remote = [{ id: 'a', stamp: '2026-10-02T00:00:00Z' }];
    expect(remoteWinsIds(local, remote, new Set())).toEqual(new Set(['a']));
  });
  it('local newer than remote does not win for remote', () => {
    const local = new Map([['a', '2026-10-03T00:00:00Z']]);
    const remote = [{ id: 'a', stamp: '2026-10-02T00:00:00Z' }];
    expect(remoteWinsIds(local, remote, new Set()).size).toBe(0);
  });
  it('remote-only rows are taken', () => {
    const remote = [{ id: 'b', stamp: '2026-10-02T00:00:00Z' }];
    expect(remoteWinsIds(new Map(), remote, new Set())).toEqual(new Set(['b']));
  });
  it('tombstoned ids are never resurrected', () => {
    const remote = [{ id: 'c', stamp: '2026-10-05T00:00:00Z' }];
    expect(remoteWinsIds(new Map(), remote, new Set(['c'])).size).toBe(0);
  });
});

describe('pruneTombstones', () => {
  it('drops tombstones older than 7 days', () => {
    const now = '2026-10-11T00:00:00.000Z';
    const old = '2026-10-01T00:00:00.000Z';
    const recent = '2026-10-10T00:00:00.000Z';
    const out = pruneTombstones(
      [
        { id: 'old', at: old },
        { id: 'new', at: recent },
      ],
      now
    );
    expect(out.map((t) => t.id)).toEqual(['new']);
  });
});
