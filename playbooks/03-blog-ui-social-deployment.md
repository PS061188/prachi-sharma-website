# Blog UI, Social, and Deployment System

## Goal

Make the website and articles pleasant to read, easy to navigate, easy to share, and reliably deployable.

## Article UX Rules

- Use a sticky right-side `On this page` table of contents on desktop.
- Highlight the active section while scrolling.
- Keep mobile behavior simpler and non-crowded.
- Maintain a clean reading column with generous spacing.

## Typography Rules

- Clear distinction between article title, section headings, supporting taglines, and body text
- Paragraph and list styling should feel unified
- Lists should not suddenly become darker or differently styled than body text
- Tagline lines under headings should wrap naturally, not break too early

## Diagram / SVG Rules

- All diagram text must stay inside shapes
- If needed, resize cards/columns rather than forcing text to overflow
- Tables in SVGs must avoid column overlap
- Social cards and diagrams should be crop-safe

## Social Metadata Rules

- Every public page should have:
  - `og:title`
  - `og:description`
  - `og:image`
  - `og:url`
  - `og:site_name`
  - matching Twitter tags where appropriate
- `og:image` should use a public absolute URL, not a relative path
- Important pages should have dedicated social card images rather than reusing one generic portrait image

## LinkedIn Preview Rules

- If preview cards do not show, confirm the site is publicly crawlable
- Use LinkedIn Post Inspector after metadata changes
- Expect LinkedIn caching to lag behind live site changes
- Prefer fresh image filenames if cache-busting is required

## Deployment Rules

- Deploy from the current project directory
- Keep the clean production alias pointed at the latest correct deployment
- Confirm the live URL after deploy
- If external sharing is part of the task, verify metadata and crawlability

## Vercel Workflow Rules

- Keep the `prachi-sharma` Vercel identity clean
- Prefer a clean public URL over auto-generated project URLs
- If previews fail, check for authentication/SSO protection first

## Editing Workflow

- Browser editor is useful for local visual experimentation only
- Permanent changes belong in source files
- After significant blog or preview changes, redeploy and verify

## Completion Checklist

- Article TOC works
- Heading hierarchy is visually correct
- Diagrams do not overflow
- Social preview metadata is correct
- Page is publicly crawlable
- Live deployment reflects the intended version
