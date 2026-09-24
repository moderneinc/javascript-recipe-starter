import {ExecutionContext, Recipe, TreeVisitor} from "@openrewrite/rewrite";
import {JavaScriptVisitor, capture, pattern, raw, template, maybeAddImport} from "@openrewrite/rewrite/javascript";
import {J, isMethodInvocation} from "@openrewrite/rewrite/java";
import {JS} from "@openrewrite/rewrite/javascript";

/**
 * Example from Section 5: Type Attribution & Semantic Matching
 *
 * Demonstrates semantic matching where one pattern matches multiple
 * syntactically different but semantically equivalent forms:
 * - forwardRef(Component) with named import
 * - React.forwardRef(Component) with namespace import
 * - React.forwardRef(Component) with default import
 *
 * All matched by a single pattern with type context.
 */
export class SemanticForwardRefMigration extends Recipe {
    name = "org.example.SemanticForwardRefMigration";
    displayName = "Migrate React.forwardRef usage";
    description = "Demonstrates semantic matching across different import styles";

    async editor(): Promise<TreeVisitor<any, ExecutionContext>> {
        const comp = capture('comp');
        const pat = pattern`forwardRef(${comp})`
            .configure({
                context: [`import { forwardRef } from 'react'`],
                dependencies: { '@types/react': '^18.0.0' }
            });

        return new class extends JavaScriptVisitor<ExecutionContext> {
            protected async visitMethodInvocation(
                method: J.MethodInvocation,
                ctx: ExecutionContext
            ): Promise<J | undefined> {
                method = (await super.visitMethodInvocation(method, ctx)) as J.MethodInvocation;

                const match = await pat.match(method, this.cursor);
                if (match) {
                    const forwardRef = maybeAddImport(this, { module: 'react', member: 'forwardRef', onlyIfReferenced: false })!;
                    const memo = maybeAddImport(this, { module: 'react', member: 'memo', onlyIfReferenced: false })!;
                    const tmpl = template`${raw(memo)}(${raw(forwardRef)}(${comp}))`
                        .configure({
                            context: [
                                `import { forwardRef as ${forwardRef}, memo as ${memo} } from 'react'`
                            ],
                            dependencies: { '@types/react': '^18.0.0' }
                        });
                    return await tmpl.apply(method, this.cursor, {values: match});
                }

                return method;
            }
        }
    }
}
