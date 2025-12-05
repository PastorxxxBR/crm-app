export function RecentSales() {
    return (
        <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                        {String.fromCharCode(65 + i)}
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Cliente Exemplo {i}</p>
                        <p className="text-sm text-gray-500">cliente{i}@email.com</p>
                    </div>
                    <div className="ml-auto font-medium">+R$ {(Math.random() * 100).toFixed(2)}</div>
                </div>
            ))}
        </div>
    )
}
