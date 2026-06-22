import { NavLink, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProdutos } from '../api/api'
import './Sidebar.css'

const links = [
  { to: '/admin/clientes', label: 'Clientes', icon: '01' },
  { to: '/admin/produtos', label: 'Produtos', icon: '02' },
  { to: '/admin/pedidos',  label: 'Pedidos',  icon: '03' },
]

export default function Sidebar() {
  const [estoqueBaixo, setEstoqueBaixo] = useState(0)

  useEffect(() => {
    let ativo = true
    const checarEstoque = async () => {
      try {
        const res = await getProdutos()
        if (!ativo) return
        const baixos = res.data.filter(p => (p.estoque ?? 0) < 10).length
        setEstoqueBaixo(baixos)
      } catch {
        // silencioso: indicador de estoque é informativo, não bloqueia a navegação
      }
    }
    checarEstoque()
    const intervalo = setInterval(checarEstoque, 30000)
    return () => { ativo = false; clearInterval(intervalo) }
  }, [])

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">DB</span>
        <div className="brand-text">
          <strong>Depósito</strong>
          <small>de Bebidas</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-index">{link.icon}</span>
            <span className="link-label">{link.label}</span>
            {link.to === '/admin/produtos' && estoqueBaixo > 0 && (
              <span className="stock-alert" title={`${estoqueBaixo} produto(s) com estoque baixo`}>
                {estoqueBaixo}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <Link to="/" className="sidebar-store-link">
        <span>← Ver loja</span>
      </Link>

      <div className="sidebar-status">
        <span className={`status-dot ${estoqueBaixo > 0 ? 'status-dot-warn' : ''}`} />
        <span>
          {estoqueBaixo > 0
            ? `${estoqueBaixo} produto${estoqueBaixo > 1 ? 's' : ''} com estoque baixo`
            : 'Estoque sob controle'}
        </span>
      </div>

      <div className="sidebar-footer">
        <span>Sistema de Gestão</span>
        <span className="version">v1.0</span>
      </div>
    </aside>
  )
}
