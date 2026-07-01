// Mostra tratamento de erro centralizado. Ponto bom pra citar como "boa prática"
package com.deposito.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Erros de validação (@Valid) -> 400 com mensagem por campo
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(erro ->
                erros.put(erro.getField(), erro.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(erros);
    }

    // JSON mal formatado ou com tipos incompatíveis no corpo da requisição -> 400
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleJsonInvalido(HttpMessageNotReadableException ex) {
        Map<String, String> erro = new LinkedHashMap<>();
        erro.put("mensagem", "Corpo da requisição inválido ou mal formatado.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    // Parâmetro de URL com tipo inválido (ex: GET /api/clientes/abc, onde "abc" deveria ser um número) -> 400
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        Map<String, String> erro = new LinkedHashMap<>();
        erro.put("mensagem", "Valor inválido para \"" + ex.getName() + "\": \"" + ex.getValue() + "\".");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    // Método HTTP não suportado numa rota existente (ex: PUT em um endpoint que só aceita GET/POST) -> 405
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        Map<String, String> erro = new LinkedHashMap<>();
        erro.put("mensagem", "Método HTTP \"" + ex.getMethod() + "\" não é suportado neste endpoint.");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(erro);
    }

    // Erros de regra de negócio lançados manualmente (ex: estoque insuficiente)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> erro = new LinkedHashMap<>();
        erro.put("mensagem", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    // Violação de integridade no banco: FK (ex: excluir cliente/produto vinculado a pedidos)
    // ou UNIQUE (ex: CPF/CNPJ duplicado)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        Map<String, String> erro = new LinkedHashMap<>();
        erro.put("mensagem", "Operação não permitida: o dado já existe (ex: CPF duplicado) ou está vinculado a outro registro (ex: pedidos).");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
    }

    // Fallback para qualquer erro inesperado não tratado acima -> nunca vaza stack trace pro cliente
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenerico(Exception ex) {
        Map<String, String> erro = new LinkedHashMap<>();
        erro.put("mensagem", "Ocorreu um erro inesperado no servidor. Tente novamente.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
    }
}
