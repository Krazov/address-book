import {
    validateName,
    validateSurname,
    validateCountry,
    validateEmail,
} from '../../app/utils/validator.util.js';

describe('validateName', () => {
    it('should return `true` if name has letters in it', () => {
        const actual = validateName('John');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `false` if name is empty', () => {
        const actual = validateName('');
        const expected = false;

        expect(actual).toBe(expected);
    });

    it('should return `false` if name consists only of digits', () => {
        const actual = validateName('432');
        const expected = false;

        expect(actual).toBe(expected);
    });
});

describe('validateSurname', () => {
    it('should return `true` if surname has letters in it', () => {
        const actual = validateSurname('St. John');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `true` is surname is empty (in other words, allow for mononyms)', () => {
        const actual = validateSurname('');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `false` if name consists only of digits', () => {
        const actual = validateSurname('432');
        const expected = false;

        expect(actual).toBe(expected);
    });
});

describe('validateCountry', () => {
    it('should return `true` for a country from the list', () => {
        const actual = validateCountry('af');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `false` for anything else but country from the list', () => {
        const actual = validateCountry('HAHA');
        const expected = false;

        expect(actual).toBe(expected);
    });
});

describe('validateEmail', () => {
    it('should return `true` for valid email', () => {
        const actual = validateEmail('john@example.com');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `true` for valid email: with dot in handle', () => {
        const actual = validateEmail('john@example.com');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `true` for valid email: with dot and plus in handle', () => {
        const actual = validateEmail('john.c+troll@example.com');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `false` for invalid email: random text', () => {
        const actual = validateEmail('Quick brown fox jumped over lazy dog.');
        const expected = false;

        expect(actual).toBe(expected);
    });

    it('should return `false` for invalid email: one word in domain', () => {
        const actual = validateEmail('john@example');
        const expected = false;

        expect(actual).toBe(expected);
    });
});