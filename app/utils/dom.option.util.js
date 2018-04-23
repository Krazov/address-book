export default (code, name) => {
    const $option = document.createElement('option');

    $option.value = code;
    $option.textContent = name;

    return $option;
};