# WirePad v2 - PFWirepad

Version2 (alpha) of the WirePad tool, initially made as part of the [@projectfunction](https://github.com/projectfunction) suite of learning tools. This wireframe kit has been rewritten to be used as a single-file library.

Visit the [website](https://projectfunction.io/how-we-teach) to learn more about how we teach.

Once released, this library will be adapted into the platform. **This repo may be out of sync with final release.** Reach out if you wish to contribute. 

## Todo
- [ ] Add clipboard actions
- [x] Add keyboard combination handler
- [x] Add shortcuts
- [x] Add ability to draw custom elements
- [ ] Add way to style painted components
- [x] Add painted component preferences
- [x] Handle rendering for retina
- [x] Turn InteractionProvider into eventTarget for easy event handling
- [ ] Add canvas lifecycle stages and events
- [ ] Fix broken tests


## Features

#### Customizable
Using the paintHandler library, you can add custom drawn elements to the canvas. _More info coming soon!_


#### Shortcuts

| Action                                |        Combination        | Status |
| :------------------------------------ | :-----------------------: | :----: |
| Get item behind                       |       `alt` + click       |   y    |
| Get item at the front                 |           click           |   y    |
| copy                                  |       `meta` + `c`        |   n    |
| cut                                   |       `meta` + `x`        |   n    |
| paste                                 |       `meta` + `v`        |   n    |
| Delete item                           |   `del` or `backspace`    |   y    |
| Bring to front                        |  `meta` + `shift` + `up`  |   y    |
| Send to back                          | `meta` + `shift` + `down` |   y    |
| Bring forward                         |       `meta` + `up`       |   y    |
| Send backward                         |      `meta` + `down`      |   y    |
| Refresh                               |          `space`          |   y    |
| Move                                  | `←` or `↑` or `→` or `↓`  |   y    |
| Move by 10                            | _same as above_ + `shift` |   y    |
| Align to item under pointer on X axis |    `alt` + `x` + point    |   y    |
| Align to item under pointer on Y axis |    `alt` + `y` + point    |   y    |

<br>

**Note:** Where `meta` key is used, press `cmd` (on Mac) or `ctrl` (on Windows) 

## Getting started

To get started with this project, ensure you have NPM and NodeJS installed (This project was initially developed on v14.16).

- Pull down the repo
- Run `npm install` to install the NPM packages
- Run `npm run build` to build to scripts
- Open the _index.html_ file in your browser