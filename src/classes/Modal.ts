import { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import YumuCore from './Core';

export default class Modal {
    name: string;
    data: ModalBuilder;
    run: (Client: YumuCore, interaction: ModalSubmitInteraction) => void | any;
}
