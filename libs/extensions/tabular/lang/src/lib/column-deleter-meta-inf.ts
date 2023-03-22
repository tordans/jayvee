import {
  BlockMetaInformation,
  CellRangeWrapper,
  IOType,
  PropertyValuetype,
  isCellRangeLiteral,
  isCollectionLiteral,
  isColumnWrapper,
  validateTypedCollection,
} from '@jvalue/language-server';

export class ColumnDeleterMetaInformation extends BlockMetaInformation {
  constructor() {
    super(
      'ColumnDeleter',
      {
        delete: {
          type: PropertyValuetype.COLLECTION,
          validation: (property, accept) => {
            const propertyValue = property.value;
            if (!isCollectionLiteral(propertyValue)) {
              return;
            }

            const { validItems, invalidItems } = validateTypedCollection(
              propertyValue,
              isCellRangeLiteral,
            );

            invalidItems.forEach((invalidValue) =>
              accept(
                'error',
                'Only cell ranges are allowed in this collection',
                {
                  node: invalidValue,
                },
              ),
            );

            for (const collectionValue of validItems) {
              if (!CellRangeWrapper.canBeWrapped(collectionValue)) {
                continue;
              }
              const semanticCellRange = new CellRangeWrapper(collectionValue);
              if (!isColumnWrapper(semanticCellRange)) {
                accept('error', 'An entire column needs to be selected', {
                  node: semanticCellRange.astNode,
                });
              }
            }
          },
          docs: {
            description: 'The columns to delete.',
            examples: [
              {
                code: 'delete: [column B]',
                description: 'Delete column B.',
              },
              {
                code: 'delete: [column B, column C]',
                description: 'Delete column B and column C.',
              },
            ],
            validation: 'You need to specify at least one column.',
          },
        },
      },
      IOType.SHEET,
      IOType.SHEET,
    );
    this.docs.description =
      'Deletes columns from a `Sheet`. Column IDs of subsequent columns will be shifted accordingly, so there will be no gaps.';
    this.docs.examples = [
      {
        code: blockExample,
        description: 'Deletes column B (i.e. the second column).',
      },
    ];
  }
}

const blockExample = `block MpgColumnDeleter oftype ColumnDeleter {
  delete: [column B];
}`;
