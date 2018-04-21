export const compose =
    (...functions) => (initial) =>
        functions.reduceRight(
            (value, fn) => fn(value),
            initial
        );
