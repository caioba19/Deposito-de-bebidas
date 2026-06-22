package com.deposito.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "Cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;

    @NotBlank(message = "O nome é obrigatório.")
    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "datanasci")
    private LocalDate dataNascimento;

    @Column(length = 14, unique = true)
    private String cpf;

    @Column(length = 15)
    private String telefone;

    @Column(length = 150)
    private String endereco;

    @Column(length = 10)
    private String cep;
}
