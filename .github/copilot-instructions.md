# Local Copilot Instructions — Technical Standards

## MDX & Docusaurus Conventions
- Keep documentation in `docs/` properly indexed in `CONTEXT-MAP.md`.
- Wrap object/array literals in backticks or code blocks to ensure clean MDX parsing.
- Keep diagrams standard markdown or wrapped in `<Mermaid withCard chart={...} />`.

## Runtime Boundaries
- Source code changes must strictly occur inside `app-core/`.
- Maintain test coverage by verifying with `npm test`.
