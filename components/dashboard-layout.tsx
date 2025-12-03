"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
  navItems: Array<{
    label: string
    href: string
    icon?: React.ReactNode
  }>
}

export function DashboardLayout({ children, userName, userRole, navItems }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn("bg-white shadow-lg transition-all duration-300 flex flex-col", sidebarOpen ? "w-64" : "w-20")}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <h1 className="font-bold text-lg text-blue-600">Epitanie</h1>}
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                pathname === item.href ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-100",
              )}
              title={!sidebarOpen ? item.label : ""}
            >
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-600">{userRole}</p>
            <Button asChild variant="outline" size="sm" className="w-full mt-3 bg-transparent">
              <Link href="/logout">Déconnexion</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {navItems.find((item) => item.href === pathname)?.label || "Tableau de bord"}
          </h2>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
