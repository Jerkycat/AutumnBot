declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            SFW_CHANNEL: string;
            NSFW_CHANNEL: string;
            TWITTER_SFW_TOKEN: string;
            TWITTER_SFW_SECRET: string;
            TWITTER_NSFW_TOKEN: string;
            TWITTER_NSFW_SECRET: string;
            TWITTER_SFW_CONSUMER: string;
            TWITTER_SFW_KEY: string;
            TWITTER_NSFW_CONSUMER: string;
            TWITTER_NSFW_KEY: string;
            BSKY_SFW_USER: string;
            BSKY_SFW_PASS: string;
            BSKY_NSFW_USER: string;
            BSKY_NSFW_PASS: string;
        }
    }
}

export {};
