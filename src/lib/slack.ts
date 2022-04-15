import axios from 'axios';

const agent = axios.create({
  baseURL: 'https://slack.com/api',
  headers: {
    'Content-type': 'application/json',
    Authorization: `Bearer ${process.env.SLACK_WORKSPACE_TOKEN}`,
  },
});

const slackAPI = {
  chat: {
    async post(message: {
      channel: string;
      text?: string;
      blocks?: unknown[];
    }) {
      return agent({
        method: 'POST',
        url: 'chat.postMessage',
        data: {
          text: 'HOV DevOps alert!',
          ...message,
          blocks: JSON.stringify(message.blocks),
          unfurl_links: false,
          unfurl_media: false,
        },
      });
    },
    async postResponseUrl(input: {
      responseUrl: string;
      message: {
        text?: string;
        blocks?: unknown[];
      };
    }) {
      return agent({
        method: 'POST',
        baseURL: input.responseUrl,
        data: {
          ...input.message,
          blocks: JSON.stringify(input.message.blocks),
        },
      });
    },
  },
  reactions: {
    async add(params: { channel: string; name: string; timestamp: string }) {
      return agent({
        method: 'POST',
        url: 'reactions.add',
        data: params,
      });
    },
  },
};

export default slackAPI;
