import { describe, expect, it } from 'vitest';
import { getShowcaseProjects } from '../../components/chatProjectCatalog';
import { PROJECT_PRESENTATION } from '../projectsPresentation';

const SPAN: Record<string, number> = { feature: 7, tall: 5, standard: 5, wide: 7, full: 12 };

describe('project grid ↔ catalog reconciliation', () => {
  it('has presentation chrome for exactly the canonical showcase projects', () => {
    const catalogIds = getShowcaseProjects()
      .map((project) => project.id)
      .sort();
    const presentationIds = Object.keys(PROJECT_PRESENTATION).sort();

    expect(presentationIds).toEqual(catalogIds);
  });

  it('includes the application systems and the AI / ML group', () => {
    const ids = getShowcaseProjects().map((p) => p.id);
    expect(ids).toContain('gym-management'); // app project that was previously missing from the grid
    expect(ids).toEqual(expect.arrayContaining(['react-agent', 'advanced-rag', 'phi3-mini-sql']));
  });

  it('lays the unified grid out so every 12-column row is filled', () => {
    const variants = getShowcaseProjects().map((project) => SPAN[PROJECT_PRESENTATION[project.id].variant]);
    const total = variants.reduce((sum, span) => sum + span, 0);

    expect(total).toBe(48); // 8 tiles across four 12-column rows
    // consecutive pairs (in catalog order) each fill a row: 7+5, 5+7, 7+5, 5+7
    for (let i = 0; i < variants.length; i += 2) {
      expect(variants[i] + variants[i + 1]).toBe(12);
    }
  });
});
