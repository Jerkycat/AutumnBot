import Command from '@class/Command';
import YumuCore from '@core';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default class BotCommand implements Command {
    type: 'global' = 'global';
    name = 'bot';
    run = (Client: YumuCore, interaction: ChatInputCommandInteraction) => {
        const embed = new EmbedBuilder({
            title: 'BOT | ' + Client.user?.username || 'Yumu',
            footer: { text: 'Developed by @vitu2002' },
            description: `:ping_pong: | **Pong!** \`(${Client.ws.ping}ms)\``
        });
        return interaction.reply({ embeds: [embed] });
    };
    data = new SlashCommandBuilder().setName(this.name).setDescription('Pong!');
}
