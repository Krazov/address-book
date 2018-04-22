import { hasProp } from '/app/utils/fp.util.js';

const subscribers = {};

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
        subscribers.splice(subscribers.indexOf(fn), 1);
    }
};

export const notify = (channel, message) => {
    if (channelExists(channel)) {
        subscribers[channel].forEach((fn) => {
            fn(message);
        })
    }
};

function channelExists(channel) {
    return hasProp(subscribers, channel);
}