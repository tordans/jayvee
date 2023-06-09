// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import { InternalValueRepresentation } from '@jvalue/jayvee-language-server';

import { ExecutionContext } from '../../execution-context';
import { implementsStatic } from '../../util/implements-static-decorator';
import { ConstraintExecutor } from '../constraint-executor';
import { TypedConstraintExecutorClass } from '../typed-constraint-executor-class';

@implementsStatic<TypedConstraintExecutorClass>()
export class RangeConstraintExecutor implements ConstraintExecutor {
  public static readonly type = 'RangeConstraint';

  isValid(
    value: InternalValueRepresentation,
    context: ExecutionContext,
  ): boolean {
    let numericValue: number;
    if (typeof value === 'string') {
      numericValue = Number.parseFloat(value);
    } else if (typeof value === 'number') {
      numericValue = value;
    } else {
      return false;
    }

    const lowerBound = context.getDecimalPropertyValue('lowerBound');
    const lowerBoundInclusive = context.getBooleanPropertyValue(
      'lowerBoundInclusive',
    );
    const upperBound = context.getDecimalPropertyValue('upperBound');
    const upperBoundInclusive = context.getBooleanPropertyValue(
      'upperBoundInclusive',
    );

    const lowerBoundFulfilled = lowerBoundInclusive
      ? lowerBound <= numericValue
      : lowerBound < numericValue;

    const upperBoundFulfilled = upperBoundInclusive
      ? numericValue <= upperBound
      : numericValue < upperBound;

    return lowerBoundFulfilled && upperBoundFulfilled;
  }
}
