export default function Button({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 sm:py-2.5 rounded-xl font-semibold text-sm text-white
        bg-gradient-to-r from-indigo-500 to-violet-600
        hover:from-indigo-400 hover:to-violet-500
        active:scale-[0.98] transition-all duration-200
        shadow-lg shadow-indigo-500/25"
    >
      {label}
    </button>
  );
}
