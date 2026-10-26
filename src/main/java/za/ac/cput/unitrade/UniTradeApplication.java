package za.ac.cput.unitrade;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import za.ac.cput.unitrade.dao.User;
import za.ac.cput.unitrade.repository.UserRepository;

import java.net.ServerSocket;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;

@SpringBootApplication
public class UniTradeApplication {

    public static void main(String[] args) {
        int port = findAvailablePort(8080);
        writePortToFrontend(port);
        SpringApplication app = new SpringApplication(UniTradeApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", String.valueOf(port)));
        app.run(args);
    }

    private static int findAvailablePort(int startPort) {
        int port = startPort;
        while (port < 65535) {
            try (ServerSocket serverSocket = new ServerSocket(port)) {
                return port;
            } catch (IOException ex) {
                port++;
            }
        }
        return startPort;
    }

    private static void writePortToFrontend(int port) {
        try {
            Files.writeString(Paths.get("frontend/.backend-port"), String.valueOf(port));
        } catch (IOException e) {
            System.err.println("Could not write port to frontend: " + e.getMessage());
        }
    }

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUniversityEmail("admin@mycput.ac.za")) {
                User admin = new User();
                admin.setFirstName("Upper");
                admin.setLastName("Admin");
                admin.setUniversityEmail("admin@mycput.ac.za");
                admin.setEmail("admin@mycput.ac.za");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole("ADMIN");
                admin.setVerified(true);
                userRepository.save(admin);
                System.out.println("Default Admin account created: admin@mycput.ac.za / admin");
            }
        };
    }
}
