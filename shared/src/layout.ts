import type { Task } from './types.js';

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const MARGIN_PT = 40;
const COLUMN_GAP_PT = 30;
const TASK_BOTTOM_MARGIN_PT = 20;
const LINE_HEIGHT_MULTIPLIER = 1.4;

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

function pxToPt(px: number): number {
    return px * 0.75;
}

export function calculateLayoutMetrics(config: LayoutConfig, maxLinesInTasks: number): LayoutMetrics {
    const pageWidth = config.orientation === 'portrait' ? A4_WIDTH_PT : A4_HEIGHT_PT;
    const pageHeight = config.orientation === 'portrait' ? A4_HEIGHT_PT : A4_WIDTH_PT;
    const contentWidth = pageWidth - (2 * MARGIN_PT);
    const headerHeight = 0;
    const contentHeight = pageHeight - (2 * MARGIN_PT) - headerHeight;
    const columnWidth = config.columns === 1
        ? contentWidth
        : (contentWidth - (COLUMN_GAP_PT * (config.columns - 1))) / config.columns;
    const fontSizePt = pxToPt(config.fontSize);
    const lineHeight = fontSizePt * LINE_HEIGHT_MULTIPLIER;
    const taskHeight = (maxLinesInTasks * lineHeight) + TASK_BOTTOM_MARGIN_PT;
    const tasksPerColumn = Math.floor(contentHeight / taskHeight);
    const tasksPerPage = tasksPerColumn * config.columns;

    return {
        pageWidth,
        pageHeight,
        contentWidth,
        contentHeight,
        columnWidth,
        taskHeight,
        tasksPerColumn,
        tasksPerPage
    };
}

export function paginateTasks(tasks: Task[], tasksPerPage: number): PageLayout[] {
    const pages: PageLayout[] = [];

    if (tasksPerPage <= 0) {
        throw new Error('Rozmiar czcionki jest zbyt duży - zmniejsz go lub zwiększ liczbę kolumn');
    }

    for (let i = 0; i < tasks.length; i += tasksPerPage) {
        const pageTasks = tasks.slice(i, i + tasksPerPage);
        pages.push({
            pageNumber: pages.length + 1,
            tasks: pageTasks
        });

        if (pages.length > 50) {
            throw new Error('PDF przekroczyłby 50 stron. Zmniejsz liczbę zadań, rozmiar czcionki lub zwiększ liczbę kolumn.');
        }
    }

    return pages;
}

export function getTaskLineCount(task: Task): number {
    const isMultiplication = task.operations.includes('*');

    if (!isMultiplication) {
        return task.numbers.length + 1;
    }

    const n2 = task.numbers[1];
    const n2Digits = Math.abs(n2).toString().length;

    if (n2Digits > 1) {
        return 2 + n2Digits + 1;
    }

    return 2 + 1;
}

export function getMaxLineCount(tasks: Task[]): number {
    if (tasks.length === 0) return 2;
    return Math.max(...tasks.map(t => getTaskLineCount(t)));
}
