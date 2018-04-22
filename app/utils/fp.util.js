export const compose =
    (...functions) => (initial) =>
        functions.reduceRight(
            (value, fn) => fn(value),
            initial
        );

export const hasProp = (object, prop) => object.hasOwnProperty(prop);