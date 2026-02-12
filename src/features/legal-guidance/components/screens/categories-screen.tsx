"use client"

import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { NavigableContentLayout } from "../layout/navigable-content-layout"
import { useState } from "react"
import { Search, FolderOpen, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"

export function CategoriesScreen() {
  const { data, selectCategory, getText, t } = useLegalGuidance()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = data.categories.filter((category) =>
    getText(category.name).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <NavigableContentLayout>
      <div className="p-5 space-y-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t("categories")}</h1>
          <p className="text-sm text-muted-foreground">{t("selectCategory")}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder={t("searchCategories")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>

        <div className="space-y-2.5">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground">{searchQuery ? t("noSearchResults") : t("noCategories")}</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => selectCategory(category)}
                className="w-full p-4 text-left bg-card hover:bg-accent/50 rounded-xl border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {getText(category.name)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </NavigableContentLayout>
  )
}
