'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react'

interface ResultsPanelProps {
  simulationData: any
}

export function ResultsPanel({ simulationData }: ResultsPanelProps) {
  // Mock data for simulation results
  const overallResults = {
    totalFeed: 450,
    totalProduct: 380,
    overallRecovery: 84.4,
    energyConsumption: 12.5,
    waterConsumption: 2.8,
    operatingCost: 45.6
  }

  const massBalanceData = [
    {
      unit: 'Britador Primário',
      input: 450.0,
      output: 450.0,
      error: 0.0,
      status: 'balanced'
    },
    {
      unit: 'Moinho de Bolas',
      input: 450.0,
      output: 448.5,
      error: 0.33,
      status: 'warning'
    },
    {
      unit: 'Ciclone',
      input: 448.5,
      output: 448.5,
      error: 0.0,
      status: 'balanced'
    },
    {
      unit: 'Célula de Flotação',
      input: 320.0,
      output: 318.4,
      error: 0.5,
      status: 'warning'
    },
    {
      unit: 'Espessador',
      input: 318.4,
      output: 318.4,
      error: 0.0,
      status: 'balanced'
    }
  ]

  const streamData = [
    {
      id: 'S-001',
      from: 'Alimentação',
      to: 'Britador Primário',
      flowRate: 450.0,
      feGrade: 35.2,
      moisture: 8.5
    },
    {
      id: 'S-002',
      from: 'Britador Primário',
      to: 'Moinho de Bolas',
      flowRate: 450.0,
      feGrade: 35.2,
      moisture: 8.5
    },
    {
      id: 'S-003',
      from: 'Moinho de Bolas',
      to: 'Ciclone',
      flowRate: 448.5,
      feGrade: 35.2,
      moisture: 32.0
    },
    {
      id: 'S-004',
      from: 'Ciclone',
      to: 'Célula de Flotação',
      flowRate: 320.0,
      feGrade: 42.8,
      moisture: 28.5
    },
    {
      id: 'S-005',
      from: 'Célula de Flotação',
      to: 'Espessador',
      flowRate: 95.2,
      feGrade: 68.5,
      moisture: 25.0
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'balanced':
        return <Badge variant="default" className="bg-green-500">Balanceado</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Atenção</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <div className="border-t bg-background">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resultados da Simulação
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="mass-balance">Balanço de Massa</TabsTrigger>
            <TabsTrigger value="streams">Correntes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Alimentação Total</p>
                      <p className="text-lg font-semibold">{overallResults.totalFeed} t/h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Produto Total</p>
                      <p className="text-lg font-semibold">{overallResults.totalProduct} t/h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Recuperação Global</p>
                      <p className="text-lg font-semibold">{overallResults.overallRecovery}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Consumo Energético</p>
                      <p className="text-lg font-semibold">{overallResults.energyConsumption} kWh/t</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Consumo de Água</p>
                      <p className="text-lg font-semibold">{overallResults.waterConsumption} m³/t</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Custo Operacional</p>
                      <p className="text-lg font-semibold">R$ {overallResults.operatingCost}/t</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mass-balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Balanço de Massa por Unidade</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Entrada (t/h)</TableHead>
                      <TableHead className="text-right">Saída (t/h)</TableHead>
                      <TableHead className="text-right">Erro (%)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {massBalanceData.map((row) => (
                      <TableRow key={row.unit}>
                        <TableCell className="font-medium">{row.unit}</TableCell>
                        <TableCell className="text-right">{row.input.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{row.output.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{row.error.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{getStatusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados das Correntes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>De</TableHead>
                      <TableHead>Para</TableHead>
                      <TableHead className="text-right">Vazão (t/h)</TableHead>
                      <TableHead className="text-right">Teor Fe (%)</TableHead>
                      <TableHead className="text-right">Umidade (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {streamData.map((stream) => (
                      <TableRow key={stream.id}>
                        <TableCell className="font-medium">{stream.id}</TableCell>
                        <TableCell>{stream.from}</TableCell>
                        <TableCell>{stream.to}</TableCell>
                        <TableCell className="text-right">{stream.flowRate.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{stream.feGrade.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{stream.moisture.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}