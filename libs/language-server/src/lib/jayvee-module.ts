import {
  DefaultSharedModuleContext,
  LangiumServices,
  LangiumSharedServices,
  Module,
  PartialLangiumServices,
  createDefaultModule,
  createDefaultSharedModule,
  inject,
} from 'langium';

import {
  JayveeGeneratedModule,
  JayveeGeneratedSharedModule,
} from './ast/generated/module';
import { JayveeCompletionProvider } from './completion/jayvee-completion-provider';
import { JayveeHoverProvider } from './hover/jayvee-hover-provider';
import { JayveeValidationRegistry } from './validation/validation-registry';
import { BlockValidator } from './validation/validators/block-validator';
import { CellRangeSelectionValidator } from './validation/validators/cell-range-selection-validator';
import { ColumnExpressionValidator } from './validation/validators/column-expression-validator';
import { ModelValidator } from './validation/validators/model-validator';
import { PipeValidator } from './validation/validators/pipe-validator';
import { PipelineValidator } from './validation/validators/pipeline-validator';

/**
 * Declaration of custom services - add your own service classes here.
 */
export interface JayveeAddedServices {
  validation: {
    ModelValidator: ModelValidator;
    PipelineValidator: PipelineValidator;
    PipeValidator: PipeValidator;
    BlockValidator: BlockValidator;
    CellRangeSelectionValidator: CellRangeSelectionValidator;
    ColumnExpressionValidator: ColumnExpressionValidator;
  };
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type JayveeServices = LangiumServices & JayveeAddedServices;

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const JayveeModule: Module<
  JayveeServices,
  PartialLangiumServices & JayveeAddedServices
> = {
  validation: {
    ValidationRegistry: (services) => new JayveeValidationRegistry(services),
    ModelValidator: () => new ModelValidator(),
    PipelineValidator: () => new PipelineValidator(),
    PipeValidator: () => new PipeValidator(),
    BlockValidator: () => new BlockValidator(),
    CellRangeSelectionValidator: () => new CellRangeSelectionValidator(),
    ColumnExpressionValidator: () => new ColumnExpressionValidator(),
  },
  lsp: {
    CompletionProvider: (services: LangiumServices) =>
      new JayveeCompletionProvider(services),
    HoverProvider: (services: LangiumServices) =>
      new JayveeHoverProvider(services),
  },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createJayveeServices(context: DefaultSharedModuleContext): {
  shared: LangiumSharedServices;
  Jayvee: JayveeServices;
} {
  const shared = inject(
    createDefaultSharedModule(context),
    JayveeGeneratedSharedModule,
  );
  const Jayvee = inject(
    createDefaultModule({ shared }),
    JayveeGeneratedModule,
    JayveeModule,
  );
  shared.ServiceRegistry.register(Jayvee);
  return { shared, Jayvee };
}
