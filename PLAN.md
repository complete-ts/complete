# Starlight Transition Plan

## Recommended Transition

Migrate directly to Astro 7.2.8 and Starlight 0.41.9, using starlight-typedoc
0.23.1, Pagefind, and Starlight's native sidebar and theme components. Keep
`prepare.mts` as the one small monorepo adapter for colocated package
documentation; replacing it with a custom Astro loader would add complexity
without removing the need for TypeDoc's generated content directory. These are
the newest mutually compatible releases allowed by the repository's seven-day
minimum package release age.

An isolated migration spike confirmed that the current `router: "module"` model
works with Starlight and preserves all 59 TypeDoc page shapes. Package landing
pages need `entryFileName: "index"`, and mixed-case TypeDoc URLs become
lowercase.

## Implementation Plan

1. Capture the current route and anchor inventory before changing dependencies.
   Preserve the 124 documentation routes, the homepage, and the 404 page.
2. Replace Docusaurus, React, Heroicons, and Prism with Astro, Starlight,
   starlight-typedoc, typedoc-plugin-frontmatter, and starlight-links-validator.
3. Change `prepare.mts` to populate `src/content/docs/` and adapt portable
   Markdown headings to Starlight frontmatter while staging content.
4. Replace the React homepage with a native Starlight splash page while keeping
   `/` and `/overview/` as separate routes.
5. Configure separate starlight-typedoc instances for `complete-common` and
   `complete-node`, preserving the module router, entry points, readmes,
   validation, table formats, and package-root routes.
6. Preserve customized TypeDoc display titles through the supported
   typedoc-plugin-frontmatter extension point.
7. Add redirects for the obsolete Docusaurus `/blog/` and `/search/` routes.
8. Translate the existing top-level sidebar ordering and use generated groups
   for TypeDoc, ESLint rules, and Markdownlint rules.
9. Port the logo, favicon, `.nojekyll`, colors, social links, syntax themes, and
   keyboard shortcuts to native Astro and Starlight facilities.
10. Replace Algolia with Starlight's default Pagefind search and use
    starlight-links-validator for strict route and fragment validation.
11. Continue deploying to `complete-ts/complete-ts.github.io`, but publish
    Astro's `dist/` output and remove Algolia and Pages-readiness polling.
12. Validate a clean-checkout build, routes, fragments, search, responsive
    navigation, themes, keyboard shortcuts, sitemap, and GitHub Pages assets
    before merging.

## Route Compatibility

The Docusaurus-only `/blog/` and `/search/` routes redirect to `/`. Legacy
mixed-case TypeDoc routes are not retained.

## Risk and Effort

| Risk                              | Level  | Mitigation                                                     |
| --------------------------------- | ------ | -------------------------------------------------------------- |
| Mixed-case TypeDoc URLs           | Low    | Adopt Starlight's lowercase canonical routes                   |
| Raw TypeDoc page titles           | High   | Customize frontmatter using TypeDoc reflection data            |
| Duplicate Markdown H1s            | Medium | Normalize staged Markdown and TypeDoc package readmes          |
| Cross-repository Pages deployment | Medium | Retain the existing SSH branch-publishing mechanism            |
| Third-party Starlight plugins     | Medium | Pin versions in the root catalog and keep integrations small   |
| Theme and homepage differences    | Low    | Use native Starlight components and targeted visual comparison |

Estimated effort is three to four engineering days: roughly one day for the
Astro and content shell, one to two days for TypeDoc and route compatibility,
and one day for styling, deployment, and browser-level review.
