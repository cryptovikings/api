# CryptoVikings API

API for [CryptoVikings](https://cryptovikings.io); the back-end for an on-demand, truly-random generative NFT collection.

The API is responsible for producing and storing Viking Metadata and Images based off of the on-chain Viking representation as part of the total minting procedure.

The API is also capable of fully reconstructing its database and image set by referencing the live Contract's Viking collection as a source of truth; as well as correcting any flaws in the Contract's collection should they occur.


## Prerequisites
- **GraphicsMagick**
    - **Ubuntu**:
        - `sudo apt-get install graphicsmagick`
        - `sudo apt-get install libpng libpng-devel`
    - **Windows**:
        - [Installer](http://www.graphicsmagick.org/INSTALL-windows.html#retrieve-install-package)

- **Node/NPM**
    - **Ubuntu (with NVM)**:
        - `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash`
        - `nvm install node`
    - **Windows**:
        - [Installer](https://nodejs.org/en/download/)

- **MongoDB**
    - **Ubuntu**:
        - [Tutorial](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
    - **Windows**:
        - [Installer](https://www.mongodb.com/try/download/community)


## Setup
- clone
- `npm install`
- `cp .env.example .env`
- fill out `.env`...


### .env

| Variable                  | Value (/Examples)         | Purpose                                                                                             |
| ------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| DEV                       | `true` or `false`         | Enables or disables the `/test` route collection                                                    |
| SERVER_PORT               | `{number}`                | Port to run the API on                                                                              |
| API_URL                   | `http://localhost:{port}` | Full URL of the API as executed; used for Metadata                                                  |
| FRONT_END_URL             | `{url}`                   | Full URL of the website; used for Metadata                                                          |
| FRONT_END_VIKING_ENDPOINT | `/vikings`                | URI for individual Viking on website; used for Metadata                                             |
| DATABASE_NAME             | `{string}`                | Name of database to use for storing Viking Metadata                                                 |
| IMAGE_VIKING_INPUT_ROOT   | `res/viking`              | Path to Viking assets directory (from project root)                                                 |
| IMAGE_TEXTURE_INPUT_ROOT  | `res/texture`             | Path to Texture assets directory (from project root)                                                |
| IMAGE_VIKING_OUTPUT       | `{path/to/output}`        | Path to Viking image output directory                                                               |
| IMAGE_TEXTURE_OUTPUT      | `{path/to/output}`        | Path to Texture image output directory                                                              |
| IMAGE_VIKING_ENDPOINT     | `{/path}` (`/image`)      | Route to use for retrieving Viking images *(`{API_URL}/{IMAGE_VIKING_ENDPOINT}`)*                   |
| IMAGE_TEXTUE_ENDPOINT     | `{/path}` (`/texture`)    | Route to use for retrieving Viking images *(`{API_URL}/{IMAGE_TEXTURE_ENDPOINT}`)*                  |
| ETH_CONTRACT_ADDRESS      | `{address}`               | Contract to point to containing Viking data collection                                              |
| ETH_PROVIDER_URL          | `{url}`                   | RPC Provider - [Information here](https://docs.matic.network/docs/develop/network-details/network/) |
| ETH_WALLET_SECRET         | *none (empty string)*     | *Not applicable for anyone but the Contract owner*                                                  |
| ETH_RECOVER               | `true` or `false`         | Whether or not to reconstruct local database + images from Contract Viking data                     |
| ETH_RECOVER_NAMES         | `true` or `false`         | Whether or not to (separately) synchronize local names with Contract Viking names                   |
| ETH_LISTEN                | `true` or `false`         | Whether or not to listen for Contract Events                                                        |
| ETH_LISTEN_INTERVAL       | `{number}`                | Polling interval for Contract Event listening                                                       |


## Scripts
- `npm run {script-name}`

| Script | Purpose                    |
| ------ | -------------------------- |
| lint   | Execute `eslint` on `src/` |
| dev    | Execute the API            |
| dist   | Compile the API source     |
