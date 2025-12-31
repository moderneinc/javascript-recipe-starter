import {JavaScript, RecipeMarketplace} from '@openrewrite/rewrite';
import {FindMethodCalls} from './find-method-calls';
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
 * @param marketplace The recipe marketplace to install recipes into
 */
export async function activate(marketplace: RecipeMarketplace) {
    await marketplace.install(FindMethodCalls, JavaScript);
    await marketplace.install(MigrateUtilFunctions, JavaScript);
    await marketplace.install(SayHelloRecipe, JavaScript);
    await marketplace.install(SemanticForwardRefMigration, JavaScript);
}
