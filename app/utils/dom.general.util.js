export const stringToHtml = (stringTemplate) => document.createRange().createContextualFragment(stringTemplate);

export const appendAll = ($parent, children) => {
    [].forEach.call(children, ($child) => {
        $parent.appendChild($child);
    });
};