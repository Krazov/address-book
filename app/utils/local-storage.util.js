const { localStorage } = window;

export const set = (key, value) => {
    localStorage.setItem(key, value);
};

export const get = (key) => {
    const object = localStorage.getItem(key);

    return object != null ? JSON.parse(object) : null;
}