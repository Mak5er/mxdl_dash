type Option = {
  label: string;
  value: string;
};

type FilterBarProps = {
  children?: React.ReactNode;
  options?: Array<{
    name: string;
    label: string;
    value?: string;
    items: Option[];
  }>;
  searchName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
};

export function FilterBar({
  children,
  options = [],
  searchName = "search",
  searchValue,
  searchPlaceholder = "search",
}: FilterBarProps) {
  return (
    <form className="grid gap-3 border border-white/10 bg-zinc-950 p-4 md:grid-cols-4">
      <input
        name={searchName}
        defaultValue={searchValue}
        placeholder={searchPlaceholder}
        className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-white/40"
      />
      {options.map((option) => (
        <select
          key={option.name}
          name={option.name}
          defaultValue={option.value ?? ""}
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
        >
          <option value="">{option.label}</option>
          {option.items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      ))}
      {children}
      <button className="border border-white bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-zinc-200">
        Apply
      </button>
    </form>
  );
}

