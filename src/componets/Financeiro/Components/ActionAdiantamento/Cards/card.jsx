import { useState } from "react"
import { FaCheckDouble, FaClock, FaBan, FaMoneyBillWave } from "react-icons/fa6"

const CARDS = [
    { title: 'APROVADO', label: 'Aprovados', cor: '#4de5d5', Icon: FaCheckDouble },
    { title: 'PENDENTE', label: 'Pendentes', cor: '#ffc241', Icon: FaClock },
    { title: 'REPROVADO', label: 'Reprovados', cor: '#fd3995', Icon: FaBan },
    { title: 'AGUARDANDO FINANCEIRO', label: 'Aguardando Financeiro', cor: '#886ab5', Icon: FaMoneyBillWave },
]

const resumirPorStatus = (dados) => {
    const resumo = {}
    CARDS.forEach(c => { resumo[c.title] = { total: 0, departamentos: {} } })
    dados.forEach(item => {
        const r = resumo[item.STATUS]
        if (!r) return
        r.total++
        const dep = item.DEPARTAMENTO || 'Sem departamento'
        r.departamentos[dep] = (r.departamentos[dep] || 0) + 1
    })
    return resumo
}

export const Cards = ({ dados = [], statusSelecionado, onClickCard }) => {
    const [hover, setHover] = useState(null)
    const resumo = resumirPorStatus(dados)

    return (
        <div>
           
            <div className="row">
                {CARDS.map(({ title, label, cor, Icon }) => {
                    const ativo = hover === title || statusSelecionado === title
                    const { total, departamentos } = resumo[title]
                    return (
                        <div key={title} className="col-sm-6 col-xl-3 mb-3">
                            <div
                                role="button"
                                title={title}
                                onClick={() => onClickCard(title)}
                                onMouseEnter={() => setHover(title)}
                                onMouseLeave={() => setHover(null)}
                                style={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    backgroundColor: ativo ? cor : '#f0f2f5',
                                    color: ativo ? '#fff' : '#333',
                                    border: `solid 1px ${cor}`,
                                    transform: ativo ? 'translateY(-4px)' : 'none',
                                    boxShadow: ativo ? '0 6px 14px rgba(0,0,0,.25)' : 'none',
                                    transition: 'all .2s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <header style={{ backgroundColor: cor, color: '#fff', padding: '0 .5rem' }}>
                                    <h3 style={{ textAlign: 'center', margin: 0 }}>{title}</h3>
                                </header>
                                <div className="p-3 position-relative">
                                    <h3 className="display-4 d-block l-h-n m-0 fw-500" style={{ color: ativo ? '#fff' : cor }}>
                                        {total}
                                        <small className="m-0 l-h-n" style={{ color: 'inherit' }}> {label}</small>
                                    </h3>
                                    <ul className="list-unstyled m-0 mt-2" style={{ fontSize: '.85rem', position: 'relative', zIndex: 1 }}>
                                        {Object.entries(departamentos).map(([dep, qtd]) => (
                                            <li key={dep}>{dep}: <strong>{qtd}</strong></li>
                                        ))}
                                    </ul>
                                    <Icon size={90} style={{ position: 'absolute', right: 8, bottom: 8, opacity: .15 }} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
