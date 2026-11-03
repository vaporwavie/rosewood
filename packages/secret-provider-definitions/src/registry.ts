import { makeSecretProviderDefinitionRegistry } from "@rosewood/secret-provider-core/shared/definition";
import * as OnePassword from "@rosewood/secret-provider-onepassword/shared/definition";

export const builtInSecretProviderDefinitions = makeSecretProviderDefinitionRegistry([
  OnePassword.definition,
]);
