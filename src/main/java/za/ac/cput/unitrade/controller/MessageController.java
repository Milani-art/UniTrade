package za.ac.cput.unitrade.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import za.ac.cput.unitrade.dao.Message;
import za.ac.cput.unitrade.dto.MessageDTO;
import za.ac.cput.unitrade.dto.MessageSummaryDTO;
import za.ac.cput.unitrade.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDTO messageDTO) {
        try {
            Message message = messageService.sendMessage(messageDTO);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{user1Id}/{user2Id}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long user1Id,
            @PathVariable Long user2Id) {
        List<Message> conversation = messageService.getConversation(user1Id, user2Id);
        return ResponseEntity.ok(conversation);
    }

    @PutMapping("/{userId}/{otherUserId}/read")
    public ResponseEntity<Void> markConversationRead(
            @PathVariable Long userId,
            @PathVariable Long otherUserId) {
        messageService.markConversationRead(userId, otherUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summaries/{userId}")
    public ResponseEntity<List<MessageSummaryDTO>> getSummaries(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getSummaries(userId));
    }
}
