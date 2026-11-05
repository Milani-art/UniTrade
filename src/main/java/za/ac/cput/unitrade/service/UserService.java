package za.ac.cput.unitrade.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import za.ac.cput.unitrade.dto.UserDTO;
import za.ac.cput.unitrade.dao.User;
import za.ac.cput.unitrade.dao.PasswordResetRequest;
import za.ac.cput.unitrade.repository.UserRepository;
import za.ac.cput.unitrade.repository.PasswordResetRequestRepository;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service

public class UserService {
    private static final Pattern ALLOWED_UNIVERSITY_EMAIL =
            Pattern.compile("^[^@\\s]+@(mycput|cput)\\.ac\\.za$");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetRequestRepository passwordResetRequestRepository;

    public User register(UserDTO userDTO) {
        String normalizedEmail = userDTO.getUniversityEmail() == null ? "" : userDTO.getUniversityEmail().trim().toLowerCase();
        userDTO.setUniversityEmail(normalizedEmail);

        if (!ALLOWED_UNIVERSITY_EMAIL.matcher(normalizedEmail).matches()) {
            throw new IllegalArgumentException("University email must end with @mycput.ac.za or @cput.ac.za");
        }

        if (userRepository.existsByUniversityEmail(normalizedEmail)) {
            throw new RuntimeException("An account with this email already exists");
        }

        User user = new User();
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setUniversityEmail(normalizedEmail);
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        return userRepository.save(user);
    }

    public Optional<User> login(String universityEmail, String password) {
        String normalizedEmail = universityEmail == null ? "" : universityEmail.trim().toLowerCase();
        Optional<User> user = userRepository.findByUniversityEmail(normalizedEmail);

        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            if (user.get().isBanned()) {
                throw new RuntimeException("This account has been banned.");
            }
            Optional<PasswordResetRequest> resetRequest =
                    passwordResetRequestRepository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
                            user.get().getId(), List.of("PENDING", "APPROVED"));
            if (resetRequest.isPresent()
                    && (resetRequest.get().getExpiresAt() == null
                    || resetRequest.get().getExpiresAt().isAfter(
                    LocalDateTime.now(ZoneId.of("Africa/Johannesburg"))))) {
                throw new RuntimeException(
                        "Password reset required. Please complete your password reset before signing in.");
            }
            return user;
        }

        return Optional.empty();
    }

    public Iterable<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User banUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(true);
        return userRepository.save(user);
    }

    public User unbanUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(false);
        return userRepository.save(user);
    }

    public User verifyUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        return userRepository.save(user);
    }

    public User unverifyUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(false);
        return userRepository.save(user);
    }
}
