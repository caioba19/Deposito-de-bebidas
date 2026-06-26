import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})


// Clientes
export const getClientes  = ()       => api.get('/clientes')
export const getCliente   = (id)     => api.get(`/clientes/${id}`)
export const criarCliente = (data)   => api.post('/clientes', data)
export const editarCliente = (id, d) => api.put(`/clientes/${id}`, d)
export const deletarCliente = (id)   => api.delete(`/clientes/${id}`)

// Produtos
export const getProdutos  = ()       => api.get('/produtos')
export const getProduto   = (id)     => api.get(`/produtos/${id}`)
export const criarProduto = (data)   => api.post('/produtos', data)
export const editarProduto = (id, d) => api.put(`/produtos/${id}`, d)
export const deletarProduto = (id)   => api.delete(`/produtos/${id}`)

// Pedidos
export const getPedidos   = ()       => api.get('/pedidos')
export const criarPedido  = (data)   => api.post('/pedidos', data)
export const deletarPedido = (id)    => api.delete(`/pedidos/${id}`)

export default api
