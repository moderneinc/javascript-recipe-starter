import {RecipeRegistry} from '@openrewrite/rewrite';
import {MigrateUtilFunctions} from './migrate-util-functions';
import {SayHelloRecipe} from './say-hello-recipe';
import {SemanticForwardRefMigration} from './semantic-matching';

export { MigrateUtilFunctions } from './migrate-util-functions';
export { SayHelloRecipe } from './say-hello-recipe';
export { FindMethodCalls } from './find-method-calls';
export { SemanticForwardRefMigration } from './semantic-matching';

/**
 * Activates and registers all recipes in this module.
 * This function is called by OpenRewrite to discover available recipes.
 *
 * Note: FindMethodCalls is not included because it requires options
 * and cannot be instantiated without them.
 *
 * @param registry The recipe registry to register recipes with
 */
export function activate(registry: RecipeRegistry) {
    registry.register(MigrateUtilFunctions);
    registry.register(SayHelloRecipe);
    registry.register(SemanticForwardRefMigration);
}
