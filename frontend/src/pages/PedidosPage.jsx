import { useState, useEffect } from 'react'
import { getPedidos, criarPedido, deletarPedido, getClientes, getProdutos } from '../api/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState(null)

  const [idCliente, setIdCliente] = useState('')
  const [dataPedido, setDataPedido] = useState(() => new Date().toISOString().slice(0, 10))
  const [itens, setItens] = useState([{ idProduto: '', quantidade: 1 }])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const carregar = async () => {
    setLoading(true)
    try {
      const [resPedidos, resClientes, resProdutos] = await Promise.all([
        getPedidos(), getClientes(), getProdutos()
      ])
      setPedidos(Array.isArray(resPedidos.data) ? resPedidos.data : [])
      setClientes(Array.isArray(resClientes.data) ? resClientes.data : [])
      setProdutos(Array.isArray(resProdutos.data) ? resProdutos.data : [])
    } catch {
      showToast('Erro ao carregar dados.', 'error')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setIdCliente('')
    setDataPedido(new Date().toISOString().slice(0, 10))
    setItens([{ idProduto: '', quantidade: 1 }])
    setShowModal(true)
  }

  const addItem = () => setItens([...itens, { idProduto: '', quantidade: 1 }])
  const removeItem = (idx) => setItens(itens.filter((_, i) => i !== idx))
  const updateItem = (idx, field, value) => {
    const novos = [...itens]
    novos[idx][field] = value
    setItens(novos)
  }

  const calcularTotal = () => {
    return itens.reduce((sum, item) => {
      const produto = produtos.find(p => p.idProduto === Number(item.idProduto))
      if (!produto) return sum
      return sum + (produto.preco * (Number(item.quantidade) || 0))
    }, 0)
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!idCliente) {
      showToast('Selecione um cliente.', 'error')
      return
    }
    const itensValidos = itens.filter(i => i.idProduto && i.quantidade > 0)
    if (itensValidos.length === 0) {
      showToast('Adicione pelo menos um item válido.', 'error')
      return
    }
    try {
      await criarPedido({
        idCliente: Number(idCliente),
        dataPedido,
        itens: itensValidos.map(i => ({
          idProduto: Number(i.idProduto),
          quantidade: Number(i.quantidade)
        }))
      })
      showToast('Pedido criado com sucesso.')
      setShowModal(false)
      carregar()
    } catch (err) {
      const msg = typeof err.response?.data === 'string'
        ? err.response.data
        : 'Erro ao criar pedido.'
      showToast(msg, 'error')
    }
  }

  const remover = async (id) => {
    if (!confirm('Remover este pedido?')) return
    try {
      await deletarPedido(id)
      showToast('Pedido removido.')
      carregar()
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao remover pedido.'
      showToast(msg, 'error')
    }
  }

  const formatMoeda = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`
  const formatData = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

  const totalPedido = (pedido) =>
    (pedido.itens || []).reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0)

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Módulo 03 / Vendas</span>
          <h1 className="page-title">Pedido<span>s</span></h1>
          <p className="page-subtitle">Registro de pedidos e itens vinculados a cada cliente.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Pedido</button>
      </div>

      {loading ? (
        <div className="loading">CARREGANDO...</div>
      ) : pedidos.length === 0 ? (
        <div className="table-wrapper">
          <div className="empty">
            <h3>Nenhum pedido registrado</h3>
            <p>Crie o primeiro pedido para começar.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.idPedido}>
                  <td className="id-tag">PD<strong>{String(p.idPedido).padStart(4, '0')}</strong></td>
                  <td>{p.cliente?.nome || '—'}</td>
                  <td className="mono-num">{formatData(p.dataPedido)}</td>
                  <td className="mono-num">{(p.itens || []).length} item(ns)</td>
                  <td className="mono-num">{formatMoeda(totalPedido(p))}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-danger" onClick={() => remover(p.idPedido)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Novo Pedido" onClose={() => setShowModal(false)}>
          <form onSubmit={salvar}>
            <div className="form-grid">
              <div className="field span-2">
                <label>Cliente</label>
                <select required value={idCliente} onChange={e => setIdCliente(e.target.value)}>
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => (
                    <option key={c.idCliente} value={c.idCliente}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="field span-2">
                <label>Data do pedido</label>
                <input type="date" required value={dataPedido} onChange={e => setDataPedido(e.target.value)} />
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: 10 }}>Itens do pedido</label>
            <div className="items-list">
              {itens.map((item, idx) => (
                <div className="item-row" key={idx}>
                  <select
                    value={item.idProduto}
                    onChange={e => updateItem(idx, 'idProduto', e.target.value)}
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map(p => (
                      <option key={p.idProduto} value={p.idProduto}>
                        {p.nome} — R$ {Number(p.preco).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={e => updateItem(idx, 'quantidade', e.target.value)}
                  />
                  {itens.length > 1 && (
                    <button type="button" className="btn-icon" onClick={() => removeItem(idx)}>&times;</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost" style={{ marginBottom: 24 }} onClick={addItem}>
              + Adicionar item
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total estimado</span>
              <strong className="mono-num" style={{ fontSize: 22, color: 'var(--accent)' }}>
                {formatMoeda(calcularTotal())}
              </strong>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Criar Pedido</button>
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
