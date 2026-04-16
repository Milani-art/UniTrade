package za.ac.cput.unitrade.repository;

import za.ac.cput.unitrade.dto.ServiceItemDTO;
import java.util.List;


public interface ServiceItemRepository {

    void add(ServiceItemDTO item);

    List<ServiceItemDTO> getAll();

    ServiceItemDTO getById(int id);

    void delete(int id);
}
