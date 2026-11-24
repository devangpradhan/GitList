# GitList

Git-backed repository bookmark manager and directory. Stores data in a local JSON file and commits updates directly to a GitHub repository through the GitHub REST API. Hostable on GitHub Pages.

## Problem statement

GitHub star lists only support flat collections without directories, cross-tagging, or personal review notes. GitList provides:
- Nested directories under top-level categories.
- Tag filters with multi-select search.
- Metadata retrieval from the GitHub REST API (stars, forks, primary language, license, avatar).
- One-click starred repository importer.
- Personal notes, testing status, and ratings.
- Direct repository commits without a database server.
- Automated deployment to GitHub Pages via GitHub Actions.

## Development

```bash
npm install
npm run dev
```

The application runs on `http://localhost:3000`.

## Deployment to GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. Open repository settings on GitHub.
3. Under Pages, set the build source to GitHub Actions.
4. The deployment workflow in `.github/workflows/deploy.yml` builds and deploys the static site.

## Direct commits

To push changes from the web interface to GitHub:
1. Open settings in the application.
2. Enter a GitHub personal access token with `repo` scope.
3. Set the target repository path (`owner/repo`) and branch (`main`).
4. Click Commit to push changes directly to `data/gitlist.json`.

## Structure

```
.
├── .github/workflows/deploy.yml
├── data/gitlist.json
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## License

MIT.
