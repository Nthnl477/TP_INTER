import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminStatsCardProps {
  title: string
  value: number
  description: string
}

export function AdminStatsCard({ title, value, description }: AdminStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
