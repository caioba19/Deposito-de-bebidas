import { useState, useEffect } from 'react'
import { getClientes, criarCliente, editarCliente, deletarCliente } from '../api/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const emptyForm = { nome: '', dataNascimento: '', cpf: '', telefone: '', endereco: '', cep: '' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
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
      const res = await getClientes()
      if (Array.isArray(res.data)) {
        setClientes(res.data)
      } else {
        setClientes([])
        showToast('Erro ao processar clientes.', 'error')
      }
    } catch {
      showToast('Erro ao carregar clientes.', 'error')
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

  const abrirEdicao = (cliente) => {
    setForm({
      nome: cliente.nome || '',
      dataNascimento: cliente.dataNascimento || '',
      cpf: cliente.cpf || '',
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || '',
      cep: cliente.cep || ''
    })
    setEditingId(cliente.idCliente)
    setShowModal(true)
  }

  const extrairApenasNumeros = (val) => {
    if (!val || typeof val !== 'string') return null
    const numeros = val.replace(/\D/g, '')
    return numeros || null
  }

  const mascararCpf = (val) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const mascararCep = (val) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
  }

  const mascararTelefone = (val) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const formatarCpf = (cpf) => {
    if (!cpf) return '—'
    const limpo = cpf.replace(/\D/g, '')
    if (limpo.length !== 11) return cpf
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const salvar = async (e) => {
    e.preventDefault()
    // Campos vazios viram null (evita colisão na constraint UNIQUE do cpf quando vazio)
    const payload = {
      ...form,
      dataNascimento: form.dataNascimento || null,
      cpf: extrairApenasNumeros(form.cpf),
      telefone: form.telefone?.trim() || null,
      endereco: form.endereco?.trim() || null,
      cep: form.cep?.trim() || null,
    }
    try {
      if (editingId) {
        await editarCliente(editingId, payload)
        showToast('Cliente atualizado com sucesso.')
      } else {
        await criarCliente(payload)
        showToast('Cliente cadastrado com sucesso.')
      }
      setShowModal(false)
      carregar()
    } catch (err) {
      const dados = err.response?.data
      const msg = dados && typeof dados === 'object'
        ? Object.values(dados)[0]
        : 'Erro ao salvar cliente.'
      showToast(msg, 'error')
    }
  }

  const remover = async (id) => {
    if (!confirm('Remover este cliente?')) return
    try {
      await deletarCliente(id)
      showToast('Cliente removido.')
      carregar()
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao remover cliente.'
      showToast(msg, 'error')
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Módulo 01 / Cadastro</span>
          <h1 className="page-title">Cliente<span>s</span></h1>
          <p className="page-subtitle">Cadastro e dados de contato dos clientes do depósito.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Cliente</button>
      </div>

      {loading ? (
        <div className="loading">CARREGANDO...</div>
      ) : clientes.length === 0 ? (
        <div className="table-wrapper">
          <div className="empty">
            <h3>Nenhum cliente cadastrado</h3>
            <p>Cadastre o primeiro cliente para começar.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.idCliente}>
                  <td className="id-tag">C<strong>{String(c.idCliente).padStart(4, '0')}</strong></td>
                  <td>{c.nome}</td>
                  <td className="mono-num">{formatarCpf(c.cpf)}</td>
                  <td className="mono-num">{c.telefone || '—'}</td>
                  <td>{c.endereco || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ marginRight: 8 }} onClick={() => abrirEdicao(c)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => remover(c.idCliente)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Editar Cliente' : 'Novo Cliente'} onClose={() => setShowModal(false)}>
          <form onSubmit={salvar}>
            <div className="form-grid">
              <div className="field span-2">
                <label>Nome completo</label>
                <input required maxLength={100} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="field">
                <label>Data de nascimento</label>
                <input type="date" value={form.dataNascimento} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} />
              </div>
              <div className="field">
                <label>CPF</label>
                <input maxLength={14} value={form.cpf} onChange={e => setForm({ ...form, cpf: mascararCpf(e.target.value) })} placeholder="000.000.000-00" />
              </div>
              <div className="field">
                <label>Telefone</label>
                <input maxLength={15} value={form.telefone} onChange={e => setForm({ ...form, telefone: mascararTelefone(e.target.value) })} placeholder="(00) 00000-0000" />
              </div>
              <div className="field">
                <label>CEP</label>
                <input maxLength={9} value={form.cep} onChange={e => setForm({ ...form, cep: mascararCep(e.target.value) })} placeholder="00000-000" />
              </div>
              <div className="field span-2">
                <label>Endereço</label>
                <input maxLength={150} value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
              </div>
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
