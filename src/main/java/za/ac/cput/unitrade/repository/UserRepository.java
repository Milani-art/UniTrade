package za.ac.cput.unitrade.repository;

import za.ac.cput.unitrade.dao.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
//add comments
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUniversityEmail(String universityEmail);

    boolean existsByUniversityEmail(String universityEmail);
}
