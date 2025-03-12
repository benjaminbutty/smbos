// Simplified DatabaseCell.tsx
import React from 'react';
import { Cell } from './types';
import { 
  TextCell, 
  NumberCell, 
  SelectCell, 
  BooleanCell, 
  DateCell 
} from './cells';
import { COLUMN_TYPES } from './useColumns';

interface DatabaseCellProps {
  cell: Cell;
  onUpdate: (value: string) => void;
  isSelected: boolean;
  rowHovered: boolean;
  onFocus: () => void;
}

export function DatabaseCell(props: DatabaseCellProps) {
  const { cell } = props;
  
  // Directly use the cell's type - no need to check metadata for actual type
  switch (cell.type) {
    case COLUMN_TYPES.NUMBER:
      return (
        <NumberCell 
          {...props} 
          format={cell.metadata?.format || 'plain'}
        />
      );
      
    case COLUMN_TYPES.SELECT:
      return (
        <SelectCell 
          {...props} 
          options={cell.metadata?.options || []}
        />
      );
      
    case COLUMN_TYPES.DATE:
      return <DateCell {...props} />;
      
    case COLUMN_TYPES.BOOLEAN:
      return <BooleanCell {...props} />;
      
    case COLUMN_TYPES.TEXT:
    default:
      return <TextCell {...props} />;
  }
}