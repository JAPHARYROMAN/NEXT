export interface ChatMessage {
  readonly id: string;
  readonly author: string;
  readonly body: string;
  readonly pinned?: boolean;
  readonly highlight?: boolean;
}

export interface QuestionItem {
  readonly id: string;
  readonly author: string;
  readonly body: string;
  readonly votes: number;
}
