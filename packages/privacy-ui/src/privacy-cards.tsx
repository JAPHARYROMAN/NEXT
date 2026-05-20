'use client';

import { Surface } from '@next/ui';

export interface PrivacyCard {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export interface PrivacyCardsProps {
  readonly cards: readonly PrivacyCard[];
}

export function PrivacyCards({ cards }: PrivacyCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2" role="list">
      {cards.map((card) => (
        <li key={card.id}>
          <Surface bordered className="flex h-full flex-col p-5">
            <h3 className="text-sm font-medium text-fg">{card.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{card.description}</p>
            {card.actionLabel && card.onAction ? (
              <button
                type="button"
                onClick={card.onAction}
                className="mt-4 self-start text-sm text-accent hover:underline"
              >
                {card.actionLabel}
              </button>
            ) : null}
          </Surface>
        </li>
      ))}
    </ul>
  );
}
