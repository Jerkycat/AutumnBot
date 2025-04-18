import { cyan, green, grey, magenta, red, yellow } from 'colors';
import dayjs from 'dayjs';
import { MessagePayload, WebhookClient, WebhookMessageCreateOptions } from 'discord.js';

export default class Logger {
    identifier: string = 'Logger';
    private readonly hook: WebhookClient;

    constructor(identifier?: string, webhook?: string) {
        if (identifier) this.identifier = identifier;
        if (webhook) this.hook = new WebhookClient({ url: webhook });
    }

    private readonly types = {
        log: cyan('LOG'),
        info: green('INFO'),
        warn: yellow('WARN'),
        error: red('ERROR')
    };

    private base(type: 'log' | 'warn' | 'error' | 'info', ident: string) {
        const now = dayjs().format('DD/MM/YYYY HH:mm:ss');
        const time = `${green(`[Yumu-Core]`)} ${now}`;
        return `${time}     ${this.types[type]} ${magenta(`[${ident}]`)}`;
    }

    log(message: string, identifier?: string) {
        const ident = identifier || this.identifier;
        return console.log(`${this.base('log', ident)} ${grey(`${message}`)}`);
    }

    info(message: string, identifier?: string) {
        const ident = identifier || this.identifier;
        return console.log(`${this.base('info', ident)} ${grey(`${message}`)}`);
    }

    error(message: string, identifier?: string) {
        const ident = identifier || this.identifier;
        return console.log(`${this.base('error', ident)} ${grey(`${message}`)}`);
    }

    warn(message: string, identifier?: string) {
        const ident = identifier || this.identifier;
        return console.log(`${this.base('warn', ident)} ${grey(`${message}`)}`);
    }

    start() {
        console.clear();
        const now = dayjs().format('DD/MM/YYYY HH:mm:ss');
        const time = `${green(`[Yumu-Core]`)} ${now}`;
        return console.log(`${time}     Starting system...\n`);
    }

    async send(data: string | MessagePayload | WebhookMessageCreateOptions) {
        if (!this.hook) return this.error('No webhook provided', 'System');

        this.hook.send(data).catch(err => this.error(err.message, 'System'));
    }
}

const logger = new Logger('System');
export { logger };
