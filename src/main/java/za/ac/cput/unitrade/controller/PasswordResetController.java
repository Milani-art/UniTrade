package za.ac.cput.unitrade.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.ac.cput.unitrade.dao.PasswordResetRequest;
import za.ac.cput.unitrade.service.PasswordResetService;

import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {
    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, String> body) {
        try {
            PasswordResetRequest request = passwordResetService.createRequest(body.get("universityEmail"));
            return ResponseEntity.ok(Map.of("token", request.getToken(), "status", request.getStatus()));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/status/{token}")
    public ResponseEntity<?> getStatus(@PathVariable String token) {
        try {
            return ResponseEntity.ok(Map.of("status", passwordResetService.getStatus(token)));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeReset(@RequestBody Map<String, String> body) {
        try {
            passwordResetService.completeReset(body.get("token"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
