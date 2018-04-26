export const compose =
    (...functions) => (...initial) => {
        const lastIndex = functions.length - 1;

        return functions.reduceRight(
            (value, fn, index) => index === lastIndex ? fn(...value) : fn(value),
            initial
        );
    };

export const pipe =
    (...functions) => (...initial) => {
        return functions.reduce(
            (value, fn, index) => index === 0 ? fn(...value) : fn(value),
            initial
        );
    };

export const hasProp =
    (object, prop) => object.hasOwnProperty(prop);