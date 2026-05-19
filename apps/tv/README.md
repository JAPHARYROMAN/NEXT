# @next/tv

The 10-foot experience. Targets tvOS (React Native shell), Android TV / Google TV, Samsung Tizen, LG WebOS.

## Architecture
- **Framework**: React + Vite for the web TV surface (Tizen, WebOS, browser-on-TV). A separate React Native shell wraps it for tvOS / Android TV.
- **Focus**: spatial navigation via [`@noriginmedia/norigin-spatial-navigation`](https://github.com/NoriginMedia/Norigin-Spatial-Navigation). LRUD (left-right-up-down) is the input model.
- **Playback**: Shaka Player for browser; ExoPlayer (Android) / AVPlayer (tvOS) in native shells.
- **Performance**: TV silicon is slow; targets 60fps animations and < 200 MB resident JS. Aggressive code-splitting per product surface.

## Run

```bash
pnpm --filter @next/tv dev
```
