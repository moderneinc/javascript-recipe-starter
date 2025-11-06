import { check, ExecutionContext, Recipe, TreeVisitor } from '@openrewrite/rewrite';
import { JavaScriptVisitor, pattern, capture, rewrite, template, usesMethod } from '@openrewrite/rewrite/javascript';
import { J } from '@openrewrite/rewrite/java';

/**
 * Replace deprecated Node.js util type checking methods with native JavaScript equivalents.
 *
 * This recipe demonstrates:
 * - Using pattern matching with capture() to match code patterns
 * - Using rewrite rules with before/after patterns (similar to Refaster)
 * - Declarative transformations without manual LST manipulation
 *
 * Examples:
 * - util.isArray(x) -> Array.isArray(x)
 * - util.isBoolean(x) -> typeof x === 'boolean'
 * - util.isString(x) -> typeof x === 'string'
 */
export class MigrateUtilFunctions extends Recipe {
    readonly name = "com.yourorg.MigrateUtilFunctions";
    readonly displayName = "Migrate util type checking functions";
    readonly description = "Replace deprecated util.isX() methods with native JavaScript equivalents";

    async editor(): Promise<TreeVisitor<any, ExecutionContext>> {
        // Use check() to only run this visitor on files that use util methods
        return check(
            usesMethod("util is*(..)"),
            new MigrateUtilFunctionsVisitor()
        );
    }
}

/**
 * Visitor that replaces util method calls using pattern-based rewrite rules.
 */
class MigrateUtilFunctionsVisitor extends JavaScriptVisitor<ExecutionContext> {
    // Configure patterns with util dependency for type attribution
    private patternConfig = { context: ["import * as util from 'util';"] };

    // Capture variable to hold the argument
    private arg = capture();

    // Define rewrite rules using pattern matching
    private isArrayRule = rewrite(() => ({
        before: pattern`util.isArray(${this.arg})`.configure(this.patternConfig),
        after: template`Array.isArray(${this.arg})`
    }));

    private isBooleanRule = rewrite(() => ({
        before: pattern`util.isBoolean(${this.arg})`.configure(this.patternConfig),
        after: template`typeof ${this.arg} === 'boolean'`
    }));

    private isStringRule = rewrite(() => ({
        before: pattern`util.isString(${this.arg})`.configure(this.patternConfig),
        after: template`typeof ${this.arg} === 'string'`
    }));

    protected async visitMethodInvocation(
        method: J.MethodInvocation,
        ctx: ExecutionContext
    ): Promise<J | undefined> {
        // Try each rewrite rule in sequence, returning the first match
        return await this.isArrayRule.tryOn(this.cursor, method)
            || await this.isBooleanRule.tryOn(this.cursor, method)
            || await this.isStringRule.tryOn(this.cursor, method)
            || await super.visitMethodInvocation(method, ctx);
    }
}
