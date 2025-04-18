import Event from '@class/Event';
import YumuCore from '@core';
import { Message } from 'discord.js';

export default class LinkMessageNsfw implements Event {
    name = 'messageCreate';
    run = async (Client: YumuCore, message: Message) => {
        try {
            if (message.author.bot || message.channelId !== process.env.NSFW_CHANNEL) return;

            const hasTwitterLink = Client.extractTwitterLink(message.content);
            const hasBskyLink = Client.extractBskyLink(message.content);

            if (hasTwitterLink && Client.accounts.nsfw.twitter) {
                try {
                    const currentUser = await Client.accounts.nsfw.twitter.currentUserV2();
                    if (!currentUser?.data?.id) {
                        throw new Error('Usuário do Twitter não encontrado.');
                    }

                    await Client.accounts.nsfw.twitter.v2.retweet(
                        currentUser.data.id,
                        hasTwitterLink.postId
                    );
                    await Client.accounts.nsfw.twitter.v2.like(
                        currentUser.data.id,
                        hasTwitterLink.postId
                    );

                    Client.logger.info(
                        `Retweet e like feitos no tweet ${hasTwitterLink.postId}`,
                        'Twitter'
                    );
                } catch (err) {
                    Client.logger.error(`Erro ao interagir com Twitter: ${err}`, 'Twitter');
                }
            }

            if (hasBskyLink && Client.accounts.nsfw.bluesky) {
                try {
                    const post = await Client.accounts.nsfw.bluesky.getPost(hasBskyLink.postId);
                    if (!post) {
                        throw new Error(`Post do Bluesky ${hasBskyLink.postId} não encontrado.`);
                    }

                    await post.repost();
                    await post.like();

                    Client.logger.info(
                        `Repost e like feitos no post ${hasBskyLink.postId}`,
                        'Bluesky'
                    );
                } catch (err) {
                    Client.logger.error(`Erro ao interagir com Bluesky: ${err}`, 'Bluesky');
                }
            }

            await message.react('❤️').catch(err => {
                Client.logger.warn(`Não foi possível adicionar reação: ${err}`);
            });
        } catch (err) {
            Client.logger.error(`Erro inesperado no evento LinkMessageNsfw: ${err}`);
        }
    };
}
