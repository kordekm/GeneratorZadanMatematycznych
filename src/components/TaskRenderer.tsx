import { useMemo } from 'react';
import type { Task } from '../types';

interface TaskRendererProps {
  task: Task;
  fontSize: number;
  showNumber: boolean;
  gridMode: 'off' | 'light' | 'medium';
  showAnswers: boolean;
}

export function TaskRenderer({ task, fontSize, showNumber, gridMode, showAnswers }: TaskRendererProps) {
  const lineHeight = fontSize * 1.4;
  const cellWidth = fontSize * 0.65;

  // Check if this is a multiplication task
  const isMultiplication = task.operations.includes('*');

  const rows = useMemo(() => {
    if (!isMultiplication) {
      // Standard Add/Sub Logic
      return [
        ...task.numbers.map((num, idx) => ({
            number: num,
            operation: idx === 0 ? null : task.operations[idx - 1],
            isResult: false,
            isPartial: false,
            offset: 0,
            hasLineBelow: idx === task.numbers.length - 1
        })),
        {
            number: task.answer,
            operation: null,
            isResult: true,
            isPartial: false,
            offset: 0,
            hasLineBelow: false
        }
      ];
    } else {
        // Multiplication Logic
        const n1 = task.numbers[0];
        const n2 = task.numbers[1];
        const n2Digits = Math.abs(n2).toString().split('').map(Number).reverse();

        const partials = n2Digits.map((d, i) => ({
            val: n1 * d,
            offset: i
        }));

        const resultRows = [
            { number: n1, operation: null, isResult: false, isPartial: false, offset: 0, hasLineBelow: false },
            { number: n2, operation: '*', isResult: false, isPartial: false, offset: 0, hasLineBelow: true }
        ];

        if (partials.length > 1) {
             partials.forEach((p, idx) => {
                 resultRows.push({
                     number: p.val,
                     operation: null,
                     isResult: false,
                     isPartial: true,
                     offset: p.offset,
                     hasLineBelow: idx === partials.length - 1
                 });
             });
        }

        resultRows.push({
            number: task.answer,
            operation: null,
            isResult: true,
            isPartial: false,
            offset: 0,
            hasLineBelow: false
        });

        return resultRows;
    }
  }, [task, isMultiplication]);

  let maxGridWidth = 0;
  rows.forEach(r => {
      const len = r.number.toString().length;
      maxGridWidth = Math.max(maxGridWidth, len + r.offset);
  });

  // Determine border style based on gridMode
  const getBorderStyle = () => {
    if (gridMode === 'off') return 'none';
    if (gridMode === 'light') return '1px solid #d0d0d0';  // Jasna kratka - jasny szary
    if (gridMode === 'medium') return '1px solid #808080'; // Średnia kratka - ciemny szary
    return 'none';
  };

  const cellBorder = getBorderStyle();

  return (
    <div className="mb-6">
      {showNumber && (
        <div className="font-mono mb-2" style={{ fontSize: fontSize * 0.7 }}>
          {task.id}.
        </div>
      )}
      
      {/* CSS Grid implementation */}
      <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize }}>
        {rows.map((row, rowIdx) => {
          const numStr = Math.abs(row.number).toString();
          const digits = numStr.split('');
          const totalCells = maxGridWidth;
          const leftPadding = Math.max(0, totalCells - (digits.length + row.offset));
          
          const shouldHideContent = (row.isResult || row.isPartial) && !showAnswers;

          return (
            <div
              key={rowIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: `${fontSize}px repeat(${totalCells}, ${cellWidth}px)`,
                marginBottom: row.hasLineBelow ? '2px' : '0',
                borderBottom: row.hasLineBelow ? '2px solid black' : 'none',
              }}
            >
              {/* Operation cell */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: `${lineHeight}px`,
                }}
              >
                {!row.isResult && !row.isPartial && row.operation}
              </div>

              {/* Left padding cells */}
              {Array(leftPadding).fill(0).map((_, i) => (
                <div
                  key={`pad-left-${i}`}
                  style={{
                    border: cellBorder,
                    height: `${lineHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  {'\u00A0'}
                </div>
              ))}

              {/* Digit cells */}
              {digits.map((digit, i) => (
                <div
                  key={`digit-${i}`}
                  style={{
                    border: cellBorder,
                    height: `${lineHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: shouldHideContent ? 'transparent' : 'inherit',
                    boxSizing: 'border-box',
                  }}
                >
                  {digit}
                </div>
              ))}

              {/* Right padding (offset) cells */}
              {Array(row.offset).fill(0).map((_, i) => (
                <div
                  key={`pad-right-${i}`}
                  style={{
                    border: cellBorder,
                    height: `${lineHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'transparent',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
