import type { Config, Task } from '../types';
import { calculateLayoutMetrics, getMaxGridWidth, getMaxLineCount, paginateTasks } from '../utils/layout';
import { TaskRenderer } from './TaskRenderer';

interface PreviewProps {
  config: Config;
  tasks: Task[];
}

export function Preview({ config, tasks }: PreviewProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center h-full">
        <p className="text-gray-500">Brak zadań do wyświetlenia</p>
      </div>
    );
  }
  
  const maxLines = getMaxLineCount(tasks);
  const metrics = calculateLayoutMetrics(config, maxLines);
  const pages = paginateTasks(tasks, metrics.tasksPerPage);
  
  return (
    <div className="bg-gray-100 rounded-lg shadow-lg p-8">
      <div className="space-y-8">
        {pages.map((page) => (
          <div
            key={page.pageNumber}
            // className="bg-white mx-auto shadow-md print-page"
            style={{
              width: `${metrics.pageWidth * 0.75}px`,
              minHeight: `${metrics.pageHeight * 0.75}px`,
              padding: '30px',
            }}
          >
            
            <div 
              className={`grid gap-8`}
              style={{
                gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
              }}
            >
              {(() => {
                const maxGridWidth = getMaxGridWidth(page.tasks);
                return page.tasks.map((task) => (
                  <TaskRenderer
                    key={task.id}
                    task={task}
                    fontSize={config.fontSize}
                    showNumber={config.showTaskNumbers}
                    gridMode={config.gridMode}
                    showAnswers={config.showAnswers !== 'none'}
                    maxGridWidth={maxGridWidth}
                  />
                ));
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
