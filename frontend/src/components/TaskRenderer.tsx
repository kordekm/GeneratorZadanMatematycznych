import { getTaskRows } from '../../../shared/dist/index.js';
import type { Task } from '../types';

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

  const isDivision = task.operations.includes('÷');
  const rows = getTaskRows(task);


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
