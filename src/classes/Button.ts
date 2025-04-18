import { ButtonInteraction } from 'discord.js';
import YumuCore from './Core';

export default class Button {
    name: string;
    id?: (baseId: string) => string;
    run: (Client: YumuCore, interaction: ButtonInteraction) => void | any;
}
