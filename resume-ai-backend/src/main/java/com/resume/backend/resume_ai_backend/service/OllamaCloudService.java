package com.resume.backend.resume_ai_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class OllamaCloudService {

    private final RestClient restClient;
    private final String modelName;

    public OllamaCloudService(
            @Value("${spring.ai.ollama.base-url}") String baseUrl,
            @Value("${ollama.api.key}") String apiKey,
            @Value("${spring.ai.ollama.chat.options.model}") String modelName) {

        this.modelName = modelName;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String chat(String prompt) {
        String escapedPrompt = prompt
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        String requestBody = String.format("""
                {
                    "model": "%s",
                    "messages": [{"role": "user", "content": "%s"}],
                    "stream": false
                }
                """, modelName, escapedPrompt);

        return restClient.post()
                .uri("/api/chat")
                .body(requestBody)
                .retrieve()
                .body(String.class);
    }
}
