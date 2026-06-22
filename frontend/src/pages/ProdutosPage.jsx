import { useState, useEffect } from 'react'
import { getProdutos, criarProduto, editarProduto, deletarProduto } from '../api/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const emptyForm = { nome: '', tipo: '', preco: '', valorCusto: '', estoque: '', imagemUrl: '', precoOriginal: '' }

function estoqueBadge(qtd) {
  if (qtd === 0 || qtd === null) return <span className="badge badge-out">Esgotado</span>
  if (qtd < 10) return <span className="badge badge-low">Estoque baixo</span>
  return <span className="badge badge-ok">Em estoque</span>
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await getProdutos()
      setProdutos(res.data)
    } catch {
      showToast('Erro ao carregar produtos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  const abrirEdicao = (p) => {
    setForm({
      nome: p.nome || '',
      tipo: p.tipo || '',
      preco: p.preco ?? '',
      valorCusto: p.valorCusto ?? '',
      estoque: p.estoque ?? '',
      imagemUrl: p.imagemUrl || '',
      precoOriginal: p.precoOriginal ?? ''
    })
    setEditingId(p.idProduto)
    setShowModal(true)
  }

  const salvar = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      preco: parseFloat(form.preco),
      valorCusto: parseFloat(form.valorCusto),
      estoque: parseInt(form.estoque, 10),
      imagemUrl: form.imagemUrl?.trim() || null,
      precoOriginal: form.precoOriginal === '' ? null : parseFloat(form.precoOriginal)
    }
    if (payload.precoOriginal != null && payload.precoOriginal <= payload.preco) {
      showToast('O preço original precisa ser maior que o preço de venda.', 'error')
      return
    }
    try {
      if (editingId) {
        await editarProduto(editingId, payload)
        showToast('Produto atualizado com sucesso.')
      } else {
        await criarProduto(payload)
        showToast('Produto cadastrado com sucesso.')
      }
      setShowModal(false)
      carregar()
    } catch (err) {
      const dados = err.response?.data
      const msg = dados && typeof dados === 'object'
        ? Object.values(dados)[0]
        : 'Erro ao salvar produto.'
      showToast(msg, 'error')
    }
  }

  const remover = async (id) => {
    if (!confirm('Remover este produto?')) return
    try {
      await deletarProduto(id)
      showToast('Produto removido.')
      carregar()
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao remover produto.'
      showToast(msg, 'error')
    }
  }

  const formatMoeda = (v) => v != null ? `R$ ${Number(v).toFixed(2).replace('.', ',')}` : '—'

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Módulo 02 / Inventário</span>
          <h1 className="page-title">Produto<span>s</span></h1>
          <p className="page-subtitle">Catálogo, preços e controle de estoque do depósito.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Produto</button>
      </div>

      {loading ? (
        <div className="loading">CARREGANDO...</div>
      ) : produtos.length === 0 ? (
        <div className="table-wrapper">
          <div className="empty">
            <h3>Nenhum produto cadastrado</h3>
            <p>Cadastre o primeiro produto para começar.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Custo</th>
                <th>Estoque</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.idProduto}>
                  <td className="id-tag">P<strong>{String(p.idProduto).padStart(4, '0')}</strong></td>
                  <td>
                    <div className="produto-nome-cell">
                      {p.imagemUrl ? (
                        <img src={p.imagemUrl} alt="" className="table-thumb" onError={e => { e.target.style.visibility = 'hidden' }} />
                      ) : (
                        <span className="table-thumb table-thumb-empty">—</span>
                      )}
                      {p.nome}
                    </div>
                  </td>
                  <td>{p.tipo || '—'}</td>
                  <td className="mono-num">
                    {p.precoOriginal > p.preco && (
                      <span style={{ display: 'block', textDecoration: 'line-through', color: 'var(--text-faint)', fontSize: 11 }}>
                        {formatMoeda(p.precoOriginal)}
                      </span>
                    )}
                    {formatMoeda(p.preco)}
                  </td>
                  <td className="mono-num">{formatMoeda(p.valorCusto)}</td>
                  <td><span className="mono-num">{p.estoque ?? 0}</span> {estoqueBadge(p.estoque)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ marginRight: 8 }} onClick={() => abrirEdicao(p)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => remover(p.idProduto)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Editar Produto' : 'Novo Produto'} onClose={() => setShowModal(false)}>
          <form onSubmit={salvar}>
            <div className="form-grid">
              <div className="field span-2">
                <label>Nome do produto</label>
                <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="field span-2">
                <label>Tipo</label>
                <input value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} placeholder="Ex: Cerveja, Refrigerante..." />
              </div>
              <div className="field">
                <label>Preço de venda (R$)</label>
                <input required type="number" step="0.01" min="0" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} />
              </div>
              <div className="field">
                <label>Preço original (opcional)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.precoOriginal}
                  onChange={e => setForm({ ...form, precoOriginal: e.target.value })}
                  placeholder="Deixe vazio se não houver promoção"
                />
              </div>
              <div className="field">
                <label>Valor de custo (R$)</label>
                <input required type="number" step="0.01" min="0" value={form.valorCusto} onChange={e => setForm({ ...form, valorCusto: e.target.value })} />
              </div>
              <div className="field span-2">
                <label>Estoque</label>
                <input required type="number" min="0" value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} />
              </div>
              <div className="field span-2">
                <label>URL da foto do produto</label>
                <input
                  type="url"
                  value={form.imagemUrl}
                  onChange={e => setForm({ ...form, imagemUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              {form.imagemUrl && (
                <div className="field span-2">
                  <img
                    src={form.imagemUrl}
                    alt="Pré-visualização"
                    className="form-image-preview"
                    onError={e => { e.target.style.display = 'none' }}
                    onLoad={e => { e.target.style.display = 'block' }}
                  />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
