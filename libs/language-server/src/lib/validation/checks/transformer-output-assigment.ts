// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * See the FAQ section of README.md for an explanation why the following ESLint rule is disabled for this file.
 */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

// eslint-disable-next-line import/no-cycle
import {
  EvaluationContext,
  EvaluationStrategy,
  evaluateExpression,
} from '../../ast/expressions/evaluation';
import { convertsImplicitlyTo } from '../../ast/expressions/operator-type-computer';
import { inferExpressionType } from '../../ast/expressions/type-inference';
import {
  Expression,
  TransformerOutputAssignment,
  isExpression,
  isExpressionLiteral,
} from '../../ast/generated/ast';
import { inferBasePropertyValuetype } from '../../ast/model-util';
import { ValidationContext } from '../validation-context';

export function validateTransformerOutputAssignment(
  port: TransformerOutputAssignment,
  context: ValidationContext,
): void {
  checkOutputValueTyping(port, context);
}

function checkOutputValueTyping(
  outputAssignment: TransformerOutputAssignment,
  context: ValidationContext,
): void {
  const assignmentExpression = outputAssignment?.expression;
  if (assignmentExpression === undefined) {
    return;
  }

  const outputType = outputAssignment?.outPortName?.ref?.valueType;
  if (outputType === undefined) {
    return;
  }

  const inferredType = inferExpressionType(assignmentExpression, context);
  if (inferredType === undefined) {
    return;
  }

  const expectedType = inferBasePropertyValuetype(outputType);
  if (expectedType === undefined) {
    return;
  }

  if (!convertsImplicitlyTo(inferredType, expectedType)) {
    context.accept(
      'error',
      `The value needs to be of type ${expectedType} but is of type ${inferredType}`,
      {
        node: assignmentExpression,
      },
    );
    return;
  }

  if (isExpression(assignmentExpression)) {
    checkExpressionSimplification(assignmentExpression, context);
  }
}

function checkExpressionSimplification(
  expression: Expression,
  context: ValidationContext,
): void {
  if (isExpressionLiteral(expression)) {
    return;
  }

  const evaluatedExpression = evaluateExpression(
    expression,
    new EvaluationContext(), // TODO
    EvaluationStrategy.EXHAUSTIVE,
    context,
  );
  if (evaluatedExpression !== undefined) {
    context.accept(
      'info',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `The expression can be simplified to ${evaluatedExpression}`,
      { node: expression },
    );
  }
}
