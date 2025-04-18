import YumuCore from '@core';
import fs from 'node:fs';
import path from 'node:path';
import Logger from './Logger';

export default class Handler {
    private readonly logger = new Logger('Handler');
    private readonly is_dev = __filename.endsWith('.ts');
    private readonly exec_path = this.is_dev ? '..' : './';
    private readonly events = path.join(__dirname, this.exec_path, 'events');
    private readonly buttons = path.join(__dirname, this.exec_path, 'buttons');
    private readonly commands = path.join(__dirname, this.exec_path, 'commands');
    private readonly selects = path.join(__dirname, this.exec_path, 'selects');
    private readonly modals = path.join(__dirname, this.exec_path, 'modals');

    constructor(Client: YumuCore) {
        if (fs.existsSync(this.events)) {
            const events = fs.readdirSync(this.events);
            if (!events.length) this.logger.warn('No events to load');
            else this.logger.info(`Found ${events.length} events`);
            events.map(async dir =>
                this.load(Client, dir, path.join(__dirname, this.exec_path, 'events'), 'Events')
            );
        } else this.logger.info('Folder dir not found', 'Events');
        if (fs.existsSync(this.modals)) {
            const modals = fs.readdirSync(this.modals);
            if (!modals.length) this.logger.warn('No modals to load');
            else this.logger.info(`Found ${modals.length} modals`);
            modals.map(async dir =>
                this.load(Client, dir, path.join(__dirname, this.exec_path, 'modals'), 'Modals')
            );
        } else this.logger.info('Folder dir not found', 'Modals');
        if (fs.existsSync(this.buttons)) {
            const buttons = fs.readdirSync(this.buttons);
            if (!buttons.length) this.logger.warn('No buttons to load');
            else this.logger.info(`Found ${buttons.length} buttons`);
            buttons.map(async dir =>
                this.load(Client, dir, path.join(__dirname, this.exec_path, 'buttons'), 'Buttons')
            );
        } else this.logger.info('Folder dir not found', 'Buttons');
        if (fs.existsSync(this.selects)) {
            const selects = fs.readdirSync(this.selects);
            if (!selects.length) this.logger.warn('No selects to load');
            else this.logger.info(`Found ${selects.length} selects`);
            selects.map(async dir =>
                this.load(Client, dir, path.join(__dirname, this.exec_path, 'selects'), 'Selects')
            );
        } else this.logger.info('Folder dir not found', 'Selects');
        if (fs.existsSync(this.commands)) {
            const commands = fs.readdirSync(this.commands);
            if (!commands.length) this.logger.warn('No commands to load');
            else this.logger.info(`Found ${commands.length} commands`);
            commands.map(async dir =>
                this.load(Client, dir, path.join(__dirname, this.exec_path, 'commands'), 'Commands')
            );
        } else this.logger.info('Folder dir not found', 'Commands');
    }

    private async load(Client: YumuCore, path: string, main_path: string, ident: Identificator) {
        const name = path.split('.')[0];
        const ext = path.split('.')[1];
        if (!['ts', 'js'].includes(ext)) {
            this.logger.warn(`Skipping ${name} because ${ext} is not suported`, ident);
            return null;
        }

        try {
            const file = await import(`${main_path}/${path}`);
            const data = new (this.is_dev ? file.default : file.default.default)();

            if (!data.name || !data.run) {
                this.logger.warn(`Skipping ${name} because name or run is missing.`, ident);
                return;
            }

            switch (ident) {
                case 'Events':
                    Client.on(data.name, data.run.bind(this, Client));
                    break;
                case 'Modals':
                    Client.modals.set(data.name, data);
                    break;
                case 'Buttons':
                    Client.buttons.set(data.name, data);
                    break;
                case 'Selects':
                    Client.selects.set(data.name, data);
                    break;
                case 'Commands':
                    Client.commands.set(data.data.name, data);
                    break;
            }

            this.logger.log(
                `Loaded ${ident.toLowerCase().slice(0, ident.length - 1)} ${name} from ${path}`,
                ident
            );
            return;
        } catch (err) {
            this.logger.error(`Error loading ${name}: ${err.message}`, ident);
            return null;
        }
    }
}

type Identificator = 'Events' | 'Modals' | 'Buttons' | 'Selects' | 'Commands';
