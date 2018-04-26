import { hasProp } from '../utils/fp.util.js';

const subscribers = {};

const channelExists = (channel) => hasProp(subscribers, channel);

export const subscribe = (channel, fn) => {
    if (!channelExists(channel)) {
        subscribers[channel] = [];
    }

    if (typeof fn == 'function') {
        subscribers[channel].push(fn);
   }
};

export const unsubscribe = (channel, fn) => {
    if (channelExists(channel)) {
        subscribers[channel].splice(subscribers.indexOf(fn), 1);
    }
};

export const notify = (channel, message) => {
    if (channelExists(channel)) {
        subscribers[channel].forEach((fn) => {
            fn(message);
        })
    }
};