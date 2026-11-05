package za.ac.cput.unitrade.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import za.ac.cput.unitrade.dao.PasswordResetRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    Optional<PasswordResetRequest> findByToken(String token);
    List<PasswordResetRequest> findAllByOrderByCreatedAtDesc();
    boolean existsByUserIdAndStatus(Long userId, String status);
    boolean existsByUserIdAndStatusAndExpiresAtAfter(Long userId, String status, LocalDateTime now);
    boolean existsByUserIdAndStatusInAndExpiresAtAfter(
            Long userId, List<String> statuses, LocalDateTime now);
    Optional<PasswordResetRequest> findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
            Long userId, List<String> statuses);
}
