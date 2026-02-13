export type InputEventDetail<T> = {
  value: T;
  rawEvent: Event;
};

export type ChangeEventDetail<T> = {
  value: T;
  rawEvent: Event;
};

export type HeadingTag = "h2" | "h3" | "h4";

export interface CalculatorCardProps {
  title: string;
  subtitle?: string;
  headingTag?: HeadingTag;
  className?: string;
}

export interface NumberInputProps {
  id: string;
  label: string;
  value?: number | string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  inputMode?: "decimal" | "numeric";
  helpText?: string;
  inputEl?: HTMLInputElement | null;
}

export interface NumberInputEvents {
  input: InputEventDetail<number | null>;
  change: ChangeEventDetail<number | null>;
}

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectInputProps<T extends string | number = string> {
  id: string;
  label: string;
  options: Array<SelectOption<T>>;
  value?: T;
  disabled?: boolean;
  helpText?: string;
  selectEl?: HTMLSelectElement | null;
}

export interface SelectInputEvents<T extends string | number = string> {
  input: InputEventDetail<T>;
  change: ChangeEventDetail<T>;
}

export interface ResultDisplayProps {
  label: string;
  value: string | number;
  valueId?: string;
  helperText?: string;
  size?: "default" | "large";
}

export interface TemperatureDisplayProps {
  label?: string;
  temperature: string | number;
  unit?: string;
  valueId?: string;
  helperText?: string;
}
