import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gray-900">
            <div className="w-full max-w-md space-y-8 px-4 rounded-xl bg-gray-800 p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Fashion CRM</h1>
                    <p className="text-gray-400">Entre para gerenciar sua loja</p>
                </div>
                <AuthForm />
            </div>
        </div>
    )
}
