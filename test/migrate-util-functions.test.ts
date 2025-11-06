import { RecipeSpec } from '@openrewrite/rewrite/test';
import { typescript } from '@openrewrite/rewrite/javascript';
import { MigrateUtilFunctions } from '../src';

describe('MigrateUtilFunctions', () => {
    const spec = new RecipeSpec();

    beforeEach(() => {
        spec.recipe = new MigrateUtilFunctions();
    });

    test('migrates util.isArray to Array.isArray', async () => {
        await spec.rewriteRun(
            typescript(
                `
                import * as util from 'util';

                const arr = [1, 2, 3];
                if (util.isArray(arr)) {
                    console.log('is array');
                }
                `,
                `
                import * as util from 'util';

                const arr = [1, 2, 3];
                if (Array.isArray(arr)) {
                    console.log('is array');
                }
                `
            )
        );
    });

    test('migrates util.isBoolean to typeof check', async () => {
        await spec.rewriteRun(
            typescript(
                `
                import * as util from 'util';

                const value = true;
                if (util.isBoolean(value)) {
                    console.log('is boolean');
                }
                `,
                `
                import * as util from 'util';

                const value = true;
                if (typeof value === 'boolean') {
                    console.log('is boolean');
                }
                `
            )
        );
    });

    test('migrates util.isString to typeof check', async () => {
        await spec.rewriteRun(
            typescript(
                `
                import * as util from 'util';

                const text = "hello";
                if (util.isString(text)) {
                    console.log('is string');
                }
                `,
                `
                import * as util from 'util';

                const text = "hello";
                if (typeof text === 'string') {
                    console.log('is string');
                }
                `
            )
        );
    });

    test('migrates multiple util calls in the same file', async () => {
        await spec.rewriteRun(
            typescript(
                `
                import * as util from 'util';

                function checkType(value) {
                    if (util.isArray(value)) {
                        return 'array';
                    }
                    if (util.isBoolean(value)) {
                        return 'boolean';
                    }
                    if (util.isString(value)) {
                        return 'string';
                    }
                    return 'unknown';
                }
                `,
                `
                import * as util from 'util';

                function checkType(value) {
                    if (Array.isArray(value)) {
                        return 'array';
                    }
                    if (typeof value === 'boolean') {
                        return 'boolean';
                    }
                    if (typeof value === 'string') {
                        return 'string';
                    }
                    return 'unknown';
                }
                `
            )
        );
    });

    test('does not modify non-util method calls', async () => {
        await spec.rewriteRun(
            typescript(
                `
                const myObj = {
                    isArray: (x) => Array.isArray(x),
                    isString: (x) => typeof x === 'string'
                };

                myObj.isArray([]);
                myObj.isString("test");
                `
            )
        );
    });

    test('handles complex expressions as arguments', async () => {
        await spec.rewriteRun(
            typescript(
                `
                import * as util from 'util';

                const result = util.isArray(getData().items);
                `,
                `
                import * as util from 'util';

                const result = Array.isArray(getData().items);
                `
            )
        );
    });
});
