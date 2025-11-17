import {ExecutionContext, Option, Recipe, Transient, TreeVisitor, DataTable, Column, foundSearchResult} from "@openrewrite/rewrite";
import {JavaScriptVisitor} from "@openrewrite/rewrite/javascript";
import {J} from "@openrewrite/rewrite/java";

/**
 * Data table row for method call findings
 */
export class MethodCallRecord {
    @Column({
        displayName: "Source file",
        description: "The source file containing the method call"
    })
    readonly sourceFile: string;

    @Column({
        displayName: "Method name",
        description: "The name of the method being called"
    })
    readonly methodName: string;

    @Column({
        displayName: "Code snippet",
        description: "The code snippet of the method call"
    })
    readonly code: string;

    constructor(sourceFile: string, methodName: string, code: string) {
        this.sourceFile = sourceFile;
        this.methodName = methodName;
        this.code = code;
    }

    static dataTable = new DataTable<MethodCallRecord>(
        "org.example.method-calls",
        "Method call findings",
        "All occurrences of the target method call",
        MethodCallRecord
    );
}

/**
 * Example demonstrating data tables for impact analysis
 *
 * Search recipes find patterns and record findings in data tables
 * without making any changes. This is perfect for:
 * - Impact analysis before migrations
 * - Usage reporting
 * - Code inventory
 */
export class FindMethodCalls extends Recipe {
    name = "org.example.FindMethodCalls";
    displayName = "Find method calls";
    description = "Finds all calls to a specific method and records them in a data table";

    @Option({
        displayName: "Method name",
        description: "The method name to search for"
    })
    methodName!: string;

    constructor(options: { methodName: string }) {
        super(options);
    }

    @Transient
    findings = MethodCallRecord.dataTable;

    async editor(): Promise<TreeVisitor<any, ExecutionContext>> {
        const methodName = this.methodName;
        const findings = this.findings;

        return new class extends JavaScriptVisitor<ExecutionContext> {
            protected async visitMethodInvocation(
                method: J.MethodInvocation,
                ctx: ExecutionContext
            ): Promise<J | undefined> {
                method = (await super.visitMethodInvocation(method, ctx)) as J.MethodInvocation;

                if (method.name.simpleName === methodName) {
                    // Record finding in data table
                    // Get the source file path from the enclosing compilation unit
                    const cu = this.cursor.firstEnclosing((t): t is any =>
                        t !== null && typeof t === 'object' && 'sourcePath' in t
                    );
                    const sourceFile = cu?.sourcePath ?? "unknown";

                    // Get a code snippet (simplified - just the method name and args)
                    const argCount = method.arguments?.elements?.length ?? 0;
                    const code = `${methodName}(${argCount > 0 ? '...' : ''})`;

                    findings.insertRow(ctx, new MethodCallRecord(
                        sourceFile,
                        methodName,
                        code
                    ));

                    // Mark this node as a search result (highlights in UI)
                    return foundSearchResult(method);
                }

                return method;
            }
        }
    }
}
