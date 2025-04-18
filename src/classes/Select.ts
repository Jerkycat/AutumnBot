import { StringSelectMenuInteraction } from 'discord.js';
import YumuCore from './Core';

export default class Select {
    name: string;
    id?: (baseId: string) => string;
    run: (Client: YumuCore, interaction: StringSelectMenuInteraction) => void | any;
}
