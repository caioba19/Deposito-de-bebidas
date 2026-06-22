package com.deposito.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PedidoRequest {
    private Integer idCliente;
    private LocalDate dataPedido;
    private List<ItemRequest> itens;

    @Data
    public static class ItemRequest {
        private Integer idProduto;
        private Integer quantidade;
    }
}
