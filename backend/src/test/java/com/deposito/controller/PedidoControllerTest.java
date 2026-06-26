package com.deposito.controller;

import com.deposito.config.SecurityConfig;
import com.deposito.dto.PedidoRequest;
import com.deposito.model.Cliente;
import com.deposito.model.Pedido;
import com.deposito.model.Produto;
import com.deposito.repository.ClienteRepository;
import com.deposito.repository.PedidoRepository;
import com.deposito.repository.ProdutoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PedidoController.class)
@Import(SecurityConfig.class)
public class PedidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PedidoRepository pedidoRepository;

    @MockBean
    private ClienteRepository clienteRepository;

    @MockBean
    private ProdutoRepository produtoRepository;

    @Test
    public void testCriarPedidoComSucesso() throws Exception {
        // Mock do Cliente
        Cliente cliente = new Cliente(1, "João Silva", LocalDate.of(1990, 5, 15), "123.456.789-00", null, null, null);
        Mockito.when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));

        // Mock do Produto
        Produto produto = new Produto(1, "Vinho Tinto", "Vinho", new BigDecimal("50.00"), new BigDecimal("30.00"), 10, null, null);
        Mockito.when(produtoRepository.findById(1)).thenReturn(Optional.of(produto));

        // Mock do Pedido Salvo
        Pedido pedidoSalvo = new Pedido();
        pedidoSalvo.setIdPedido(100);
        pedidoSalvo.setCliente(cliente);
        pedidoSalvo.setDataPedido(LocalDate.now());
        Mockito.when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedidoSalvo);

        // Request payload
        PedidoRequest request = new PedidoRequest();
        request.setIdCliente(1);
        request.setDataPedido(LocalDate.now());
        
        PedidoRequest.ItemRequest item = new PedidoRequest.ItemRequest();
        item.setIdProduto(1);
        item.setQuantidade(2);
        request.setItens(Collections.singletonList(item));

        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPedido").value(100));
    }

    @Test
    public void testCriarPedidoClienteNaoEncontrado() throws Exception {
        // Simular cliente inexistente
        Mockito.when(clienteRepository.findById(1)).thenReturn(Optional.empty());

        PedidoRequest request = new PedidoRequest();
        request.setIdCliente(1);
        request.setDataPedido(LocalDate.now());

        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Cliente não encontrado."));
    }

    @Test
    public void testCriarPedidoSemItens() throws Exception {
        // Mock do Cliente
        Cliente cliente = new Cliente(1, "João Silva", LocalDate.of(1990, 5, 15), "123.456.789-00", null, null, null);
        Mockito.when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));

        PedidoRequest request = new PedidoRequest();
        request.setIdCliente(1);
        request.setDataPedido(LocalDate.now());
        request.setItens(new ArrayList<>()); // Sem itens

        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("O pedido precisa ter ao menos um item."));
    }

    @Test
    public void testCriarPedidoEstoqueInsuficiente() throws Exception {
        // Mock do Cliente
        Cliente cliente = new Cliente(1, "João Silva", LocalDate.of(1990, 5, 15), "123.456.789-00", null, null, null);
        Mockito.when(clienteRepository.findById(1)).thenReturn(Optional.of(cliente));

        // Mock do Produto com estoque 5
        Produto produto = new Produto(1, "Vinho Tinto", "Vinho", new BigDecimal("50.00"), new BigDecimal("30.00"), 5, null, null);
        Mockito.when(produtoRepository.findById(1)).thenReturn(Optional.of(produto));

        // Request pedindo quantidade 10 (estoque é 5)
        PedidoRequest request = new PedidoRequest();
        request.setIdCliente(1);
        request.setDataPedido(LocalDate.now());
        
        PedidoRequest.ItemRequest item = new PedidoRequest.ItemRequest();
        item.setIdProduto(1);
        item.setQuantidade(10);
        request.setItens(Collections.singletonList(item));

        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Estoque insuficiente para \"Vinho Tinto\". Disponível: 5"));
    }
}
