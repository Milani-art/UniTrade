package za.ac.cput.unitrade.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import za.ac.cput.unitrade.dao.Item;
import za.ac.cput.unitrade.dao.User;
import za.ac.cput.unitrade.repository.ItemRepository;
import za.ac.cput.unitrade.repository.ReportRepository;
import za.ac.cput.unitrade.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Configuration
public class DemoDataConfiguration {
    @Bean
    CommandLineRunner seedDemoMarketplace(
            UserRepository userRepository,
            ItemRepository itemRepository,
            ReportRepository reportRepository,
            BCryptPasswordEncoder passwordEncoder,
            @Value("${unitrade.demo-data.enabled:true}") boolean enabled) {
        return args -> {
            if (userRepository.findByUniversityEmail("admin@cput.ac.za").isEmpty()) {
                User admin = new User();
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setUniversityEmail("admin@cput.ac.za");
                admin.setEmail("admin@cput.ac.za");
                admin.setPassword(passwordEncoder.encode("230226442"));
                admin.setVerified(true);
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }

            List<DemoSeller> sellers = List.of(
                    new DemoSeller("Lerato", "Mokoena", "lerato.mokoena@mycput.ac.za"),
                    new DemoSeller("Sizwe", "Dlamini", "sizwe.dlamini@mycput.ac.za"),
                    new DemoSeller("Ava", "Peters", "ava.peters@mycput.ac.za"),
                    new DemoSeller("Mpho", "Khumalo", "mpho.khumalo@mycput.ac.za")
            );

            if (!enabled) return;
            Set<String> demoEmails = sellers.stream().map(DemoSeller::universityEmail).collect(java.util.stream.Collectors.toSet());
            List<Item> existingItems = itemRepository.findAll();
            boolean onlyDemoData = !existingItems.isEmpty() && existingItems.stream()
                    .allMatch(item -> item.getSeller() != null && demoEmails.contains(item.getSeller().getUniversityEmail()));
            if (!existingItems.isEmpty() && !onlyDemoData) return;
            if (onlyDemoData) {
                reportRepository.deleteAll();
                itemRepository.deleteAll(existingItems);
            }

            List<User> users = sellers.stream().map(seller -> {
                return userRepository.findByUniversityEmail(seller.universityEmail()).orElseGet(() -> {
                    User user = new User();
                    user.setFirstName(seller.firstName());
                    user.setLastName(seller.lastName());
                    user.setUniversityEmail(seller.universityEmail());
                    user.setEmail(seller.firstName().toLowerCase() + ".student@example.com");
                    user.setPassword(passwordEncoder.encode("DemoStudent123!"));
                    user.setVerified(true);
                    return userRepository.save(user);
                });
            }).toList();

            List<DemoListing> listings = List.of(
                    new DemoListing(0, "Computer Science Textbook", "Books", "Good", "180.00", "CPUT Bellville", "A well-kept textbook for computer science students.", "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(1, "Database Systems Guide", "Books", "Like new", "220.00", "CPUT District Six", "Clear diagrams and practical examples for database coursework.", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(2, "Wireless Mouse", "Electronics", "Like new", "120.00", "CPUT District Six", "Lightly used wireless mouse for a reliable study setup.", "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(3, "USB-C Hub", "Electronics", "Good", "250.00", "Woodstock Campus", "Useful multi-port hub for laptops and lab work.", "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(0, "Winter Jacket", "Clothing", "Very good", "260.00", "Woodbridge Island", "Warm jacket in very good condition for early lectures.", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(1, "Canvas Sneakers", "Clothing", "Good", "300.00", "CPUT Bellville", "Comfortable everyday sneakers with plenty of life left.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(2, "Study Desk", "Furniture", "Used", "500.00", "Mowbray", "Compact desk with space for a laptop, books and a lamp.", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(3, "Desk Lamp", "Furniture", "Good", "160.00", "Observatory", "Adjustable lamp for late-night study sessions.", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(0, "Scientific Calculator", "Stationery", "Good", "140.00", "CPUT Bellville", "Fully working calculator for maths and engineering modules.", "https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(1, "Notebook Bundle", "Stationery", "New", "90.00", "CPUT District Six", "Five unused notebooks for the new semester.", "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80"),
                    new DemoListing(2, "Bluetooth Speaker", "Music", "Good", "350.00", "Mowbray", "Portable speaker with clear sound for small gatherings.", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80")
            );

            for (int i = 0; i < listings.size(); i++) {
                DemoListing listing = listings.get(i);
                Item item = Item.builder()
                        .seller(users.get(listing.sellerIndex()))
                        .title(listing.title())
                        .description(listing.description())
                        .category(listing.category())
                        .condition(listing.condition())
                        .price(new BigDecimal(listing.price()))
                        .location(listing.location())
                        .imageUrl(listing.imageUrl())
                        .status("AVAILABLE")
                        .build();
                itemRepository.save(item);
            }
        };
    }

    private record DemoSeller(String firstName, String lastName, String universityEmail) {}
    private record DemoListing(int sellerIndex, String title, String category, String condition, String price, String location, String description, String imageUrl) {}
}
