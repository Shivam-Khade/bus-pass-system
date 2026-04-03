package com.bus_pass.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OcrService {

    private static final String OCR_API_URL = "https://api.ocr.space/parse/image";

    // Uses the free tier OCR.Space api key by default. You can override it in application.properties
    @Value("${ocr.space.api.key:helloworld}")
    private String apiKey;

    public String extractAadhaarNumber(MultipartFile file) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("apikey", apiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Convert MultipartFile into a resource that RestTemplate can send as a form element
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png";
                }
            });
            body.add("language", "eng");


            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            System.out.println("🚀 Sending image to OCR.Space API...");
            ResponseEntity<String> response = restTemplate.postForEntity(OCR_API_URL, requestEntity, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            if (root.has("IsErroredOnProcessing") && root.get("IsErroredOnProcessing").asBoolean()) {
                throw new RuntimeException("OCR API error: " + 
                    (root.has("ErrorMessage") ? root.get("ErrorMessage").toString() : "Unknown API Error"));
            }

            JsonNode parsedResults = root.get("ParsedResults");
            if (parsedResults != null && parsedResults.isArray() && parsedResults.size() > 0) {
                String ocrText = parsedResults.get(0).get("ParsedText").asText();
                System.out.println("📄 OCR raw text:\n" + ocrText);

                String last4 = extractLast4Digits(ocrText);
                if (last4 != null) {
                    System.out.println("✅ Aadhaar last 4 digits: " + last4);
                    return last4;
                }

                throw new RuntimeException("Could not find the last 4 Aadhaar digits in the image. Ensure the Aadhaar card is well-lit and fully visible.");
            }

            throw new RuntimeException("OCR failed to parse the image text.");

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("❌ OCR processing failed: " + e.getMessage());
            throw new RuntimeException("OCR processing failed: " + e.getMessage(), e);
        }
    }

    private String extractLast4Digits(String text) {
        if (text == null || text.isBlank()) return null;

        // Try to handle masked patterns XXXX XXXX 1234
        Matcher m1 = Pattern.compile("[Xx*•]{2,}[\\s]+[Xx*•0-9]{2,}[\\s]+(\\d{4})(?!\\d)").matcher(text);
        if (m1.find()) return m1.group(1);

        // General mask at the beginning of 4 digits
        Matcher m1b = Pattern.compile("[Xx*•\\s]{4,}\\s*(\\d{4})(?!\\d)").matcher(text);
        if (m1b.find()) return m1b.group(1);

        // Basic 12-digit format
        Matcher m2 = Pattern.compile("\\b(\\d{4})[\\s]*(\\d{4})[\\s]*(\\d{4})\\b").matcher(text);
        while (m2.find()) {
            String full = m2.group(1) + m2.group(2) + m2.group(3);
            // Ensure first digit is not 0 or 1, which are invalid for Aadhaar
            if (full.charAt(0) != '0' && full.charAt(0) != '1') {
                return m2.group(3);
            }
        }

        // Final fallback: Find a standalone 4 digit block, preferably near the end
        Matcher m3 = Pattern.compile("(?<!\\d)(\\d{4})(?!\\d)").matcher(text);
        String last4 = null;
        while (m3.find()) {
            last4 = m3.group(1); // Keeps updating to the last found 4 digits
        }
        return last4;
    }
}
