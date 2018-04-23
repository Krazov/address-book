import { LAST_ID, ADDRESS_BOOK } from '/app/constants/databases.js';
import { set, get } from '/app/utils/local-storage.util.js';

export const update = ({lastId, addressBook}) => {
    if (lastId) {
        set(LAST_ID, JSON.stringify({value: lastId}));
    }

    if (addressBook) {
        set(ADDRESS_BOOK, JSON.stringify(addressBook));
    }
};

export const read = (key, fallback = null) => get(key) || fallback;