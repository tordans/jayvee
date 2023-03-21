import {
  AttributeValueType,
  BlockMetaInformation,
  IOType,
} from '@jvalue/language-server';

export class CellRangeSelectorMetaInformation extends BlockMetaInformation {
  constructor() {
    super(
      'CellRangeSelector',
      {
        select: {
          type: AttributeValueType.CELL_RANGE,
          docs: {
            description: 'The cell range to select.',
            examples: [
              {
                code: 'select: range A1:E*',
                description:
                  'Select cells from `A1` to the last cell of column `E`.',
              },
            ],
          },
        },
      },
      IOType.SHEET,
      IOType.SHEET,
    );
    this.docs.description =
      'Selects a subset of a `Sheet` to produce a new `Sheet`.';
    this.docs.examples = [
      {
        code: blockExample,
        description:
          'Selects the cells in the given range and produces a new `Sheet` containing only the selected cells.',
      },
    ];
  }
}

const blockExample = `block CarsCoreDataSelector oftype CellRangeSelector {
  select: range A1:E*;
}`;
