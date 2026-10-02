"use client";

// Reusable search input — Topics aur Questions list dono pages isi ko use karenge.
// value/onChange parent se aate hain (controlled component), isliye is component
// ko khud apna state rakhne ki zaroorat nahi.
export default function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full max-w-xs">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-[#1b2231] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#b480ff]"
      />
    </div>
  );
}
