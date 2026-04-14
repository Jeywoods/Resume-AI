package com.resume.backend.resume_ai_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final OllamaCloudService ollamaCloudService;

    public ResumeServiceImpl(OllamaCloudService ollamaCloudService) {
        this.ollamaCloudService = ollamaCloudService;
    }

    @Override
    public Map<String, Object> generateResumeResponse(String userResumeDescription) throws IOException {
        String promptString = this.loadPromptFromFile("resume-prompt.txt");
        String promptContent = this.putValuesToTemplate(promptString, Map.of(
                "userDescription", userResumeDescription
        ));

        String response = ollamaCloudService.chat(promptContent);

        return parseMultipleResponses(response);
    }

    String loadPromptFromFile(String filename) throws IOException {
        Path path = new ClassPathResource(filename).getFile().toPath();
        return Files.readString(path);
    }

    String putValuesToTemplate(String template, Map<String, String> values) {
        for (Map.Entry<String, String> entry : values.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return template;
    }

    public static Map<String, Object> parseMultipleResponses(String response) {
        Map<String, Object> jsonResponse = new HashMap<>();

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> ollamaResponse = objectMapper.readValue(response, Map.class);

            Map<String, Object> message = (Map<String, Object>) ollamaResponse.get("message");
            if (message != null) {
                String content = (String) message.get("content");


                int thinkStart = content.indexOf("<think>");
                int thinkEnd = content.indexOf("</think>");
                if (thinkStart != -1 && thinkEnd != -1) {
                    String thinkContent = content.substring(thinkStart + 7, thinkEnd).trim();
                    jsonResponse.put("think", thinkContent);
                } else {
                    jsonResponse.put("think", null);
                }

                int jsonStart = content.indexOf("```json");
                int jsonEnd = content.lastIndexOf("```");
                if (jsonStart != -1 && jsonEnd != -1 && jsonStart + 7 < jsonEnd) {
                    String jsonContent = content.substring(jsonStart + 7, jsonEnd).trim();
                    try {
                        Map<String, Object> dataContent = objectMapper.readValue(jsonContent, Map.class);
                        jsonResponse.put("data", dataContent);
                    } catch (Exception e) {
                        jsonResponse.put("data", null);
                        System.err.println("Invalid JSON format: " + e.getMessage());
                    }
                } else {
                    jsonResponse.put("data", null);
                }
            }
        } catch (Exception e) {
            jsonResponse.put("think", null);
            jsonResponse.put("data", null);
            System.err.println("Error parsing Ollama response: " + e.getMessage());
        }

        return jsonResponse;
    }
}