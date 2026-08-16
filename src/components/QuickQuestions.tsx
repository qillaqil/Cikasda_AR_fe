interface QuickQuestionsProps {
  items: string[];
  onSelect: (question: string) => void;
}

export default function QuickQuestions({ items, onSelect }: QuickQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className="rounded-full border border-[rgba(93,235,235,0.3)] bg-transparent px-3 py-2 text-left text-xs font-medium text-[#69E8E8] transition hover:border-[rgba(93,235,235,0.5)] hover:bg-[rgba(93,235,235,0.06)] hover:shadow-[0_0_15px_rgba(93,235,235,0.12)] sm:text-sm"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
