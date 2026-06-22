package com.deposito.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "produto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_produto")
    private Integer idProduto;

    @NotBlank(message = "O nome do produto é obrigatório.")
    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 50)
    private String tipo;

    @NotNull(message = "O preço é obrigatório.")
    @Positive(message = "O preço deve ser maior que zero.")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @NotNull(message = "O valor de custo é obrigatório.")
    @PositiveOrZero(message = "O valor de custo não pode ser negativo.")
    @Column(name = "valor_custo", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorCusto;

    @PositiveOrZero(message = "O estoque não pode ser negativo.")
    private Integer estoque;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    // Preço "de"/riscado, usado para mostrar desconto na loja. Opcional — se nulo, não há promoção.
    @PositiveOrZero(message = "O preço original não pode ser negativo.")
    @Column(name = "preco_original", precision = 10, scale = 2)
    private BigDecimal precoOriginal;
}
