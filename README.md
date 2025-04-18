# Yumu-Core

Yumu-Core is a basic boilerplate for creating a Discord bot using Discord.js v14, TypeScript, TSX,
and TSUP for development and build. It uses CommonJS and ES2021 settings.

## Prerequisites

Before you begin, you need to have a Discord authentication token in
[Discord Developers Panel](https://discord.com/developers/applications). Create a `.env` file in the
root of the project and add the following (or just rename the file `.env.example` to `.env` and put
your token):

```
DISCORD_TOKEN=your_token_here
```

## Installation

To install the dependencies, use the following command:

```bash
npm install
# or
yarn install
```

## Build

To build the project, use the following command:

```bash
npm run build
# or
yarn build
```

## Start

To start the bot, use the following command:

```bash
npm run start
# or
yarn start
```

## Development mode

To start the development mode, use the following command:

```bash
npm run dev
# or
yarn dev
```

This mode watches for changes in the `.ts` files and restarts the bot whenever a change is detected.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
