package za.ac.cput.unitrade.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import za.ac.cput.unitrade.dao.PasswordResetRequest;

import java.util.List;
import java.util.Optional;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    Optional<PasswordResetRequest> findByToken(String token);
    List<PasswordResetRequest> findAllByOrderByCreatedAtDesc();
    boolean existsByUserIdAndStatus(Long userId, String status);
}
