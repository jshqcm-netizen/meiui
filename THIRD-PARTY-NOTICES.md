# Third-party and asset notices

Original application code is provided to the project owner without an assumed public open-source license. Public source availability does not grant an open-source license for original application code. The owner may choose a repository license separately. Third-party packages retain their respective licenses; exact versions are in package-lock.json, and installed packages contain their upstream license files.

## Runtime and build dependencies

- Next.js / React / TypeScript / Tailwind CSS: MIT — https://github.com/vercel/next.js/blob/canary/license.md ; https://github.com/facebook/react/blob/main/LICENSE ; https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt ; https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE
- Radix Primitives: MIT — https://github.com/radix-ui/primitives/blob/main/LICENSE . Dialog, ToggleGroup and Slot power the original wrapper components in this repo
- Lucide: ISC plus MIT notices for Feather-derived icons — https://lucide.dev/license
- Manrope font: SIL Open Font License 1.1 — https://github.com/googlefonts/manrope/blob/master/OFL.txt . Self-hosted via @fontsource-variable/manrope; no external font request
- unified, remark and rehype family: MIT — respective upstream package repositories and included LICENSE files
- gray-matter, YAML, Zod, clsx, tailwind-merge, class-variance-authority: MIT — respective upstream package repositories and included license files

## Component sources and researched libraries

- shadcn/ui: MIT — https://github.com/shadcn-ui/ui/blob/main/LICENSE.md . Iteration 2 includes CLI-installed Card, Command, Sheet, Empty and Separator source, reviewed and adapted to local utilities/tokens. The upstream license is retained in licenses/shadcn-ui-LICENSE.md
- Magic UI: MIT open-source core — https://github.com/magicuidesign/magicui/blob/main/LICENSE.md . CLI-installed MagicCard is used for a restrained app-card highlight, with a reduced-motion wrapper and adapted theme initialization; commercial Pro templates are separate
- Motion: MIT open-source core — https://github.com/motiondivision/motion/blob/main/LICENSE.md . Motion powers the MagicCard interaction; Motion+ commercial assets are separate

## Artwork and reference material

`public/media/cobalt-glass.webp` was generated specifically for this project using OpenAI image generation and optimized to WebP. No Dribbble artwork, reference screenshots, demo photography, avatars, brand marks, or commercial template assets are shipped in this project. Source links for the four visually inspected references and the original design rationale are in docs/DESIGN.md.

The `licenses/` directory preserves primary installed runtime license notices. Run npm ci to retrieve every exact dependency and its full license text. Do not remove upstream notices when redistributing dependencies or fonts. License summaries are informational, not a replacement for the actual texts.

The workflow sample MP4, PNG poster and VTT in `public/media/` were generated locally for this project as a five-second silent concept animation. They are demonstrative artwork, not footage of a user or a recording of an operational system.
