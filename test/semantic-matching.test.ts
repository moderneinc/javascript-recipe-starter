// noinspection TypeScriptCheckImport

import {RecipeSpec} from "@openrewrite/rewrite/test";
import {npm, packageJson, tsx, typescript} from "@openrewrite/rewrite/javascript";
import {SemanticForwardRefMigration} from "../src";
import {withDir} from "tmp-promise";

//language=json
const REACT_PACKAGE_JSON = `
{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0"
  }
}
`;

describe('SemanticForwardRefMigration (Section 5: Semantic Matching)', () => {
    test('matches forwardRef with named import (merges into existing import)', async () => {
        const spec = new RecipeSpec();
        spec.recipe = new SemanticForwardRefMigration();

        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        import { forwardRef } from 'react';
                        const MyComponent = forwardRef(Component);
                        `,
                        `
                        import { forwardRef, memo } from 'react';
                        const MyComponent = memo(forwardRef(Component));
                        `
                    ),
                    packageJson(REACT_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('matches React.forwardRef with namespace import (normalizes to named import)', async () => {
        const spec = new RecipeSpec();
        spec.recipe = new SemanticForwardRefMigration();

        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    tsx(
                        `
                        import * as React from 'react';
                        const MyComponent = React.forwardRef(Component);
                        `,
                        `
                        import * as React from 'react';
                        import {forwardRef, memo} from 'react';
                        const MyComponent = memo(forwardRef(Component));
                        `
                    ),
                    packageJson(REACT_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('matches React.forwardRef with default import (normalizes to named import)', async () => {
        const spec = new RecipeSpec();
        spec.recipe = new SemanticForwardRefMigration();

        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        import React from 'react';
                        const MyComponent = React.forwardRef(Component);
                        `,
                        `
                        import React, {forwardRef, memo} from 'react';
                        const MyComponent = memo(forwardRef(Component));
                        `
                    ),
                    packageJson(REACT_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('matches forwardRef with aliased import', async () => {
        const spec = new RecipeSpec();
        spec.recipe = new SemanticForwardRefMigration();

        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        import { forwardRef as reactForwardRef } from 'react';
                        const MyComponent = reactForwardRef(Component);
                        `,
                        `
                        import { forwardRef, memo, forwardRef as reactForwardRef } from 'react';
                        const MyComponent = memo(forwardRef(Component));
                        `
                        // Note: Semantic matching FOUND it via the alias 'reactForwardRef'
                        // The template normalizes to 'forwardRef' - that's okay!
                        // The magic is that it matched despite the alias
                    ),
                    packageJson(REACT_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });

    test('does not match non-React forwardRef', async () => {
        const spec = new RecipeSpec();
        spec.recipe = new SemanticForwardRefMigration();

        await withDir(async (repo) => {
            await spec.rewriteRun(
                npm(
                    repo.path,
                    typescript(
                        `
                        function forwardRef(comp: any) { return comp; }
                        const MyComponent = forwardRef(Component);
                        `
                        // No change - not the React forwardRef
                    ),
                    packageJson(REACT_PACKAGE_JSON)
                )
            );
        }, {unsafeCleanup: true});
    });
});
