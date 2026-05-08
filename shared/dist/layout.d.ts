import type { Task } from './types.js';
export interface LayoutConfig {
    fontSize: number;
    orientation: 'portrait' | 'landscape';
    columns: 1 | 2 | 3 | 4;
    showHeader: boolean;
}
export interface PageLayout {
    pageNumber: number;
    tasks: Task[];
}
export interface LayoutMetrics {
    pageWidth: number;
    pageHeight: number;
    contentWidth: number;
    contentHeight: number;
    columnWidth: number;
    taskHeight: number;
    tasksPerColumn: number;
    tasksPerPage: number;
}
export declare function calculateLayoutMetrics(config: LayoutConfig, maxLinesInTasks: number): LayoutMetrics;
export declare function paginateTasks(tasks: Task[], tasksPerPage: number): PageLayout[];
export declare function getTaskLineCount(task: Task): number;
export declare function getMaxLineCount(tasks: Task[]): number;
//# sourceMappingURL=layout.d.ts.map