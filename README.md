# IOTA Pollen GUI Wallet

IOTA Pollen wallet GUI, a lightweight wallet for the test Pollen network.

<span style="color:#bb0000">The wallet is configured by default to connect to a node running on your local machine. You must either run a local node or change the settings to connect to a remote node [See settings](#settings).</span>

**Disclaimer** - This wallet is intended to demonstrate how to communicate with the Pollen network, your seed is **NOT** stored securely.

![Pollen Wallet](images/pollen-wallet.png)

## Building

The code is a React app wrapped in the electron runtime.

```shell
npm install
npm run build
```

You can execute the local build in a development electron shell by running.

```shell
npm run start-electron
```

If you want to create the final packages for your platform you can package it using the details below. The `/out` folder will contain the executable for your platform when packaging completes.

### Windows

```shell
npm run package-win
```

### Mac

```shell
npm run package-mac
```

### Linux

```shell
npm run package-linux
```

## Settings

By default the application is configured to access a `GoShimmer` nodes API running on your local machine at `http://127.0.0.1:8080`. To make it communicate with another node you can change the endpoint in the settings page.

![Pollen Wallet](images/pollen-settings.png)