import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import YumuCore from './Core';

export default class Command {
    name: string;
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, any>;
    type: 'global' | 'guild';
    run: (Client: YumuCore, interaction: ChatInputCommandInteraction) => void | any;
    autocomplete?: (Client: YumuCore, interaction: AutocompleteInteraction) => void | any;
}
