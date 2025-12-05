export function Card({ title, value, trend }: { title: string; value: string; trend: string }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
        </div>
    )
}
