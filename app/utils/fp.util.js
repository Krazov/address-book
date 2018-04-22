export const compose =
    (...functions) => (...initial) => {
        const lastIndex = functions.length - 1;

        return functions.reduceRight(
            (value, fn, index) => index === lastIndex ? fn(...value) : fn(value),
            initial
        );
    };

export const hasProp =
    (object, prop) => object.hasOwnProperty(prop);