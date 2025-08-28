'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface StreamEditorProps {
  streamId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  flowRate: number
  composition: Record<string, number>
  moisture: number
  onUpdate: (streamId: string, updates: Partial<{
    flowRate: number
    composition: Record<string, number>
    moisture: number
  }>) => void
  onDelete: (streamId: string) => void
  onClose: () => void
}

export function StreamEditor({
  streamId,
  fromX,
  fromY,
  toX,
  toY,
  flowRate,
  composition,
  moisture,
  onUpdate,
  onDelete,
  onClose
}: StreamEditorProps) {
  const [localFlowRate, setLocalFlowRate] = useState(flowRate)
  const [localMoisture, setLocalMoisture] = useState(moisture)
  const [localComposition, setLocalComposition] = useState(composition)
  const editorRef = useRef<HTMLDivElement>(null)

  // Calculate position for the editor (middle of the stream)
  const editorX = (fromX + toX) / 2 - 100
  const editorY = (fromY + toY) / 2 - 150

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [onClose])

  const handleSave = () => {
    onUpdate(streamId, {
      flowRate: localFlowRate,
      moisture: localMoisture,
      composition: localComposition
    })
    onClose()
  }

  const handleCompositionChange = (component: string, value: number) => {
    setLocalComposition(prev => ({
      ...prev,
      [component]: value
    }))
  }

  const addNewComponent = () => {
    const componentName = prompt('Nome do componente (ex: Fe, SiO2, Al2O3):')
    if (componentName && !localComposition[componentName]) {
      setLocalComposition(prev => ({
        ...prev,
        [componentName]: 0.0
      }))
    }
  }

  return (
    <div
      ref={editorRef}
      className="absolute z-30"
      style={{ left: editorX, top: editorY }}
    >
      <Card className="w-64 shadow-xl border-2 border-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Editar Fluxo</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-6 h-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flowRate">Vazão (t/h)</Label>
              <Input
                id="flowRate"
                type="number"
                step="0.1"
                value={localFlowRate}
                onChange={(e) => setLocalFlowRate(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moisture">Umidade (%)</Label>
              <Input
                id="moisture"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={localMoisture}
                onChange={(e) => setLocalMoisture(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Composição</Label>
                <Button variant="outline" size="sm" onClick={addNewComponent}>
                  + Componente
                </Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.entries(localComposition).map(([component, value]) => (
                  <div key={component} className="flex items-center gap-2">
                    <Label className="text-sm flex-1">{component}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={value * 100}
                      onChange={(e) => handleCompositionChange(component, (parseFloat(e.target.value) || 0) / 100)}
                      className="w-16 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} className="flex-1">
                Salvar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onDelete(streamId)
                onClose()
              }}
              className="w-full"
            >
              Excluir Fluxo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}