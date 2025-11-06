import { RecipeSpec } from '@openrewrite/rewrite/test';
import { typescript } from '@openrewrite/rewrite/javascript';
import { SayHelloRecipe } from '../src/say-hello-recipe';

describe('SayHelloRecipe', () => {
    const spec = new RecipeSpec();

    beforeEach(() => {
        spec.recipe = new SayHelloRecipe();
    });

    test('adds hello method to empty class', async () => {
        await spec.rewriteRun(
            typescript(
                `class FooBar {
}`,
                `class FooBar {
    hello() {
        return "Hello from " + this.constructor.name + "!";
    }
}`
            )
        );
    });

    test('adds hello method to class with constructor', async () => {
        await spec.rewriteRun(
            typescript(
                `class Person {
    constructor(name) {
        this.name = name;
    }
}`,
                `class Person {
    constructor(name) {
        this.name = name;
    }
    hello() {
        return "Hello from " + this.constructor.name + "!";
    }
}`
            )
        );
    });

    test('adds hello method to class with existing methods', async () => {
        await spec.rewriteRun(
            typescript(
                `class Person {
    constructor(name) {
        this.name = name;
    }

    greet() {
        return \`Hi, I'm \${this.name}\`;
    }
}`,
                `class Person {
    constructor(name) {
        this.name = name;
    }

    greet() {
        return \`Hi, I'm \${this.name}\`;
    }
    hello() {
        return "Hello from " + this.constructor.name + "!";
    }
}`
            )
        );
    });

    test('does not add hello if it already exists', async () => {
        await spec.rewriteRun(
            typescript(
                `class Person {
    constructor(name) {
        this.name = name;
    }

    hello() {
        return "Hello from existing method!";
    }
}`
            )
        );
    });

    test('handles multiple classes in the same file', async () => {
        await spec.rewriteRun(
            typescript(
                `class Person {
    constructor(name) {
        this.name = name;
    }
}

class Animal {
    constructor(species) {
        this.species = species;
    }
}`,
                `class Person {
    constructor(name) {
        this.name = name;
    }
    hello() {
        return "Hello from " + this.constructor.name + "!";
    }
}

class Animal {
    constructor(species) {
        this.species = species;
    }
    hello() {
        return "Hello from " + this.constructor.name + "!";
    }
}`
            )
        );
    });

    test('preserves class with hello already defined differently', async () => {
        await spec.rewriteRun(
            typescript(
                `class Greeter {
    hello(name) {
        return \`Hello, \${name}!\`;
    }
}`
            )
        );
    });
});
