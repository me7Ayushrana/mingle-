export const NEED_TYPES = [
  'listen',
  'vent',
  'advice',
  'company',
  'inspire',
  'laugh',
] as const;

export type NeedType = (typeof NEED_TYPES)[number];

export interface NeedOption {
  id: NeedType;
  label: string;
  emoji: string;
}

export const NEED_OPTIONS: NeedOption[] = [
  { id: 'listen', label: 'Someone to listen', emoji: '👂' },
  { id: 'vent', label: 'Safe space to vent', emoji: '💨' },
  { id: 'advice', label: 'Gentle advice', emoji: '💡' },
  { id: 'company', label: 'Quiet company', emoji: '🤝' },
  { id: 'inspire', label: 'Inspiration', emoji: '🌟' },
  { id: 'laugh', label: 'Lighten the mood', emoji: '😄' },
];
