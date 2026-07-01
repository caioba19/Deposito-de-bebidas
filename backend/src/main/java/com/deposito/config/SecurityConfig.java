//  explica CORS (por que o front consegue falar com o back) e por que o CSRF foi desabilitado com justificativa.
package com.deposito.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * CSRF desabilitado intencionalmente: esta API é stateless (JWT-less, sem cookies de sessão)
     * e é consumida exclusivamente pelo frontend React via fetch/Axios com cabeçalho
     * Content-Type: application/json. APIs REST stateless consumidas por SPAs não se beneficiam
     * de proteção CSRF baseada em cookies/sessão — o mecanismo de proteção adequado aqui
     * seria autenticação por token (Bearer), que está fora do escopo atual deste projeto acadêmico.
     *
     * Referência: https://docs.spring.io/spring-security/reference/features/exploits/csrf.html#csrf-when-to-use
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Stateless — sem sessão HTTP
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // CSRF desabilitado (ver Javadoc acima)
            .csrf(csrf -> csrf.disable())

            // CORS gerenciado pelo bean abaixo
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Desabilita o formulário de login padrão do Spring Security
            .formLogin(login -> login.disable())
            .httpBasic(basic -> basic.disable())

            // Permite todas as rotas /api/** sem autenticação
            // (adicionar autenticação aqui quando o projeto evoluir pra produção)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()
                .anyRequest().denyAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
