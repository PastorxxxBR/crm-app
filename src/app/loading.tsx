export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="text-center">
                {/* Spinner animado */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                </div>

                {/* Texto */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Carregando...
                </h2>
                <p className="text-gray-600">
                    Aguarde enquanto preparamos tudo para você
                </p>

                {/* Barra de progresso animada */}
                <div className="w-64 h-2 bg-gray-200 rounded-full mt-6 mx-auto overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
