import { hasProp } from '../../app/utils/fp.util.js';

describe('hasProps', () => {
    const object = {
        testProperty: 'test value',
    }

    it('should return `true` for existing prop', () => {
        const actual = hasProp(object, 'testProperty');
        const expected = true;

        expect(actual).toBe(expected);
    });

    it('should return `false` for not existing prop', () => {
        const actual = hasProp(object, 'hahaWhySoSerious');
        const expected = false;

        expect(actual).toBe(expected);
    });

    it('should throw an error for not existing object', () => {
        expect(() => {
            hasProp(undefined, 'nevermind');
        }).toThrow();
    });
});