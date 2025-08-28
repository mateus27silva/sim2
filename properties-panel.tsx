'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, BarChart3, Activity } from 'lucide-react'

interface PropertiesPanelProps {
  selectedUnit: string | null
  simulationData: any
  setSimulationData: (data: any) => void
}

export function PropertiesPanel({ selectedUnit, simulationData, setSimulationData }: PropertiesPanelProps) {
  if (!selectedUnit) {
    return (
      <div className="h-full p-4 bg-background border-l">
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <Settings className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma unidade selecionada</h3>
          <p className="text-sm">
            Selecione uma unidade operacional no flowsheet para visualizar e editar suas propriedades.
          </p>
        </div>
      </div>
    )
  }

  // Mock data for the selected unit
  const unitData = {
    id: selectedUnit,
    name: 'Britador de Mandíbula',
    type: 'jaw-crusher',
    parameters: {
      reductionRatio: 4,
      capacity: 100,
      power: 150,
      efficiency: 0.85
    },
    streams: {
      input: {
        flowRate: 120,
        composition: {
          Fe: 0.45,
          SiO2: 0.30,
          Al2O3: 0.15,
          Outros: 0.10
        }
      },
      output: {
        flowRate: 120,
        composition: {
          Fe: 0.45,
          SiO2: 0.30,
          Al2O3: 0.15,
          Outros: 0.10
        }
      }
    }
  }

  const handleParameterChange = (key: string, value: number) => {
    // Update simulation data with new parameter value
    const updatedData = {
      ...simulationData,
      [selectedUnit]: {
        ...simulationData[selectedUnit],
        parameters: {
          ...simulationData[selectedUnit]?.parameters,
          [key]: value
        }
      }
    }
    setSimulationData(updatedData)
  }

  return (
    <div className="h-full p-4 bg-background border-l">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {unitData.name}
            </CardTitle>
            <Badge variant="secondary">{unitData.type}</Badge>
          </CardHeader>
        </Card>

        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
            <TabsTrigger value="streams">Correntes</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parâmetros Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reduction-ratio">Relação de Redução</Label>
                  <Input
                    id="reduction-ratio"
                    type="number"
                    value={unitData.parameters.reductionRatio}
                    onChange={(e) => handleParameterChange('reductionRatio', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade (t/h)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={unitData.parameters.capacity}
                    onChange={(e) => handleParameterChange('capacity', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="power">Potência (kW)</Label>
                  <Input
                    id="power"
                    type="number"
                    value={unitData.parameters.power}
                    onChange={(e) => handleParameterChange('power', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="efficiency">Eficiência</Label>
                  <Input
                    id="efficiency"
                    type="number"
                    step="0.01"
                    value={unitData.parameters.efficiency}
                    onChange={(e) => handleParameterChange('efficiency', parseFloat(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Corrente de Alimentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vazão (t/h)</Label>
                  <Input value={unitData.streams.input.flowRate} readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label>Composição</Label>
                  <div className="space-y-2">
                    {Object.entries(unitData.streams.input.composition).map(([component, value]) => (
                      <div key={component} className="flex items-center gap-2">
                        <Label className="text-sm flex-1">{component}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={value as number}
                          className="w-20"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Corrente de Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vazão (t/h)</Label>
                  <Input value={unitData.streams.output.flowRate} readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label>Composição</Label>
                  <div className="space-y-2">
                    {Object.entries(unitData.streams.output.composition).map(([component, value]) => (
                      <div key={component} className="flex items-center gap-2">
                        <Label className="text-sm flex-1">{component}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={value as number}
                          className="w-20"
                          readOnly
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Resultados da Simulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Recuperação</Label>
                    <div className="text-lg font-semibold">92.5%</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Consumo Energético</Label>
                    <div className="text-lg font-semibold">1.8 kWh/t</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Teor do Produto</Label>
                    <div className="text-lg font-semibold">45.2% Fe</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Capacidade Utilizada</Label>
                    <div className="text-lg font-semibold">85%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Status da Operação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Operação Normal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Unidade operando dentro dos parâmetros especificados
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}