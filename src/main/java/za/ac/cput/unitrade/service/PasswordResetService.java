package za.ac.cput.unitrade.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.ac.cput.unitrade.dao.PasswordResetRequest;
import za.ac.cput.unitrade.dao.User;
import za.ac.cput.unitrade.repository.PasswordResetRequestRepository;
import za.ac.cput.unitrade.repository.UserRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
public class PasswordResetService {
    private static final ZoneId SOUTH_AFRICA = ZoneId.of("Africa/Johannesburg");
    private final PasswordResetRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public PasswordResetService(PasswordResetRequestRepository requestRepository,
                                UserRepository userRepository,
                                BCryptPasswordEncoder passwordEncoder) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public PasswordResetRequest createRequest(String universityEmail) {
        String normalizedEmail = universityEmail == null ? "" : universityEmail.trim().toLowerCase();
        User user = userRepository.findByUniversityEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("If that account exists, a reset request has been submitted."));

        PasswordResetRequest pendingRequest =
                requestRepository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
                        user.getId(), List.of("PENDING")).orElse(null);
        if (pendingRequest != null
                && (pendingRequest.getExpiresAt() == null
                || pendingRequest.getExpiresAt().isAfter(LocalDateTime.now(SOUTH_AFRICA)))) {
            throw new IllegalStateException("If that account exists, a reset request has been submitted.");
        }

        PasswordResetRequest request = new PasswordResetRequest();
        request.setUser(user);
        request.setToken(UUID.randomUUID().toString());
        request.setStatus("PENDING");
        return requestRepository.save(request);
    }

    public List<PasswordResetRequest> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public PasswordResetRequest resolveRequest(Long id, String status) {
        if (!"APPROVED".equals(status) && !"REJECTED".equals(status)) {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }

        PasswordResetRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Password reset request not found"));
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("This password reset request has already been resolved.");
        }

        request.setStatus(status);
        request.setResolvedAt(LocalDateTime.now(SOUTH_AFRICA));
        return requestRepository.save(request);
    }

    @Transactional
    public void completeReset(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Invalid password reset request.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }

        PasswordResetRequest request = requestRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset request."));
        if (!"APPROVED".equals(request.getStatus())) {
            throw new IllegalStateException("This password reset request has not been approved.");
        }
        if (request.getExpiresAt() == null
                || request.getExpiresAt().isBefore(LocalDateTime.now(SOUTH_AFRICA))) {
            throw new IllegalStateException("This password reset request has expired.");
        }

        User user = request.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        request.setStatus("COMPLETED");
        request.setResolvedAt(LocalDateTime.now(SOUTH_AFRICA));
        requestRepository.save(request);
    }

    public String getStatus(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Invalid password reset request.");
        }
        return requestRepository.findByToken(token)
                .filter(request -> request.getExpiresAt() != null
                        && request.getExpiresAt().isAfter(LocalDateTime.now(SOUTH_AFRICA)))
                .map(PasswordResetRequest::getStatus)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset request."));
    }
}
