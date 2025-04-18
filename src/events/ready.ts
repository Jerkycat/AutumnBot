import Event from '@class/Event';
import YumuCore from '@core';
import { ActivityType } from 'discord.js';

export default class Ready implements Event {
    name = 'ready';
    run = async (Client: YumuCore) => {
        Client.user.setPresence({
            activities: [{ name: 'AutumnDraws', type: ActivityType.Watching }],
            status: 'online'
        });
        Client.logger.log(
            `Connected for ${Client.guilds.cache.reduce(
                (a, b) => a + b.memberCount,
                0
            )} members in ${Client.guilds.cache.size} servers`,
            Client.user.username
        );
    };
}
