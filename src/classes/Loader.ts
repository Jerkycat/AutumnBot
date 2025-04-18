import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import YumuCore from './Core';

export default class Loader {
    Client: YumuCore;
    rest = new REST();

    constructor(Client: YumuCore) {
        this.Client = Client;
        this.rest.setToken(Client.token);
        const globalCommands = Client.commands.clone().filter(({ type }) => type === 'global');
        const guildCommands = Client.commands.clone().filter(({ type }) => type === 'guild');
        const guilds = Client.guilds.cache;

        if (!globalCommands.size) Client.logger.warn('Not found any global commands.');
        else
            this.rest
                .put(Routes.applicationCommands(Client.user.id), {
                    body: globalCommands.map(({ data }) => (data as SlashCommandBuilder).toJSON())
                })
                .then(() => {
                    Client.logger.log(`Loaded ${globalCommands.size} global commands`);
                })
                .catch(Client.logger.error);

        if (!guilds.size) Client.logger.warn('Not found any server to load commands.');
        else if (!guildCommands.size) Client.logger.warn('Not found any guild commands.');
        else
            this.rest.put(Routes.applicationGuildCommands(Client.user.id, '717437531490353213'), {
                body: guildCommands.map(({ data }) => (data as SlashCommandBuilder).toJSON())
            });
    }
}
