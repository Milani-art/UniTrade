
package za.ac.cput.unitrade.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import za.ac.cput.unitrade.dao.Item;

import java.math.BigDecimal;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {


    Optional<Item> findByIdAndStatus(Long id, String status);

    List<Item> findBySeller_Id(Long sellerId);

    Page<Item> findBySeller_Id(Long sellerId, Pageable pageable);

    Page<Item> findByStatus(String status, Pageable pageable);

    // Browse by category / condition
    Page<Item> findByCategoryIgnoreCaseAndStatus(String category, String status, Pageable pageable);

    Page<Item> findByConditionIgnoreCaseAndStatus(String condition, String status, Pageable pageable);

    // Price filters
    Page<Item> findByStatusAndPriceBetween(String status, BigDecimal min, BigDecimal max, Pageable pageable);

    Page<Item> findByStatusAndPriceLessThanEqual(String status, BigDecimal max, Pageable pageable);

}