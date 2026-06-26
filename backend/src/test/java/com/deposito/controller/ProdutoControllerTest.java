package com.deposito.controller;

import com.deposito.config.SecurityConfig;
import com.deposito.model.Produto;
import com.deposito.repository.ProdutoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProdutoController.class)
@Import(SecurityConfig.class)
public class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProdutoRepository produtoRepository;

    @Test
    public void testCriarProdutoComSucesso() throws Exception {
        Produto produto = new Produto(null, "Cerveja Heineken 350ml", "Cerveja", new BigDecimal("5.99"), new BigDecimal("3.50"), 100, "http://imagem.com/heineken.jpg", null);
        Produto produtoSalvo = new Produto(1, "Cerveja Heineken 350ml", "Cerveja", new BigDecimal("5.99"), new BigDecimal("3.50"), 100, "http://imagem.com/heineken.jpg", null);

        Mockito.when(produtoRepository.save(any(Produto.class))).thenReturn(produtoSalvo);

        mockMvc.perform(post("/api/produtos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(produto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idProduto").value(1))
                .andExpect(jsonPath("$.nome").value("Cerveja Heineken 350ml"))
                .andExpect(jsonPath("$.preco").value(5.99))
                .andExpect(jsonPath("$.estoque").value(100));
    }

    @Test
    public void testCriarProdutoComPrecoInvalidoDeveRetornarBadRequest() throws Exception {
        // Preço zero ou negativo deve falhar nas validações @NotNull / @Positive
        Produto produtoInvalido = new Produto(null, "Cerveja Heineken 350ml", "Cerveja", new BigDecimal("0.00"), new BigDecimal("3.50"), 100, null, null);

        mockMvc.perform(post("/api/produtos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(produtoInvalido)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCriarProdutoComCustoNegativoDeveRetornarBadRequest() throws Exception {
        // Valor de custo negativo deve falhar na validação @PositiveOrZero
        Produto produtoInvalido = new Produto(null, "Cerveja Heineken 350ml", "Cerveja", new BigDecimal("5.99"), new BigDecimal("-1.50"), 100, null, null);

        mockMvc.perform(post("/api/produtos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(produtoInvalido)))
                .andExpect(status().isBadRequest());
    }
}
