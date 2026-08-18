# JavaScript Recipe Starter

A starter repository for learning how to create [OpenRewrite](https://github.com/openrewrite/rewrite) recipes for JavaScript and TypeScript. This repo includes example recipes with comprehensive tests, demonstrating the full project setup you need to author and test your own recipes.

## Getting started

New to OpenRewrite JavaScript recipe development? Start by checking out the [OpenRewrite documentation](https://docs.openrewrite.org/) and our [JavaScript LST examples doc](https://docs.openrewrite.org/concepts-and-explanations/javascript-lst-examples).

## Quick start

Clone this repository and install dependencies:

```bash
git clone git@github.com:moderneinc/javascript-recipe-starter.git
cd javascript-recipe-starter
npm install
```

Run the tests:

```bash
npm test
```

### TypeScript 7

Builds run on TypeScript 7, installed [side by side](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0) with 6.x:

```json
"@typescript/native": "npm:typescript@^7.0.2",
"typescript": "npm:@typescript/typescript6@^6.0.2"
```

`tsc` is the TypeScript 7 native compiler and builds `src`, while `require('typescript')` resolves to 6.x, which still ships the JavaScript compiler API that ts-jest needs to transpile tests (`tsc6` runs the 6.x compiler directly). The 6.x API bundle lives under `node_modules/@typescript/old/`, so path-based tooling config aimed at `node_modules/typescript/` may need to cover `node_modules/@typescript/` too.

## Example recipes

This repository includes example recipes that demonstrate different authoring approaches and OpenRewrite capabilities:

### Transformation recipes

- **[MigrateUtilFunctions](./src/migrate-util-functions.ts)** - Replaces deprecated Node.js `util` type checking methods (like `util.isArray()`) with native JavaScript equivalents (like `Array.isArray()`). Demonstrates pattern-based, declarative recipe authoring using `pattern` and `rewrite()` rules with type context.

- **[SayHelloRecipe](./src/say-hello-recipe.ts)** - Adds a `hello()` method to JavaScript/TypeScript classes that don't already have one. Demonstrates visitor-based recipe authoring with manual LST manipulation and the template API.

- **[SemanticForwardRefMigration](./src/semantic-matching.ts)** - Wraps React `forwardRef()` calls with `memo()` for better performance. Demonstrates **semantic type matching** that works across different import styles (named, namespace, default, and aliased imports). Shows how one pattern with type context can match syntactically different but semantically equivalent code.

### Search recipes

- **[FindMethodCalls](./src/find-method-calls.ts)** - Finds and records all calls to a specified method name in a data table. Demonstrates **search recipes** that collect findings without modifying code, useful for impact analysis before migrations. Shows the `@Option` decorator for configurable recipes and `@Column` for data table structure. Results can be exported to CSV.

## Project structure

```
javascript-recipe-starter/
├── src/
│   ├── migrate-util-functions.ts
│   ├── say-hello-recipe.ts
│   ├── semantic-matching.ts
│   ├── find-method-calls.ts
│   └── index.ts
├── test/
│   ├── migrate-util-functions.test.ts
│   ├── say-hello-recipe.test.ts
│   ├── semantic-matching.test.ts
│   └── find-method-calls.test.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Running your recipes

To run these recipes against your own JavaScript/TypeScript codebase, you'll need to use the [Moderne CLI](https://docs.moderne.io/user-documentation/moderne-cli/getting-started/cli-intro) and [configure it to use JavaScript LSTs](https://docs.moderne.io/user-documentation/moderne-cli/how-to-guides/javascript):

```bash
mod run . --recipe=MigrateUtilFunctions
```

## License

See [LICENSE](./LICENSE) file for details.
