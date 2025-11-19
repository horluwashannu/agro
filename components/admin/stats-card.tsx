import { Card } from '@/components/ui/card'

interface StatsCardProps {
  label: string
  value: string | number
  change?: string
  icon: string
}

export function StatsCard({ label, value, change, icon }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <p className="text-xs text-green-600 mt-1">↑ {change}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </Card>
  )
}
