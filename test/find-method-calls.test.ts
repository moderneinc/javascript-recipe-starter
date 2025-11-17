// noinspection TypeScriptCheckImport

import {RecipeSpec} from "@openrewrite/rewrite/test";
import {javascript} from "@openrewrite/rewrite/javascript";
import {FindMethodCalls} from "../src";

describe('FindMethodCalls (Data Tables)', () => {
    test('finds and marks method calls as search results', async () => {
        const spec = new RecipeSpec();
        const recipe = new FindMethodCalls({ methodName: 'foo' });
        spec.recipe = recipe;

        // Search recipes don't modify code, but mark findings with search result markers
        await spec.rewriteRun(
            javascript(
                `
                obj.foo();
                another.foo(1, 2);
                obj.bar();
                nested.foo(inner.foo());
                `,
                `
                /*~~>*/obj.foo();
                /*~~>*/another.foo(1, 2);
                obj.bar();
                /*~~>*/nested.foo(/*~~>*/inner.foo());
                `
                // Search result markers (/*~~>*/) highlight findings in the UI
                // Findings are also recorded in data table (exported as CSV in practice)
            )
        );

        // In production, data tables are exported as CSV files
        // The recipe collects: source file, method name, and code snippet
        expect(recipe.findings.descriptor.name).toBe('org.example.method-calls');
        expect(recipe.findings.descriptor.columns).toHaveLength(3);
    });

    test('does not match other method names', async () => {
        const spec = new RecipeSpec();
        const recipe = new FindMethodCalls({ methodName: 'target' });
        spec.recipe = recipe;

        await spec.rewriteRun(
            javascript(
                `
                obj.other();
                obj.different();
                `
                // No matches - data table will be empty
            )
        );

        // Recipe still runs successfully
        expect(recipe.findings).toBeDefined();
    });

    test('works with custom method names', async () => {
        const spec = new RecipeSpec();
        const recipe = new FindMethodCalls({ methodName: 'customMethod' });
        spec.recipe = recipe;

        await spec.rewriteRun(
            javascript(
                `
                api.customMethod();
                service.customMethod(arg);
                `,
                `
                /*~~>*/api.customMethod();
                /*~~>*/service.customMethod(arg);
                `
            )
        );

        // Data table is properly configured
        expect(recipe.findings.descriptor.displayName).toBe('Method call findings');
    });
});
