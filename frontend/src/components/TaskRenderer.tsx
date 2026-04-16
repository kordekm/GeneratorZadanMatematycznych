import { useMemo } from 'react';
import type { Task } from '../types';

interface Row {
  number: number;
  operation: string | null;
  isResult: boolean;
  isPartial: boolean;
  offset: number;
  hasLineBelow: boolean;
  isDivisionQuotient?: boolean;
  isDivisionDividend?: boolean;
  remainder?: number;
  divisor?: number;
}

interface TaskRendererProps {
  task: Task;
  fontSize: number;
  showNumber: boolean;
  gridMode: 'off' | 'light' | 'medium';
  showAnswers: boolean;
  maxGridWidth: number;
}

export function TaskRenderer({ task, fontSize, showNumber, gridMode, showAnswers, maxGridWidth }: TaskRendererProps) {
  const lineHeight = fontSize * 1.4;
  const cellWidth = fontSize * 0.65;

  // Check operation type
  const isMultiplication = task.operations.includes('*');
  const isDivision = task.operations.includes('÷');

  const rows = useMemo<Row[]>(() => {
    if (isDivision) {
      // Division Logic - Long Division Format
      const dividend = task.numbers[0];
      const divisor = task.numbers[1];
      const quotient = task.answer;
      const remainder = task.remainder || 0;
      
      // Calculate division steps
      const dividendStr = dividend.toString();
      const steps: Array<{
        type: 'subtract' | 'bring-down' | 'result';
        value: number;
        position: number;
      }> = [];
      
      let currentDividend = 0;
      
      for (let i = 0; i < dividendStr.length; i++) {
        currentDividend = currentDividend * 10 + parseInt(dividendStr[i]);
        
        if (currentDividend >= divisor) {
          const digitQuotient = Math.floor(currentDividend / divisor);
          const product = digitQuotient * divisor;
          const stepRemainder = currentDividend - product;
          
          steps.push({
            type: 'subtract',
            value: product,
            position: i
          });
          
          if (stepRemainder > 0 || i < dividendStr.length - 1) {
            steps.push({
              type: 'result',
              value: stepRemainder,
              position: i
            });
          }
          
          currentDividend = stepRemainder;
        }
      }
      
      // Build rows for division display
      const dividendLength = dividend.toString().length;
      
      const divisionRows: Row[] = [
        {
          number: quotient,
          operation: null,
          isResult: true,
          isPartial: false,
          offset: 0,
          hasLineBelow: true,
          isDivisionQuotient: true,
          remainder: remainder > 0 ? remainder : undefined
        },
        {
          number: dividend,
          operation: '÷',
          isResult: false,
          isPartial: false,
          offset: 0,
          hasLineBelow: false,
          isDivisionDividend: true,
          divisor: divisor
        }
      ];
      
      // Add intermediate steps with proper offset calculation
      steps.forEach((step) => {
        const rightAlignPosition = step.position + 1;
        const offset = Math.max(0, dividendLength - rightAlignPosition);
        
        if (step.type === 'subtract') {
          divisionRows.push({
            number: step.value,
            operation: '-',
            isResult: false,
            isPartial: true,
            offset: offset,
            hasLineBelow: true
          });
        } else if (step.type === 'result') {
          divisionRows.push({
            number: step.value,
            operation: null,
            isResult: false,
            isPartial: true,
            offset: offset,
            hasLineBelow: false
          });
        }
      });
      
      return divisionRows;
    } else if (!isMultiplication) {
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
  }, [task, isMultiplication, isDivision]);


  return (
    <div className="mb-6" style={{ marginRight: isDivision ? '60px' : '0' }}>
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
          
          // Special handling for division quotient with remainder
          const isDivisionQuotient = row.isDivisionQuotient;
          const divisionRemainder = row.remainder;
          const isDivisionDividend = row.isDivisionDividend;
          const divisor = row.divisor;

          let currentLineLeftPadding = leftPadding;
          let currentContentCells = digits.length + row.offset;

          if (!isDivision) {
            // Linia powinna mieć długość najszerszego z operandów lub wyniku
            const maxContentCells = Math.max(...rows.map(r => Math.abs(r.number).toString().length + r.offset));
            currentContentCells = maxContentCells;
            currentLineLeftPadding = Math.max(0, totalCells - maxContentCells);
          }

          const lineStartPosition = fontSize + (currentLineLeftPadding * cellWidth);
          const lineExtension = cellWidth * 0.3;
          const lineWidth = (currentContentCells * cellWidth) + lineExtension;

          return (
            <div key={rowIdx} style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `${fontSize}px repeat(${totalCells}, ${cellWidth}px)`,
                  marginBottom: row.hasLineBelow ? '2px' : '0',
                }}
              >
              {/* Operation cell - special handling for division */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: `${lineHeight}px`,
                }}
              >
                {isDivisionDividend ? '' : (!row.isResult && !row.isPartial && row.operation)}
              </div>

              {/* Left padding cells */}
              {Array(leftPadding).fill(0).map((_, i) => (
                <div
                  key={`pad-left-${i}`}
                  className={`grid-border-${gridMode}`}
                  style={{
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
              {digits.map((digit, i) => {
                const isLastDigit = i === digits.length - 1;
                const showDivisorHere = isLastDigit && isDivisionDividend && divisor !== undefined;
                
                return (
                  <div
                    key={`digit-${i}`}
                    className={`grid-border-${gridMode}`}
                    style={{
                      height: `${lineHeight}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: shouldHideContent ? 'transparent' : 'inherit',
                      boxSizing: 'border-box',
                      position: 'relative',
                    }}
                  >
                    {digit}
                    {showDivisorHere && (
                      <span style={{ 
                        position: 'absolute',
                        left: '100%',
                        whiteSpace: 'nowrap'
                      }}>
                        :{divisor}
                      </span>
                    )}
                  </div>
                );
              })}
              
              {/* Display remainder for division quotient */}
              {isDivisionQuotient && divisionRemainder !== undefined && !shouldHideContent && (
                <div
                  style={{
                    gridColumn: `span ${Math.max(1, totalCells - digits.length)}`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '8px',
                    fontSize: fontSize * 0.9,
                  }}
                >
                  r. {divisionRemainder}
                </div>
              )}

              {/* Right padding (offset) cells */}
              {Array(row.offset).fill(0).map((_, i) => (
                <div
                  key={`pad-right-${i}`}
                  className={`grid-border-${gridMode}`}
                  style={{
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
              
              {/* Horizontal line below content */}
              {row.hasLineBelow && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${lineStartPosition}px`,
                    bottom: '2px',
                    width: `${lineWidth}px`,
                    borderBottom: '2px solid black',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
