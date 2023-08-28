<!-- PROJECT LOGO -->
<p align="center">
  <a href="https://dyte.io">
    <img src="https://assets.dyte.io/logo-outlined.png" alt="Logo" width="120" />
  </a>

  <h2 align="center">Device Emulator by Dyte</h3>

  <p align="center">
    Dyte's homegrown solution to mimic media devices in browser
    <br />
    <a href="https://docs.dyte.io"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://device-emulator.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/dyte-io/device-emulator/issues">Report Bug</a>
    ·
    <a href="https://github.com/dyte-io/device-emulator/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Examples](#examples)
- [Built With](#built-with)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)
- [About](#about)

<!-- ABOUT THE PROJECT -->

## About The Project

For a product, integration tests are one of the crucial part that improves quality & stability. For a WebRTC based solution like Dyte, having integration tests that can test multi-user call with Audio/Video on is necessary.

For an end user, sharing a camera & mic is easy. For this, browsers expose APIs such as enumerateDevices & getUserMedia on MediaDevices interface, on which user interfaces can be built easily.

Access to camera & mic prompts the users to allow permissions to do so. This works great as long as an end-user is using the product and actively allowing permissions and selecting devices, However this makes it impossible to write integration tests because for integration tests there is no active user and you need to somehow allow permissions programmatically which at the moment of writing this README is not reliably supported in modern tools like Playwright.

Even if we can somehow allow permissions, The next set of questions would be: What would the video & audio feed look like? Can we customize the feed? Can we use the feed to detect delays between a video feed producer and consumer? How do we test multiple devices? How do we test media ejection on the fly? How do we test addition of a new device?


Dyte's Device Emulator is a solution that answers all these questions and provides a easier way to mimic, add, remove devices & their feed. 

## Examples

Find the guides and examples here [https://docs.dyte.io/community-packages/device-emulator](https://docs.dyte.io/community-packages/device-emulator)

## Built With

- Canvas
- MediaDevices interface
- Typescript

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/dyte-io/device-emulator/issues) for a list of proposed features (and known issues).

Few upcoming features are:
1. Use any video file as a feed instead of Dyte's default video feed.
2. Audio file support
3. Browser-like constraints
4. Custom device names

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**. Sincere thanks to all our contributors. Thank you, [contributors](https://github.com/dyte-io/device-emulator/graphs/contributors)!

You are requested to follow the contribution guidelines specified in [CONTRIBUTING.md](./CONTRIBUTING.md) and code of conduct at [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) while contributing to the project :smile:.

## Support
Contributions, issues, and feature requests are welcome!
Give a ⭐️ if you like this project!

<!-- LICENSE -->

## License

Distributed under the Apache License, Version 2.0. See [`LICENSE`](./LICENSE) for more information.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

## About

`device-emulator` is created & maintained by dyte, Inc. You can find us on Twitter - [@dyte_io](https://twitter.com/dyte_io) or write to us at `dev [at] dyte.io`.

The names and logos for Dyte are trademarks of dyte, Inc.

We love open source software! See [our other projects](https://github.com/dyte-io) and [our products](https://dyte.io).
