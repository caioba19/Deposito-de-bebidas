package com.deposito.controller;

import com.deposito.config.SecurityConfig;
import com.deposito.model.Cliente;
import com.deposito.repository.ClienteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClienteController.class)
@Import(SecurityConfig.class)
public class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClienteRepository clienteRepository;

    @Test
    public void testCriarClienteComSucesso() throws Exception {
        Cliente cliente = new Cliente(null, "João Silva", LocalDate.of(1990, 5, 15), "123.456.789-00", "(11) 99999-9999", "Rua A, 123", "01234-567");
        Cliente clienteSalvo = new Cliente(1, "João Silva", LocalDate.of(1990, 5, 15), "123.456.789-00", "(11) 99999-9999", "Rua A, 123", "01234-567");

        Mockito.when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteSalvo);

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cliente)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCliente").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.cpf").value("123.456.789-00"));
    }

    @Test
    public void testCriarClienteSemNomeDeveRetornarBadRequest() throws Exception {
        // Nome em branco deve falhar na validação @NotBlank
        Cliente clienteInvalido = new Cliente(null, "  ", LocalDate.of(1990, 5, 15), "123.456.789-00", "(11) 99999-9999", "Rua A, 123", "01234-567");

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clienteInvalido)))
                .andExpect(status().isBadRequest());
    }
}
