const createLabel = (name, surname, country, email) =>
    Object.assign(document.createElement('div'), {
        textContent: `${name} ${surname} (${country}), ${email}`
    });

const createButton = (className, textContent) =>
    Object.assign(document.createElement('button'), { className, textContent });

const createEditButton = () => createButton('itemEdit', 'Edit');

const createDeleteButton = () => createButton('itemDelete', 'Delete');

export const createItem = ({ name, surname, country, email }) => {
    const li = document.createElement('li');

    li.appendChild(createLabel(name, surname, country, email));
    li.appendChild(createEditButton());
    li.appendChild(createDeleteButton());

    return li;
};
