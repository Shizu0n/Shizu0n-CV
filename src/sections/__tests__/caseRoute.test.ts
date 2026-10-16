import { describe, expect, it } from 'vitest';
import { caseHash, parseCaseHash } from '../caseRoute';

const IDS = ['react-agent', 'phi3-mini-sql'];

describe('case route', () => {
  it('round-trips a project id through its hash', () => {
    expect(parseCaseHash(caseHash('react-agent'), IDS)).toBe('react-agent');
  });

  it('ignores the plain section hash, other hashes and unknown projects', () => {
    expect(parseCaseHash('#projects', IDS)).toBeNull();
    expect(parseCaseHash('#contact', IDS)).toBeNull();
    expect(parseCaseHash('#projects/not-a-project', IDS)).toBeNull();
    expect(parseCaseHash('', IDS)).toBeNull();
  });

  it('returns null instead of throwing on a malformed escape', () => {
    expect(parseCaseHash('#projects/%E0%A4%A', IDS)).toBeNull();
    expect(parseCaseHash('#projects/%', IDS)).toBeNull();
  });
});
