package za.ac.cput.unitrade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MessageSummaryDTO {
    private Long userId;
    private LocalDateTime lastMessageAt;
    private boolean unread;
}
