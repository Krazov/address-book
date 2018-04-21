let subscribers = [];

export const subscribe = (fn) => {
    subscribers.push(fn);
};

export const unsubscribe = (fn) => {
    subscribers.splice(subscribers.indexOf(fn), 1);
};

export const notify = (message) => {
    subscribers.forEach((fn) => {
        fn(message);
    })
};
