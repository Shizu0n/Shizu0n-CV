import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getShowcaseProjects } from '../../components/chatProjectCatalog';
import { PROJECT_PRESENTATION } from '../projectsPresentation';

const PUBLIC_DIR = resolve(__dirname, '../../../public');

describe('project section ↔ catalog reconciliation', () => {
  it('has presentation for exactly the canonical showcase projects', () => {
    const catalogIds = getShowcaseProjects()
      .map((project) => project.id)
      .sort();
    const presentationIds = Object.keys(PROJECT_PRESENTATION).sort();

    expect(presentationIds).toEqual(catalogIds);
  });

  it('features the agent, the fine-tune, CampusCycle and the RAG, in that order', () => {
    const featured = getShowcaseProjects()
      .filter((project) => PROJECT_PRESENTATION[project.id].tier === 'featured')
      .map((project) => project.id);

    expect(featured).toEqual(['react-agent', 'phi3-mini-sql', 'campus-cycle', 'advanced-rag']);
  });

  it('gives every featured project a demonstration and every smaller one a diagram', () => {
    for (const [id, presentation] of Object.entries(PROJECT_PRESENTATION)) {
      const hasDemonstration = Boolean(presentation.media || presentation.diagram);
      expect(hasDemonstration, id).toBe(true);
      if (presentation.tier === 'more') {
        expect(presentation.diagram, id).toBeDefined();
        expect(presentation.media, id).toBeUndefined();
      }
    }
  });

  it('gives every featured card a headline and its case a scroll stage', () => {
    for (const [id, presentation] of Object.entries(PROJECT_PRESENTATION)) {
      if (presentation.tier !== 'featured') continue;
      expect(presentation.headline, id).toBeDefined();
      expect(presentation.stage, id).toBeDefined();
      expect(presentation.glyph, id).toBeDefined();
    }
  });

  it('only references media files that exist in public/', () => {
    for (const { media } of Object.values(PROJECT_PRESENTATION)) {
      if (!media) continue;
      expect(existsSync(resolve(PUBLIC_DIR, `.${media.poster}`))).toBe(true);
      if (media.recording) {
        expect(existsSync(resolve(PUBLIC_DIR, `.${media.recording.mp4}`))).toBe(true);
        expect(existsSync(resolve(PUBLIC_DIR, `.${media.recording.webm}`))).toBe(true);
      }
      if (media.secondary) {
        expect(existsSync(resolve(PUBLIC_DIR, `.${media.secondary.src}`))).toBe(true);
      }
    }
  });
});
