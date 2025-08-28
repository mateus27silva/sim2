'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Hammer, 
  Filter, 
  Circle, 
  Waves, 
  ChevronDown, 
  ChevronUp,
  Factory,
  SeparatorHorizontal,
  Droplets
} from 'lucide-react'

const unitOperations = [
  {
    category: 'Cominuição',
    units: [
      { id: 'jaw-crusher', name: 'Britador de Mandíbula', icon: Hammer, description: 'Britagem primária' },
      { id: 'cone-crusher', name: 'Britador de Cone', icon: Hammer, description: 'Britagem secundária e terciária' },
      { id: 'ball-mill', name: 'Moinho de Bolas', icon: Circle, description: 'Moagem fina' },
      { id: 'rod-mill', name: 'Moinho de Barras', icon: Circle, description: 'Moagem média' },
      { id: 'sag-mill', name: 'Moinho SAG', icon: Circle, description: 'Moagem semiautógena' },
    ]
  },
  {
    category: 'Classificação',
    units: [
      { id: 'vibrating-screen', name: 'Peneira Vibratória', icon: SeparatorHorizontal, description: 'Separação por tamanho' },
      { id: 'hydrocyclone', name: 'Ciclone', icon: Circle, description: 'Classificação hidráulica' },
      { id: 'spiral-classifier', name: 'Classificador Espiral', icon: Waves, description: 'Classificação mecânica' },
    ]
  },
  {
    category: 'Concentração',
    units: [
      { id: 'flotation-cell', name: 'Célula de Flotação', icon: Droplets, description: 'Separação por flotação' },
      { id: 'jig', name: 'Jigue', icon: Waves, description: 'Concentração gravimétrica' },
      { id: 'magnetic-separator', name: 'Separador Magnético', icon: Factory, description: 'Separação magnética' },
      { id: 'centrifuge', name: 'Centrífuga', icon: Circle, description: 'Separação centrífuga' },
    ]
  },
  {
    category: 'Espessamento e Filtração',
    units: [
      { id: 'thickener', name: 'Espessador', icon: ChevronDown, description: 'Espessamento de polpa' },
      { id: 'filter-press', name: 'Filtro Prensa', icon: Filter, description: 'Filtragem de torta' },
      { id: 'vacuum-filter', name: 'Filtro a Vácuo', icon: Filter, description: 'Filtragem contínua' },
      { id: 'dryer', name: 'Secador', icon: Waves, description: 'Secagem de material' },
    ]
  }
]

export function Sidebar() {
  return (
    <div className="h-full p-4 bg-background border-r">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          {unitOperations.map((category) => (
            <Card key={category.category} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', unit.id)
                    }}
                  >
                    <unit.icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{unit.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {unit.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {unit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}