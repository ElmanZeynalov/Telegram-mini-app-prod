"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hash } from "lucide-react"

interface ReorderModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (newOrder: number) => void
    currentOrder: number
    totalItems: number
    itemName?: string
}

export function ReorderModal({
    isOpen,
    onClose,
    onConfirm,
    currentOrder,
    totalItems,
    itemName
}: ReorderModalProps) {
    const [value, setValue] = useState(currentOrder.toString())

    useEffect(() => {
        setValue(currentOrder.toString())
    }, [currentOrder, isOpen])

    const handleSave = () => {
        const num = parseInt(value)
        if (isNaN(num) || num < 1 || num > totalItems) return
        onConfirm(num)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        Sıranı dəyiş
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="text-sm text-muted-foreground mb-2">
                        "{itemName || "Sual"}" üçün yeni sıra nömrəsini daxil edin.
                        <br />
                        <strong>1</strong> ilə <strong>{totalItems}</strong> arasında ədəd olmalıdır.
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="order" className="text-right">
                            Sıra nömrəsi
                        </Label>
                        <Input
                            id="order"
                            type="number"
                            min={1}
                            max={totalItems}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="col-span-3 font-mono font-bold"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave()
                            }}
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Ləğv et</Button>
                    <Button onClick={handleSave} disabled={!value || parseInt(value) < 1 || parseInt(value) > totalItems}>
                        Yadda saxla
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
