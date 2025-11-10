import { Recipe, ExecutionContext, TreeVisitor } from '@openrewrite/rewrite';
import { JavaScriptVisitor, template } from '@openrewrite/rewrite/javascript';
import { J } from '@openrewrite/rewrite/java';
import { produce } from 'immer';

/**
 * Recipe that adds a hello() method to JavaScript/TypeScript classes.
 *
 * This recipe demonstrates:
 * - Visiting class declarations
 * - Checking for existing methods
 * - Using the template API to add new methods
 */
export class SayHelloRecipe extends Recipe {
    readonly name = "com.yourorg.SayHelloRecipe";
    readonly displayName = "Say Hello";
    readonly description = "Adds a hello() method to classes that don't have one";

    async editor(): Promise<TreeVisitor<any, ExecutionContext>> {
        return new SayHelloVisitor();
    }
}

/**
 * Visitor that traverses the LST and adds the hello method to classes.
 */
class SayHelloVisitor extends JavaScriptVisitor<ExecutionContext> {
    protected async visitClassDeclaration(
        classDecl: J.ClassDeclaration,
        ctx: ExecutionContext
    ): Promise<J | undefined> {
        // First, continue visiting children
        const visited = await super.visitClassDeclaration(classDecl, ctx);
        if (!visited) {
            return visited;
        }

        const updatedClass = visited as J.ClassDeclaration;

        // Check if the class already has a hello method
        const hasHelloMethod = this.classHasHelloMethod(updatedClass);

        if (!hasHelloMethod) {
            // Create a temporary class with just the hello method using template
            const tempClass = await template`class Temp {
hello() {
return "Hello from " + this.constructor.name + "!";
}
}`.apply(this.cursor, updatedClass);

            if (tempClass && (tempClass as J.ClassDeclaration).body) {
                // Extract the hello method from the temporary class
                const helloMethod = (tempClass as J.ClassDeclaration).body.statements[0];

                // Add the hello method to the existing class body using produce
                return produce(updatedClass, draft => {
                    draft.body.statements = [...draft.body.statements, helloMethod];
                });
            }
        }

        return updatedClass;
    }

    /**
     * Checks if a class already has a hello method.
     */
    private classHasHelloMethod(classDecl: J.ClassDeclaration): boolean {
        if (!classDecl.body || !classDecl.body.statements) {
            return false;
        }

        return classDecl.body.statements.some((stmt) => {
            // Properly unwrap RightPadded wrapper
            const element = stmt.element;
            if (element.kind === J.Kind.MethodDeclaration) {
                const method = element as J.MethodDeclaration;
                return method.name.simpleName === 'hello';
            }
            return false;
        });
    }
}
