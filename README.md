# reascript-discord-bot

A bot that can receive Reastream VST output (UDP packets) and stream it into a Discord voice channel. 

## Configuration (bot_config.json)

 - ### `token: string`
    - Discord bot token (see https://discord.com/developers)
 - ### `channel: string`
    - the voice channel to join
 - ### `receiving_address: string`
    - address from which reastream UDP packets are received
    - default: `127.0.0.1`
- ### `port: number`
    - port from which reastream UDP packets are received
        - default: `58710`

## Configuration

After cloning the repository run `npm ci`.

## Key Commands

| Command          | Description                            |
| ---------------- | -------------------------------------- |
| `npm run start`  | Run the bot.                           |
| `npm run build`  | Build the typescript code.             |
| `npm run test`   | Run all tests.                         |
