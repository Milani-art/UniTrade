package za.ac.cput.unitrade.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.ac.cput.unitrade.dao.Report;
import za.ac.cput.unitrade.dao.User;
import za.ac.cput.unitrade.dao.PasswordResetRequest;
import za.ac.cput.unitrade.service.PasswordResetService;
import za.ac.cput.unitrade.service.ReportService;
import za.ac.cput.unitrade.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private PasswordResetService passwordResetService;

    @GetMapping("/users")
    public ResponseEntity<Iterable<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<User> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.banUser(id));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<User> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.unbanUser(id));
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<User> verifyUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.verifyUser(id));
    }

    @PutMapping("/users/{id}/unverify")
    public ResponseEntity<User> unverifyUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.unverifyUser(id));
    }

    @GetMapping("/reports")
    public ResponseEntity<Iterable<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/password-reset-requests")
    public ResponseEntity<Iterable<PasswordResetRequest>> getPasswordResetRequests() {
        return ResponseEntity.ok(passwordResetService.getAllRequests());
    }

    @PutMapping("/password-reset-requests/{id}")
    public ResponseEntity<?> resolvePasswordResetRequest(
            @PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(passwordResetService.resolveRequest(id, request.get("status")));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<Report> resolveReport(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String action = request.getOrDefault("action", "IGNORE");
        return ResponseEntity.ok(reportService.resolveReport(id, action));
    }
}
