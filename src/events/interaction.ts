import Event from '@class/Event';
import YumuCore from '@core';
import { Interaction } from 'discord.js';

export default class InteractionEvent implements Event {
    name = 'interactionCreate';
    run = (Client: YumuCore, interaction: Interaction) => {
        if (interaction.isButton()) {
            const name = interaction.customId.split('---')[0];
            const button = Client.buttons.get(name);
            if (!button || !button.run || !button.name) return;
            return button.run(Client, interaction);
        } else if (interaction.isChatInputCommand()) {
            const name = interaction.commandName;
            const command = Client.commands.get(name);
            if (!command || !command.run || !command.data.name) return;
            return command.run(Client, interaction);
        } else if (interaction.isModalSubmit()) {
            const name = interaction.customId.split('---')[0];
            const modal = Client.modals.get(name);
            if (!modal || !modal.run || !modal.name) return;
            return modal.run(Client, interaction);
        } else if (interaction.isStringSelectMenu()) {
            const name = interaction.customId.split('---')[0];
            const select = Client.selects.get(name);
            if (!select || !select.run || !select.name) return;
            return select.run(Client, interaction);
        } else if (interaction.isAutocomplete()) {
            const name = interaction.commandName;
            const command = Client.commands.get(name);
            if (!command || !command.run || !command.data?.name || !command.autocomplete) return;
            return command.autocomplete(Client, interaction);
        }
    };
}
