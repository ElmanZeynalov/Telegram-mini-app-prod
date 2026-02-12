"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2, ChevronLeft, Shield, Key, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AdminUser {
    id: string
    email: string
    role: string // 'admin' or 'user'
    createdAt: string
}

export default function UsersPage() {
    // Create form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("user")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [createLoading, setCreateLoading] = useState(false)
    const [showCreatePassword, setShowCreatePassword] = useState(false)

    // List state
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [listLoading, setListLoading] = useState(true)

    // Password/Role Change Dialog State
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
    const [selectedAdminEmail, setSelectedAdminEmail] = useState<string>("")
    const [selectedAdminRole, setSelectedAdminRole] = useState<string>("user")
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")

    const router = useRouter()

    const fetchAdmins = async () => {
        try {
            const res = await fetch("/api/admin/administrators")
            if (res.status === 401) {
                router.push("/")
                return
            }
            if (res.ok) {
                const data = await res.json()
                setAdmins(data.admins)
            }
        } catch (err) {
            console.error("Failed to fetch admins", err)
        } finally {
            setListLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateLoading(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "İstifadəçi yaradıla bilmədi")
            }

            setSuccess(`İstifadəçi uğurla yaradıldı: ${data.user.email}`)
            setEmail("")
            setPassword("")
            fetchAdmins() // Refresh list
        } catch (err: any) {
            setError(err.message)
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu admini silmək istədiyinizə əminsiniz?")) return

        try {
            const res = await fetch(`/api/admin/administrators?id=${id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "İstifadəçi silinə bilmədi")
            }

            fetchAdmins() // Refresh list
        } catch (err: any) {
            alert(err.message)
        }
    }

    const openPasswordDialog = (admin: AdminUser) => {
        setSelectedAdminId(admin.id)
        setSelectedAdminEmail(admin.email)
        setSelectedAdminRole(admin.role)
        setNewPassword("")
        setShowPassword(false)
        setPasswordError("")
        setPasswordSuccess("")
        setIsPasswordDialogOpen(true)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedAdminId) return

        setPasswordLoading(true)
        setPasswordError("")
        setPasswordSuccess("")

        try {
            const res = await fetch("/api/admin/administrators", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedAdminId,
                    password: newPassword || undefined,
                    role: selectedAdminRole
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Məlumatlar yenilənə bilmədi")
            }

            setPasswordSuccess("Məlumatlar uğurla yeniləndi")
            setNewPassword("")
            setTimeout(() => {
                setIsPasswordDialogOpen(false)
                setPasswordSuccess("")
                fetchAdmins()
            }, 1000)
        } catch (err: any) {
            setPasswordError(err.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">İstifadəçi İdarəetməsi</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create User Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Yeni Admin Əlavə Et
                        </CardTitle>
                        <CardDescription>
                            Admin imtiyazları ilə yeni istifadəçi yaradın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 text-red-600 text-sm p-3 rounded-md font-medium">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md font-medium">
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="newuser@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Şifrə</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showCreatePassword ? "text" : "password"}
                                        placeholder="Təhlükəsiz şifrə"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCreatePassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role-select">Rol</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="role-select">
                                        <SelectValue placeholder="Rol seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Adminstrator</SelectItem>
                                        <SelectItem value="user">Sadə</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" disabled={createLoading} className="w-full">
                                {createLoading ? "Yaradılır..." : "İstifadəçi Yarat"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Admin List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Mövcud Adminlər
                        </CardTitle>
                        <CardDescription>
                            Admin girişi olan bütün istifadəçilərin siyahısı.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {listLoading ? (
                            <div className="text-center py-4 text-muted-foreground">Yüklənir...</div>
                        ) : (
                            <div className="space-y-4">
                                {admins.map((admin) => (
                                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg bg-card gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium flex items-center gap-2">
                                                <span className="truncate" title={admin.email}>
                                                    {admin.email}
                                                </span>
                                                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${admin.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {admin.role === 'admin' ? 'Admin' : 'Sadə'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Qoşuldu: {new Date(admin.createdAt).toLocaleDateString('az-AZ')}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => openPasswordDialog(admin)}
                                                title="Redaktə et"
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(admin.id)}
                                                title="Sil"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {admins.length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground">Admin tapılmadı</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Change Password/Role Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Məlumatları Redaktə Et</DialogTitle>
                        <DialogDescription>
                            <strong>{selectedAdminEmail}</strong> üçün məlumatları yeniləyin
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} autoComplete="off">
                        <div className="space-y-4 py-4">
                            {passwordError && (
                                <div className="bg-red-500/10 text-red-600 text-sm p-3 rounded-md font-medium">
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md font-medium">
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Rol</Label>
                                <Select value={selectedAdminRole} onValueChange={setSelectedAdminRole}>
                                    <SelectTrigger id="edit-role">
                                        <SelectValue placeholder="Rol seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Adminstrator</SelectItem>
                                        <SelectItem value="user">Sadə</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">Yeni Şifrə (dəyişmək istəmirsinizsə boş saxlayın)</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Yeni şifrə daxil edin"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                Ləğv et
                            </Button>
                            <Button type="submit" disabled={passwordLoading}>
                                {passwordLoading ? "Yenilənir..." : "Yadda saxla"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
