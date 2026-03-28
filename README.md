# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

Recommended Node.js version: `24`

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Releases

This project uses `semantic-release` to automate versioning and changelog generation from commits pushed to `main`.

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) so releases are calculated correctly:

```bash
feat: add CV export button
fix: handle empty job description
```

Only some commit types create a new version by default:

```bash
feat: creates a minor release
fix: creates a patch release
feat!: creates a major release
chore: creates a patch release in this project
```

Commits like `docs:` and `style:` do not create a release unless you configure custom release rules.

To validate the setup locally without publishing a release:

```bash
npm run release:dry
```
