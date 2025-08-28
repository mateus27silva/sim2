'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Square, RotateCcw, Download, Save, Loader2 } from 'lucide-react'

interface ToolbarProps {
  onSimulationRun?: () => void
  units?: any[]
  streams?: any[]
}

export function Toolbar({ onSimulationRun, units = [], streams = [] }: ToolbarProps) {
  const [isRunning, setIsRunning] = useState(false)

  const handleSave = async () => {
    try {
      // Implement save functionality
      console.log('Saving project')
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          units,
          streams,
          format: 'json'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `simulation-export-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting project:', error)
    }
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar a simulação?')) {
      console.log('Resetting simulation')
    }
  }

  const handleRunSimulation = async () => {
    setIsRunning(true)
    
    try {
      // Get current flowsheet data
      const flowsheetData = {
        units,
        streams
      }
      
      // Log action
      await fetch('/api/simulation/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ACTION',
          message: 'Iniciando execução da simulação',
          details: { 
            action: 'run_simulation',
            unitsCount: flowsheetData.units.length,
            streamsCount: flowsheetData.streams.length
          }
        })
      })

      // Run simulation
      const response = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          units: flowsheetData.units,
          streams: flowsheetData.streams,
          projectId: null
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetch('/api/simulation/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'EXECUTION',
            message: 'Simulação executada com sucesso',
            details: { 
              results: result.results,
              executionTime: result.executionTime || 'N/A'
            }
          })
        })
      } else {
        await fetch('/api/simulation/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ERROR',
            message: 'Erro na execução da simulação',
            details: { 
              error: result.error,
              errorDetails: result.details || 'No additional details'
            }
          })
        })
      }

      if (onSimulationRun) {
        onSimulationRun()
      }
    } catch (error) {
      await fetch('/api/simulation/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ERROR',
          message: 'Erro ao executar simulação',
          details: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
        })
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Simulador de Balanço de Massa - Planta de Beneficiamento</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetar
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleRunSimulation}
          disabled={isRunning}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isRunning ? 'Executando...' : 'Executar Simulação'}
        </Button>
        
        <Button variant="destructive" size="sm" disabled={isRunning}>
          <Square className="w-4 h-4 mr-2" />
          Parar
        </Button>
      </div>
    </div>
  )
}