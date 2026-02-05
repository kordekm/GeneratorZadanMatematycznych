import React from 'react';
import type { Task } from '../types';

interface TaskRendererProps {
  task: Task;
  fontSize: number;
  showNumber: boolean;
  gridMode: 'off' | 'light' | 'medium';
}

export function TaskRenderer({ task, fontSize, showNumber, gridMode }: TaskRendererProps) {
  const lineHeight = fontSize * 1.4;
  
  const borderColor = gridMode === 'light' ? '#d0d0d0' : gridMode === 'medium' ? '#a0a0a0' : 'transparent';
  const borderStyle = gridMode !== 'off' ? `1px solid ${borderColor}` : 'none';
  
  // Liczba kolumn = długość wyniku (najdłuższa liczba)
  const resultDigits = Math.abs(task.answer).toString().length + (task.answer < 0 ? 1 : 0);
  const maxDigits = Math.max(resultDigits, ...task.numbers.map(n => Math.abs(n).toString().length));
  
  // Przygotuj wszystkie wiersze (cyfry składników + wynik)
  const allRows = [
    ...task.numbers.map((num, idx) => ({
      isLast: idx === task.numbers.length - 1,
      number: num,
      isResult: false,
      operation: idx === 0 ? null : task.operations[idx - 1],
    })),
    {
      isLast: false,
      number: task.answer,
      isResult: true,
      operation: null,
    }
  ];
  
  return (
    <div className="mb-6">
      {showNumber && (
        <div className="font-mono mb-2" style={{ fontSize: fontSize * 0.7 }}>
          {task.id}.
        </div>
      )}
      <table 
        style={{
          borderCollapse: 'collapse',
          fontFamily: 'Roboto Mono, monospace',
          fontSize,
        }}
      >
        <tbody>
          {allRows.map((row, rowIdx) => {
            const numStr = row.number.toString();
            const digits = numStr.split('');
            const paddingCount = Math.max(0, maxDigits - digits.length);
            
            return (
              <React.Fragment key={rowIdx}>
                <tr>
                  <td 
                    style={{ 
                      textAlign: 'center',
                      width: `${fontSize}px`,
                      height: `${lineHeight}px`,
                      border: 'none',
                      padding: 0,
                    }}
                  >
                    {row.isLast && !row.isResult && row.operation}
                  </td>
                  {/* Puste komórki po lewej stronie */}
                  {Array(paddingCount).fill(0).map((_, i) => (
                    <td 
                      key={`pad-${i}`}
                      style={{ 
                        width: `${fontSize * 0.65}px`,
                        height: `${lineHeight}px`,
                        border: borderStyle,
                        padding: 0,
                        textAlign: 'center',
                        color: row.isResult ? 'white' : 'inherit',
                      }}
                    >
                      {'\u00A0'}
                    </td>
                  ))}
                  {/* Cyfry */}
                  {digits.map((digit, i) => (
                    <td 
                      key={i}
                      style={{ 
                        width: `${fontSize * 0.65}px`,
                        height: `${lineHeight}px`,
                        border: borderStyle,
                        padding: 0,
                        textAlign: 'center',
                        color: row.isResult ? 'white' : 'inherit',
                      }}
                    >
                      {digit}
                    </td>
                  ))}
                </tr>
                {row.isLast && !row.isResult && (
                  <tr>
                    <td colSpan={maxDigits + 1} style={{ padding: 0 }}>
                      <div style={{ borderTop: '2px solid black', margin: '2px 0' }} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
