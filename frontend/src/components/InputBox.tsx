function Inputbox({
  label,
  type,
  placeholder,
  setValue,
}: {
  label: string;
  type: string;
  placeholder: string;
  setValue: (value: string) => void;
}) {
  return (
    <div className="w-full">
      <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-widest">
        {label}
      </label>
      <input
        onChange={(e) => setValue(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="glass-input w-full px-4 py-3 sm:py-2.5 rounded-xl text-base sm:text-sm"
      />
    </div>
  );
}

export default Inputbox;
