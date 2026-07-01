// Classe principal com @SpringBootApplication é só o "botão liga" da aplicação, o ponto de entrada que o Spring usa pra subir o servidor. 
package com.deposito;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DepositoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DepositoApplication.class, args);
    }
}
