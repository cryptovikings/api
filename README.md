# API

NB: built and tested within a Unix (Ubuntu) environment


## Requirements

- **GraphicsMagick**
    - **Ubuntu**: `sudo apt-get install graphicsmagick`
    - **Windows**: [Installer](http://www.graphicsmagick.org/INSTALL-windows.html#retrieve-install-package)


## Setup

- clone
- `npm install`
- `touch ./src/.env`

- Fill out `src/.env` based on `src/.env.example`:
    - `SERVER_PORT` : the port to run the API on
        - Example: `"8080"`
    - `API_URL` : the URL for the API
        - Example: `"http://localhost:8080"`
    - `FRONT_END_URL` : the URL for the front end
        - Example: `"http://localhost:3000"`
    - `DATABASE_NAME` : the database name to use
        - Example: `"crypto_api"`
    - `IMAGE_OUTPUT_ROOT` : the root output folder for images
        - Example: `"out/"`
    - `IMAGE_INPUT_ROOT` : the root input folder for assets
        - Example: `"res/"`
    - `ETH_CONTRACT_ADDRESS` : the address of the Contract
    - `ETH_PROVIDER_URL` : the JSON RPC Provider URL
        - Example (public provider): `"https://matic-mumbai.chainstacklabs.com"`
    - `ETH_WALLET_SECRET` : the private key of the Wallet to sign transactions with
    - `ETH_RECOVER` : `true` or `false` - whether or not to execute Contract <-> API Recovery Routines on launch
    - `ETH_LISTEN` : `true` or `false` - whether or not to run Contract Event Listeners
    - `ETH_LISTEN_INTERVAL` : millisecond interval setting the polling rate for Ethereum Contract Events
        - Example: `"20000"`


## Scripts

- `npm run lint` - execute `eslint` in fix mode
- `npm run dev` - execute the API
    - set vscode to `autoattach` or `autoattack with flag` for debugging
- `npm run dist` - build the API to deploy
