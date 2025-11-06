# JavaScript Recipe Starter

A starter repository for learning how to create [OpenRewrite](https://github.com/openrewrite/rewrite) recipes for JavaScript and TypeScript. This repo includes example recipes with comprehensive tests, demonstrating the full project setup you need to author and test your own recipes.

## Getting started

New to OpenRewrite JavaScript recipe development? Start by checking out the [OpenRewrite documentation](https://docs.openrewrite.org/) and our [JavaScript LST examples doc](https://docs.openrewrite.org/concepts-and-explanations/javascript-lst-examples).

## Example recipes

This repository includes example recipes that demonstrate different authoring approaches:

- **MigrateUtilFunctions** - Replaces deprecated Node.js `util` type checking methods (like `util.isArray()`) with native JavaScript equivalents (like `Array.isArray()`). Demonstrates pattern-based, declarative recipe authoring using `pattern` and `rewrite()` rules.

- **SayHelloRecipe** - Adds a `hello()` method to JavaScript/TypeScript classes that don't already have one. Demonstrates visitor-based recipe authoring with manual LST manipulation and the template API.

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

## Running your recipes

To run these recipes against your own JavaScript/TypeScript codebase, you'll need to use the [Moderne CLI](https://docs.moderne.io/user-documentation/moderne-cli/getting-started/cli-intro) and [configure it to use JavaScript LSTs](https://docs.moderne.io/user-documentation/moderne-cli/how-to-guides/javascript):

```bash
mod run . --recipe=MigrateUtilFunctions
```

## Project structure

```
javascript-recipe-starter/
├── src/
│   ├── migrate-util-functions.ts
│   ├── say-hello-recipe.ts
│   └── index.ts
├── test/
│   ├── migrate-util-functions.test.ts
│   └── say-hello-recipe.test.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

## License

See [LICENSE](./LICENSE) file for details.
