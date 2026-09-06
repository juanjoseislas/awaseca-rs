type OpenTextFieldProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export function OpenTextField({ value, onChange, placeholder }: OpenTextFieldProps) {
  return (
    <textarea
      class="enter-el min-h-[140px] w-full rounded-button border-[1.5px] border-[#e2e2e2] px-4 py-3 text-base text-acento1 outline-none transition-colors focus:border-azul"
      value={value}
      placeholder={placeholder}
      onInput={(event) => onChange((event.target as HTMLTextAreaElement).value)}
    />
  );
}
