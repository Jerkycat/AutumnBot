import Event from '@class/Event';
import YumuCore from '@core';
import axios from 'axios';
import { Attachment, Message } from 'discord.js';

export default class ImageMessageNSFW implements Event {
    name = 'messageCreate';

    run = async (Client: YumuCore, message: Message) => {
        try {
            if (message.author.bot || message.channel.id !== process.env.NSFW_CHANNEL) return;

            const image = message.attachments.first();
            if (!image || this.hasSocialLink(Client, message.content)) return;

            if (!this.isValidImage(image)) return;

            let postsLinks = '## Links\n';
            const postMessage = `${message.content ? `"${message.content.slice(0, 175)}" ` : ''}enviado por ${message.author.username} em nosso discord!`;

            const downloaded = await this.downloadImage(image);
            if (!downloaded) return;

            const compressed = await this.compressImage(Client, downloaded);
            if (!compressed) return;

            const twitterLink = await this.postToTwitter(Client, compressed, postMessage);
            if (twitterLink) postsLinks += `- [Twitter/X](<${twitterLink}>)\n`;

            const bskyLink = await this.postToBluesky(
                Client,
                compressed,
                image.contentType,
                postMessage
            );
            if (bskyLink) postsLinks += `- [Bsky](<${bskyLink}>)`;

            if (twitterLink || bskyLink) {
                message.reply(postsLinks);
            }
        } catch (err) {
            Client.logger.error(`Unexpected error in ImageMessageNSFW: ${err}`, 'EventHandler');
        }
    };

    private hasSocialLink(Client: YumuCore, content: string): boolean {
        return !!Client.extractTwitterLink(content) || !!Client.extractBskyLink(content);
    }

    private isValidImage(attachment: Attachment): boolean {
        try {
            const validTypes = [
                'image/png',
                'image/jpeg',
                'image/webp',
                'video/mp4',
                'image/gif',
                'video/quicktime'
            ];
            return attachment.contentType
                ? validTypes.some(type => attachment.contentType.includes(type))
                : false;
        } catch (err) {
            console.error(`Error validating image: ${err}`);
            return false;
        }
    }

    private async downloadImage(attachment: Attachment): Promise<Buffer | null> {
        try {
            const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
            return response.data;
        } catch (err) {
            console.error(`Failed to download image: ${err}`);
            return null;
        }
    }

    private async compressImage(Client: YumuCore, imageBuffer: Buffer): Promise<Buffer | null> {
        try {
            const compressed = await Client.compressImage(imageBuffer);
            return compressed && compressed.byteLength <= 5 * 1024 * 1024 ? compressed : null;
        } catch (err) {
            console.error(`Failed to compress image: ${err}`);
            return null;
        }
    }

    private async postToTwitter(
        Client: YumuCore,
        image: Buffer,
        message: string
    ): Promise<string | null> {
        try {
            const TwitterUser = await Client.accounts.nsfw.twitter.currentUserV2();
            if (!TwitterUser) return null;

            const mediaId = await Client.accounts.nsfw.twitter.v1.uploadMedia(image, {
                mimeType: 'image/webp'
            });
            const post = await Client.accounts.nsfw.twitter.v2.tweet(message, {
                media: { media_ids: [mediaId] }
            });

            if (post) {
                const url = `https://x.com/${TwitterUser.data.username}/status/${post.data.id}`;
                Client.logger.info(`Tweeted: ${url}`, 'Twitter');
                return url;
            }
        } catch (err) {
            console.error(`Failed to post to Twitter: ${err}`);
        }
        return null;
    }

    private async postToBluesky(
        Client: YumuCore,
        image: Buffer,
        contentType: string,
        message: string
    ): Promise<string | null> {
        try {
            const blob = new Blob([image], { type: contentType });
            const BlueskyPost = await Client.accounts.nsfw.bluesky.post({
                text: message,
                images: [{ data: blob }],
                langs: ['pt', 'br', 'en']
            });

            if (BlueskyPost) {
                const postId = BlueskyPost.uri.split('.post/')[1] || '';
                const url = `https://bsky.app/profile/${Client.accounts.nsfw.bluesky.profile.handle}/post/${postId}`;
                Client.logger.info(`Posted on Bluesky: ${url}`, 'Bluesky');
                return url;
            }
        } catch (err) {
            console.error(`Failed to post to Bluesky: ${err}`);
        }
        return null;
    }
}
