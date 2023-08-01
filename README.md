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
    <a href="https://app.dyte.io">View Demo</a>
    ·
    <a href="https://github.com/dyte-in/device-emulator/issues">Report Bug</a>
    ·
    <a href="https://github.com/dyte-in/device-emulator/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [About the Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Version History](#version-history)
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

### Built With

- Canvas
- MediaDevices interface
- Typescript

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, please follow these simple steps.

### Prerequisites

- Node.js
- NPM

### Installation

1. Clone the repo

```sh
git clone https://github.com/dyte-in/device-emulator.git
```

2. Install NPM packages

```sh
npm install
```

<!-- USAGE EXAMPLES -->

## Usage

To test quickly, Run Device Emulator with a Dyte meeting

```sh
npm run dev
```

This would open a tab with localhost:3000 in it.

http://localhost:3000/?authToken=PUT_PARTICIPANT_AUTH_TOKEN_HERE

Replace PUT_PARTICIPANT_AUTH_TOKEN_HERE with actual participant token.

In case you are new to Dyte, Please make sure you've read the [Getting Started with Dyte](https://docs.dyte.io/getting-started) topic and completed the following steps:
1. [Create a Dyte Developer Account](https://dev.dyte.io/)
2. Create Presets. Dyte also includes the following pre-configured presets for group call and webinar. You can simply use the default preset such as `group_call_host` if you don't wish to create one.
3. Create a Dyte Meeting
4. Add Participant to the meeting

Adding participant to meeting would give you the desired auth token.

Once you are in the Dyte meeting, Go to Settings -> Video -> Select the emulated device. Turn the video on, if not on already. That's it.

In case you want to integrate the device-emulator solution in your product without a Dyte meeting, Add the below script tags in your code:

```html
    <script>
        window.addEventListener('dyte.deviceEmulatorLoaded', () => {
            navigator.mediaDevices.addEmulatedDevice('videoinput');
        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@dytesdk/device-emulator/dist/index.iife.js"></script>
```

This would add a fake videoinput emulated device.

## Examples

### Wait for the device emulator to load.
```js
window.addEventListener('dyte.deviceEmulatorLoaded', () => {
    console.log('Device emulator loaded.')
});
```

### Add a fake video input device
```js
navigator.mediaDevices.addEmulatedDevice('videoinput');
```

### Add a fake audio input device
```js
navigator.mediaDevices.addEmulatedDevice('audioinput');
```

### Remove a fake input device
Get the emulated device id using `enumerateDevices` api.

```js
navigator.mediaDevices.enumerateDevices()
```

Find the device that you want to remove, keep the device id handy.

```js
navigator.mediaDevices.removeEmulatedDevice('PUT_EMULATED_DEVICE_ID_HERE');
```

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/dyte-in/device-emulator/issues) for a list of proposed features (and known issues).

Few upcoming features are:
1. Use any video file as a feed instead of Dyte's default video feed.
2. Audio file support
3. Browser-like constraints
4. Custom device names

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**. Sincere thanks to all our contributors. Thank you, [contributors](https://github.com/dyte-in/device-emulator/graphs/contributors)!

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

`device-emulator` is created & maintained by Dyte, Inc. You can find us on Twitter - [@dyte_io](https://twitter.com/dyte_io) or write to us at `dev [at] dyte.io`.

The names and logos for Dyte are trademarks of Dyte, Inc.

We love open source software! See [our other projects](https://github.com/dyte-in) and [our products](https://dyte.io).
