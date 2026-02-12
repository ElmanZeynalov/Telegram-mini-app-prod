"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login failed")
            }

            // Redirect to admin dashboard
            router.push("/")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[oklch(0.14_0.015_240)]">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Content Container */}
            <div className={`w-full max-w-md px-4 relative z-10 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                {/* Logo/Brand Section */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4 shadow-xl shadow-primary/10 animate-smooth-in">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                        Legal Aid Bot
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Admin Panelinə Giriş
                    </p>
                </div>

                {/* Login Card */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-1 pb-4 pt-8 text-center border-b border-border/10">
                        <CardTitle className="text-xl font-bold">Xoş Gəlmisiniz</CardTitle>
                        <CardDescription className="text-muted-foreground/80">
                            Etibarnamələrinizi daxil edərək sistemə giriş edin
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit} className="pt-6">
                        <CardContent className="space-y-5">
                            {error && (
                                <div className="bg-destructive/15 border border-destructive/20 text-destructive text-xs p-3.5 rounded-xl text-center font-semibold animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                    E-poçt Ünvanı
                                </Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                        <Mail className="h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        className="pl-10 h-12 bg-muted/30 border-border/40 focus:bg-muted/50 transition-all rounded-xl text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="password" title="Parol" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                    Şifrə
                                </Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-12 bg-muted/30 border-border/40 focus:bg-muted/50 transition-all rounded-xl text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pb-8 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Giriş edilir...
                                    </>
                                ) : (
                                    <>
                                        Daxil ol
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer Copy */}
                <p className="mt-8 text-center text-xs text-muted-foreground font-medium">
                    &copy; {new Date().getFullYear()} Legal Aid Bot. Bütün hüquqlar qorunur.
                </p>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    )
}
