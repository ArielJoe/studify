"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Switch disabled />
    }

    return (
        <div className="flex items-center gap-2">
            <div className="relative h-[1.2rem] w-[1.2rem]">
                <Sun className="absolute h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
            <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label="Toggle dark mode"
            />
        </div>
    )
}
