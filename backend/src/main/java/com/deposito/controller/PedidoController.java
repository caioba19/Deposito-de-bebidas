//  É o único que tem regra de negócio real (agregação de itens repetidos, validação de estoque, transação).
package com.deposito.controller;

import com.deposito.dto.PedidoRequest;
import com.deposito.model.*;
import com.deposito.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @GetMapping
    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Integer id) {
        return pedidoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> criar(@RequestBody PedidoRequest request) {
        if (request.getIdCliente() == null) {
            return ResponseEntity.badRequest().body("Cliente é obrigatório.");
        }
        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente não encontrado.");
        }
        if (request.getItens() == null || request.getItens().isEmpty()) {
            return ResponseEntity.badRequest().body("O pedido precisa ter ao menos um item.");
        }

        // Agrupa quantidades pelo mesmo produto, caso ele apareça em mais de uma linha do pedido
        Map<Integer, Integer> quantidadePorProduto = new LinkedHashMap<>();
        for (PedidoRequest.ItemRequest itemReq : request.getItens()) {
            if (itemReq.getIdProduto() == null || itemReq.getQuantidade() == null || itemReq.getQuantidade() <= 0) {
                return ResponseEntity.badRequest().body("Item de pedido inválido: produto e quantidade são obrigatórios.");
            }
            quantidadePorProduto.merge(itemReq.getIdProduto(), itemReq.getQuantidade(), Integer::sum);
        }

        // Valida produtos e estoque disponível (já considerando a soma de quantidades repetidas) antes de gravar
        Map<Integer, Produto> produtosPorId = new LinkedHashMap<>();
        for (Map.Entry<Integer, Integer> entry : quantidadePorProduto.entrySet()) {
            Produto produto = produtoRepository.findById(entry.getKey()).orElse(null);
            if (produto == null) {
                return ResponseEntity.badRequest().body("Produto não encontrado: id " + entry.getKey());
            }
            int estoqueAtual = produto.getEstoque() != null ? produto.getEstoque() : 0;
            if (entry.getValue() > estoqueAtual) {
                return ResponseEntity.badRequest().body(
                        "Estoque insuficiente para \"" + produto.getNome() + "\". Disponível: " + estoqueAtual);
            }
            produtosPorId.put(entry.getKey(), produto);
        }

        Pedido pedido = new Pedido();
        pedido.setDataPedido(request.getDataPedido());
        pedido.setCliente(cliente);

        // Monta os itens (preservando as linhas originais do pedido) e desconta o estoque agregado
        List<ItemPedido> itens = new ArrayList<>();
        for (PedidoRequest.ItemRequest itemReq : request.getItens()) {
            Produto produto = produtosPorId.get(itemReq.getIdProduto());

            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemReq.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());
            itens.add(item);
        }

        for (Map.Entry<Integer, Integer> entry : quantidadePorProduto.entrySet()) {
            Produto produto = produtosPorId.get(entry.getKey());
            int estoqueAtual = produto.getEstoque() != null ? produto.getEstoque() : 0;
            produto.setEstoque(estoqueAtual - entry.getValue());
            produtoRepository.save(produto);
        }

        pedido.setItens(itens);
        Pedido salvo = pedidoRepository.save(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (!pedidoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pedidoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
