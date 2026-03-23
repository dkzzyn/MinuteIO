package com.minuteio.llm;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Minimal OpenAI Chat Completions client pointing at llama-swap (or any OpenAI-compatible proxy).
 * Configure: llama.swap.base-url=http://localhost:8080/v1
 *            llama.swap.api-key=sk-local (optional if proxy does not require keys)
 */
@Service
public class SpringBootChatClient {

    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper()
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);

    private final String baseUrl;
    private final String apiKey;

    public SpringBootChatClient(
            RestTemplateBuilder builder,
            String llamaSwapBaseUrl,
            String llamaSwapApiKey
    ) {
        this.baseUrl = llamaSwapBaseUrl.replaceAll("/$", "");
        this.apiKey = llamaSwapApiKey;
        this.rest = builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofMinutes(2))
                .build();
    }

    @SuppressWarnings("unchecked")
    public String chat(String model, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isBlank()) {
            headers.setBearerAuth(apiKey);
        }

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "user", "content", userMessage)
                ),
                "stream", false
        );

        try {
            String json = mapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(json, headers);
            ResponseEntity<String> response = rest.postForEntity(
                    baseUrl + "/chat/completions",
                    entity,
                    String.class
            );
            Map<String, Object> root = mapper.readValue(response.getBody(), Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) root.get("choices");
            if (choices == null || choices.isEmpty()) return "";
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            Object content = message != null ? message.get("content") : null;
            return content != null ? content.toString() : "";
        } catch (Exception e) {
            throw new IllegalStateException("Chat completion failed", e);
        }
    }
}

/*
 * application.properties example:
 *
 * llama.swap.base-url=http://localhost:8080/v1
 * llama.swap.api-key=sk-local-no-key
 *
 * @Configuration
 * class LlmConfig {
 *   @Bean
 *   SpringBootChatClient springBootChatClient(RestTemplateBuilder b,
 *       @Value("${llama.swap.base-url}") String base,
 *       @Value("${llama.swap.api-key:}") String key) {
 *     return new SpringBootChatClient(b, base, key);
 *   }
 * }
 */
