package com.ecommerce.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BrevoDiagnosticsService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    /**
     * Calls Brevo account endpoint to verify the API key and logs details.
     */
    public boolean verifyApiKey() {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", brevoApiKey);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Void> req = new HttpEntity<>(headers);
        String accountUrl = "https://api.brevo.com/v3/account";
        try {
            ResponseEntity<String> resp = restTemplate.exchange(accountUrl, HttpMethod.GET, req, String.class);
            System.out.println("Brevo account check status: " + resp.getStatusCode());
            System.out.println("Brevo account response headers: " + resp.getHeaders());
            System.out.println("Brevo account response body: " + resp.getBody());
            if (resp.getHeaders() != null && resp.getHeaders().containsKey("sib-request-id")) {
                System.out.println("Brevo sib-request-id: " + resp.getHeaders().getFirst("sib-request-id"));
            }
            return resp.getStatusCode().is2xxSuccessful();
        } catch (org.springframework.web.client.HttpClientErrorException ex) {
            System.err.println("Brevo account check failed: status=" + ex.getStatusCode() + " body=" + ex.getResponseBodyAsString());
            System.err.println("Brevo account error headers: " + ex.getResponseHeaders());
            if (ex.getResponseHeaders() != null && ex.getResponseHeaders().containsKey("sib-request-id")) {
                System.err.println("Brevo sib-request-id: " + ex.getResponseHeaders().getFirst("sib-request-id"));
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}