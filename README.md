# IOTA Nectar GUI Wallet

IOTA Nectar wallet GUI, a lightweight wallet for the test Nectar network.

**Disclaimer** - This wallet is intended to demonstrate how to communicate with the Nectar network, your seed is **NOT** stored securely.

![Nectar Wallet](images/nectar-wallet.png)

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

By default the application is configured to access a `GoShimmer` nodes API at `http://nodes.nectar.iota.cafe`. To make it communicate with another node you can change the endpoint in the settings page.

![Nectar Wallet](images/nectar-settings.png)