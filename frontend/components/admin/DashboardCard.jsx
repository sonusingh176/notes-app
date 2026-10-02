// Dashboard ka stat card — e.g. "Total Topics: 5"
// Server component hi rakha hai (kisi hook ki zaroorat nahi), AppHeader jaise client
// component ke bina bhi chal jayega.
export default function DashboardCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1b2231] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
