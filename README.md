# MPC Project Helper

Browser extension for working with MakePlayingCards and PrinterStudio projects.
Project JSON formats and the `mpc_api` integration are shared by the Chrome and
Firefox builds.

## Firefox build

Use Node.js 20 or newer. Install dependencies with `npm install` (or the
repository's `yarn.lock` with Yarn), then run:

```sh
npm run build:firefox
npm run lint:firefox
npm run package:firefox
```

The install hook patches the installed `mpc_api` source and bundles for browser
compatibility. It binds `window.fetch` before passing it to `fetch-retry`, and
runs XPath queries on the parsed response document that owns their nodes. This
keeps uploads working in Firefox after dependency reinstalls and rebuilds, and
uses the same compatible code in Chrome.

The extension files are in `dist-firefox/`. `package:firefox` creates an
unsigned ZIP in `web-ext-artifacts/` using Mozilla's `web-ext` tool. The ZIP
contains the extension files at its root and is suitable for AMO submission.
The Firefox manifest keeps the four existing site permissions, uses an event
page, and declares that the extension does not collect data for its developer.
The regular `npm run build` still creates the Chrome build in `dist/`.

## Temporary installation and testing

In Firefox, open `about:debugging`, choose **This Firefox**, then **Load
Temporary Add-on** and select `dist-firefox/manifest.json` or the unsigned
ZIP. Temporary add-ons are removed when Firefox restarts. Test the toolbar
action and project import/export on each supported site; importing older v1,
v2, and v3 JSON projects should still work. Do not submit a printing order
while testing.

## Signing and permanent installation

For a permanent Firefox installation, submit the unsigned ZIP to
[addons.mozilla.org](https://addons.mozilla.org/developers/) for listed or
unlisted signing. The manifest contains a stable Gecko add-on ID. With AMO API
credentials, an unlisted signed XPI can also be requested with:

```sh
WEB_EXT_API_KEY=... WEB_EXT_API_SECRET=... npx --yes web-ext@10.8.0 sign \
  --source-dir dist-firefox --channel unlisted
```

Keep credentials outside the repository. Install the signed XPI in Firefox
via the add-ons manager; an unsigned ZIP cannot be installed permanently in
standard Firefox. AMO may require the human-readable source and these build
instructions for review of the bundled JavaScript.

## License and attribution

The project declares ISC in `package.json`; the original author is Alexander
Wilde, as recorded in Git history. See [LICENSE](LICENSE). The existing
`mpc_api` dependency by North101 declares MIT in its package metadata and is
used unchanged. Other bundled dependencies retain their own licenses; see
their package metadata and license files in `node_modules`.
