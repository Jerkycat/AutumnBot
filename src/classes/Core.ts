import { Bot as Bsky } from '@skyware/bot';
import { ActivityType, Client, Collection } from 'discord.js';
import sharp from 'sharp';
import { TwitterApi } from 'twitter-api-v2';
import Button from './Button';
import Command from './Command';
import Event from './Event';
import Handler from './Handler';
import Loader from './Loader';
import Logger from './Logger';
import Modal from './Modal';
import Select from './Select';

export default class YumuCore extends Client {
    commands = new Collection<string, Command>();
    selects = new Collection<string, Select>();
    buttons = new Collection<string, Button>();
    modals = new Collection<string, Modal>();
    events = new Collection<string, Event>();
    logger = new Logger('Discord');
    loader: Loader;
    readonly accounts: {
        nsfw: { bluesky: Bsky; twitter: TwitterApi };
        sfw: { bluesky: Bsky; twitter: TwitterApi };
    } = {
        nsfw: {
            bluesky: new Bsky(),
            twitter: new TwitterApi({
                appKey: process.env.TWITTER_NSFW_CONSUMER,
                appSecret: process.env.TWITTER_NSFW_KEY,
                accessSecret: process.env.TWITTER_NSFW_SECRET,
                accessToken: process.env.TWITTER_NSFW_TOKEN
            })
        },
        sfw: {
            bluesky: new Bsky(),
            twitter: new TwitterApi({
                appKey: process.env.TWITTER_SFW_CONSUMER,
                appSecret: process.env.TWITTER_SFW_KEY,
                accessSecret: process.env.TWITTER_SFW_SECRET,
                accessToken: process.env.TWITTER_SFW_TOKEN
            })
        }
    };

    constructor() {
        super({
            presence: {
                activities: [{ name: 'Booting...', type: ActivityType.Watching }],
                status: 'idle',
                afk: true
            },
            intents: [
                'Guilds',
                'MessageContent',
                'GuildMessageReactions',
                'GuildMessages',
                'GuildMembers'
            ]
        });
        new Handler(this);
        this.login(process.env.DISCORD_TOKEN)
            .then(() => (this.loader = new Loader(this)))
            .catch(() => {
                this.logger.error('Invalid discord token');
                process.exit(0);
            });
        this.accounts.sfw.twitter.readWrite
            .currentUserV2()
            .then(user =>
                this.logger.log(
                    'Successfully connected to SFW account ' + user.data.username,
                    'Twitter'
                )
            )
            .catch(err => {
                this.logger.error(`Error connecting to SFW account: ${err.message}`, 'Twitter');
                delete this.accounts.sfw.twitter;
            });

        this.accounts.nsfw.twitter
            .currentUserV2()
            .then(user =>
                this.logger.log(
                    'Successfully connected to NSFW account ' + user.data.username,
                    'Twitter'
                )
            )
            .catch(err => {
                this.logger.error(`Error connecting to NSFW account: ${err.message}`, 'Twitter');
                delete this.accounts.nsfw.twitter;
            });

        this.accounts.sfw.bluesky
            .login({
                identifier: process.env.BSKY_SFW_USER,
                password: process.env.BSKY_SFW_PASS
            })
            .then(user => this.logger.log('Successfully connected to SFW account ', 'Bsky'))
            .catch(err => {
                this.logger.error(`Error connecting to SFW account: ${err.message}`, 'Bsky');
                delete this.accounts.sfw.bluesky;
            });

        this.accounts.nsfw.bluesky
            .login({
                identifier: process.env.BSKY_NSFW_USER,
                password: process.env.BSKY_NSFW_PASS
            })
            .then(user => this.logger.log('Successfully connected to NSFW account ', 'Bsky'))
            .catch(err => {
                this.logger.error(`Error connecting to NSFW account: ${err.message}`, 'Bsky');
                delete this.accounts.nsfw.bluesky;
            });
    }

    public extractBskyLink(url: string) {
        const regex = /https:\/\/bsky\.app\/profile\/([^/]+)\/post\/([^/]+)/;

        const match = url.match(regex);
        if (!match) {
            return null;
        }

        const [_, user, postId] = match;

        return {
            user,
            postId: `at://${user}/app.bsky.feed.post/${postId}`
        };
    }

    public extractTwitterLink(url: string) {
        const twitterRegex =
            /https:\/\/(?:www\.)?(?:twitter\.com|x\.com|fxtwitter\.com|vxtwitter\.com|fixupx\.com)\/([\w\d_]+)\/status\/(\d+)/;

        const match = url.match(twitterRegex);
        if (match) {
            const [_, username, postId] = match;
            return { username, postId };
        }

        return null;
    }

    public async compressImage(data: Buffer): Promise<Buffer> {
        const maxSizeInMB = 5;
        const maxAttempts = 5;
        let attempt = 0;
        let quality = 80;
        let width: number | undefined;
        let height: number | undefined;
        let finalImage: Buffer;

        const metadata = await sharp(data).metadata();
        width = metadata.width;
        height = metadata.height;

        if (!width || !height) {
            throw new Error('Não foi possível obter as dimensões da imagem.');
        }

        while (!finalImage && attempt < maxAttempts) {
            attempt++;

            this.logger.info(`Tentativa ${attempt}: Convertendo para WebP...`, 'ImageProcessor');

            // Converte e salva a imagem
            const converted = await sharp(data)
                .resize(Math.floor(width), Math.floor(height))
                .webp({ quality })
                .toBuffer();
            const cMetadata = await sharp(converted).metadata();
            const sizeInMB = cMetadata.size / (1024 * 1024);

            this.logger.info(`Tamanho do arquivo: ${sizeInMB.toFixed(2)} MB`, 'ImageProcesor');

            if (sizeInMB <= maxSizeInMB) {
                this.logger.log('Compressão bem-sucedida!', 'ImageProcessor');
                finalImage = converted;
                continue;
            }

            width *= 0.75;
            height *= 0.75;
            quality -= 10;
            this.logger.info('Reduzindo dimensões e qualidade...', 'ImageProcessor');
        }

        if (finalImage) return finalImage;

        this.logger.warn(
            'Não foi possível comprimir a imagem para o tamanho desejado.',
            'ImageProcessor'
        );
    }
}
