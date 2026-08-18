import { RecipeSpec } from '@openrewrite/rewrite/test';
import { npm, packageJson, typescript } from '@openrewrite/rewrite/javascript';
import { MigrateUtilFunctions } from '../src';
import { withDir } from 'tmp-promise';

// `util.isBoolean` and `util.isString` were dropped from @types/node 26, so the
// sources being migrated are parsed against the older typings they still exist in.
//language=json
const NODE_PACKAGE_JSON = `
{
  "name": "test-project",
  "version": "1.0.0",
  "devDependencies": {
    "@types/node": "^22.0.0"
  }
}
`;

describe('MigrateUtilFunctions', () => {
    jest.setTimeout(30_000);

    const spec = new RecipeSpec();

    beforeEach(() => {
        spec.recipe = new MigrateUtilFunctions();
    });

    test('migrates util.isArray to Array.isArray', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
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
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('migrates util.isBoolean to typeof check', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
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
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('migrates util.isString to typeof check', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
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
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('migrates multiple util calls in the same file', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
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
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('does not modify non-util method calls', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        const myObj = {
                            isArray: (x) => Array.isArray(x),
                            isString: (x) => typeof x === 'string'
                        };

                        myObj.isArray([]);
                        myObj.isString("test");
                        `
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('handles complex expressions as arguments', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        import * as util from 'util';

                        const result = util.isArray(getData().items);
                        `,
                        `
                        import * as util from 'util';

                        const result = Array.isArray(getData().items);
                        `
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('handles named imports', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        import { isArray } from 'util';

                        const arr = [1, 2, 3];
                        if (isArray(arr)) {
                            console.log('is array');
                        }
                        `,
                        `
                        import { isArray } from 'util';

                        const arr = [1, 2, 3];
                        if (Array.isArray(arr)) {
                            console.log('is array');
                        }
                        `
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('handles different namespace name', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        import * as nodeUtil from 'util';

                        const arr = [1, 2, 3];
                        if (nodeUtil.isArray(arr)) {
                            console.log('is array');
                        }
                        `,
                        `
                        import * as nodeUtil from 'util';

                        const arr = [1, 2, 3];
                        if (Array.isArray(arr)) {
                            console.log('is array');
                        }
                        `
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('handles CommonJS require', async () => {
        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        const util = require('util');

                        const arr = [1, 2, 3];
                        if (util.isArray(arr)) {
                            console.log('is array');
                        }
                        `,
                        `
                        const util = require('util');

                        const arr = [1, 2, 3];
                        if (Array.isArray(arr)) {
                            console.log('is array');
                        }
                        `
                    ),
                    packageJson(NODE_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });
});
