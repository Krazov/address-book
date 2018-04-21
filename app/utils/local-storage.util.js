const { localStorage } = window;

export function save(key, value) {
    localStorage.setItem(key, value);
};
