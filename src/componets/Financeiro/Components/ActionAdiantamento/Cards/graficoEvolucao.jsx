import { useEffect, useState } from "react"
import { Chart } from "primereact/chart"

const CORES = ['#4de5d5', '#886ab5', '#fd3995', '#ffc241', '#2196F3', '#1DC9B7', '#fd7e14', '#6c757d']
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const extrairAnoMes = (valor) => {
    if (!valor) return null
    const str = String(valor)
    let m = str.match(/^(\d{4})-(\d{2})/)
    if (m) return { ano: +m[1], mes: +m[2] }
    m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (m) return { ano: +m[3], mes: +m[2] }
    const d = new Date(valor)
    return isNaN(d) ? null : { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

export const GraficoEvolucao = ({ dados = [] }) => {
    const [chartData, setChartData] = useState({})
    const [chartOptions, setChartOptions] = useState({})

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement)
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057'
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d'
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef'

        const porMes = {}
        const departamentos = new Set()
        dados.forEach(item => {
            const am = extrairAnoMes(item.DATACRIACAO)
            if (!am) return
            const chave = `${am.ano}-${String(am.mes).padStart(2, '0')}`
            const dep = item.DEPARTAMENTO || 'Sem departamento'
            departamentos.add(dep)
            porMes[chave] = porMes[chave] || {}
            porMes[chave][dep] = (porMes[chave][dep] || 0) + 1
        })

        const chaves = Object.keys(porMes).sort()
        const data = {
            labels: chaves.map(c => `${MESES[+c.slice(5) - 1]}/${c.slice(0, 4)}`),
            datasets: [...departamentos].map((dep, i) => ({
                label: dep,
                backgroundColor: CORES[i % CORES.length],
                borderColor: CORES[i % CORES.length],
                data: chaves.map(c => porMes[c][dep] || 0)
            }))
        }

        const options = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: {
                    ticks: { color: textColorSecondary, font: { weight: 500 } },
                    grid: { display: false, drawBorder: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textColorSecondary, precision: 0 },
                    grid: { color: surfaceBorder, drawBorder: false }
                }
            }
        }

        setChartData(data)
        setChartOptions(options)
    }, [dados])

    return (
        <div className="panel mb-3">
            <div className="panel-hdr">
                <h2>Evolução Mensal por Departamento</h2>
            </div>
            <div className="card p-3" style={{ height: 350 }}>
                <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '100%' }} />
            </div>
        </div>
    )
}
