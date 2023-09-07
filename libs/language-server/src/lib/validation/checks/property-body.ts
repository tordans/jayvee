// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * See https://jvalue.github.io/jayvee/docs/dev/guides/working-with-the-ast/ for why the following ESLint rule is disabled for this file.
 */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { assertUnreachable } from 'langium';

import { EvaluationContext } from '../../ast/expressions/evaluation';
import {
  PropertyAssignment,
  PropertyBody,
  isBlockDefinition,
  isBuiltinConstrainttypeDefinition,
  isReferenceableBlocktypeDefinition,
} from '../../ast/generated/ast';
import { BlockMetaInformation } from '../../meta-information/block-meta-inf';
import { MetaInformation } from '../../meta-information/meta-inf';
import { getConstraintMetaInf } from '../../meta-information/meta-inf-registry';
import { ValidationContext } from '../validation-context';
import { checkUniqueNames } from '../validation-util';

import { checkBlocktypeSpecificPropertyBody } from './blocktype-specific/property-body';
import { validatePropertyAssignment } from './property-assignment';

export function validatePropertyBody(
  propertyBody: PropertyBody,
  validationContext: ValidationContext,
  evaluationContext: EvaluationContext,
): void {
  const properties = propertyBody?.properties ?? [];
  checkUniqueNames(properties, validationContext);

  const metaInf = inferMetaInformation(propertyBody);
  if (metaInf === undefined) {
    return;
  }

  checkPropertyCompleteness(
    propertyBody,
    properties,
    metaInf,
    validationContext,
  );
  for (const property of propertyBody.properties) {
    validatePropertyAssignment(
      property,
      metaInf,
      validationContext,
      evaluationContext,
    );
  }
  if (validationContext.hasErrorOccurred()) {
    return;
  }

  checkCustomPropertyValidation(
    propertyBody,
    metaInf,
    validationContext,
    evaluationContext,
  );
}

function inferMetaInformation(
  propertyBody: PropertyBody,
): MetaInformation | undefined {
  const type = propertyBody.$container?.type.ref;
  if (type === undefined) {
    return undefined;
  }

  if (isBuiltinConstrainttypeDefinition(type)) {
    return getConstraintMetaInf(type);
  } else if (isReferenceableBlocktypeDefinition(type)) {
    if (!BlockMetaInformation.canBeWrapped(type)) {
      return;
    }
    return new BlockMetaInformation(type);
  }

  assertUnreachable(type);
}

function checkPropertyCompleteness(
  propertyBody: PropertyBody,
  properties: PropertyAssignment[],
  metaInf: MetaInformation,
  context: ValidationContext,
): void {
  const presentPropertyNames = properties.map((property) => property.name);
  const missingRequiredPropertyNames =
    metaInf.getMissingRequiredPropertyNames(presentPropertyNames);

  if (missingRequiredPropertyNames.length > 0) {
    context.accept(
      'error',
      `The following required properties are missing: ${missingRequiredPropertyNames
        .map((name) => `"${name}"`)
        .join(', ')}`,
      {
        node: propertyBody.$container,
        property: 'type',
      },
    );
  }
}

function checkCustomPropertyValidation(
  propertyBody: PropertyBody,
  metaInf: MetaInformation,
  validationContext: ValidationContext,
  evaluationContext: EvaluationContext,
): void {
  metaInf.validate(propertyBody, validationContext, evaluationContext);

  if (isBlockDefinition(propertyBody.$container)) {
    checkBlocktypeSpecificPropertyBody(
      propertyBody,
      validationContext,
      evaluationContext,
    );
  }
}
