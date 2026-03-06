export type Viewport = 'desktop' | 'mobile' | 'both';

export type IssueCategory =
  | 'typography'
  | 'spacing'
  | 'colors'
  | 'images'
  | 'layout'
  | 'content'
  | 'components';

export type IssueSeverity = 'critique' | 'important' | 'mineur';

export interface Issue {
  viewport: Viewport;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  location: string;
  suggestion: string;
}

export interface AnalysisResult {
  score_desktop: number | null;
  score_mobile: number | null;
  summary: string;
  issues: Issue[];
}

export interface ScreenshotRequest {
  url: string;
  viewport: 'desktop' | 'mobile';
}

export interface ScreenshotResponse {
  image: string; // base64
}

export interface AnalyzeRequest {
  figmaD?: string; // base64
  shotD?: string;  // base64
  figmaM?: string; // base64
  shotM?: string;  // base64
}

export type DevInputMode = 'url' | 'upload';

export interface ViewportPair {
  figma: string | null;
  dev: string | null;
}
