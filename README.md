# PAWSSION

A cinematic, responsive cat-companion experience built with React, Vite, React Three Fiber, Drei, Framer Motion, and Tailwind CSS.

## Project structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── .github
│   └── workflows
│       └── deploy.yml
└── src
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    └── components
        └── CatScene.tsx
```

The supplied `Video-*.mp4` files are kept in the project root as design references; they are not shipped or embedded in the site.

## Run locally

Use Node.js 20.19 or newer (or 22.12 or newer).

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Publish to GitHub Pages

Create a **public** GitHub repository named `pawssion` without adding a README,
license, or `.gitignore`, then run these commands from the project folder:

```bash
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-github-username>/pawssion.git
git push -u origin main
```

Set the repository's **Settings → Pages → Build and deployment** source to
**GitHub Actions** once. After that, the included workflow automatically
installs dependencies, runs `npm run build`, and deploys `dist` when you push
to the repository's default branch. It can also be started manually from the
**Actions** tab.

After the first successful deployment, find the live URL under **Settings →
Pages**. For a repository named `pawssion`, it will be
`https://<your-github-username>.github.io/pawssion/`. If you name the repository
`<your-github-username>.github.io`, the site URL is
`https://<your-github-username>.github.io/`. GitHub Pages is free for public
repositories; the included `github.io` address does not require buying a domain.

## Companion model

The companion is generated from Three.js geometry in `src/components/CatScene.tsx`, so the 3D hero works without a paid or remotely hosted model. To substitute a custom, properly licensed GLB, put it under `public/models/`, load it with Drei's `useGLTF`, and replace the `Companion` component. Map the model's fur, eye, and collar materials to the palette props to retain the live color picker.

The club form currently validates an email in the browser and shows an on-page confirmation. Connect it to an email service or API before collecting real subscriptions. The optional sound toggle creates a quiet synthesized purr locally.
