package za.ac.cput.unitrade.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import za.ac.cput.unitrade.dao.Message;
import za.ac.cput.unitrade.dao.User;
import za.ac.cput.unitrade.dto.MessageDTO;
import za.ac.cput.unitrade.dto.MessageSummaryDTO;
import za.ac.cput.unitrade.repository.MessageRepository;
import za.ac.cput.unitrade.repository.UserRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public Message sendMessage(MessageDTO messageDTO) {
        Optional<User> senderOpt = userRepository.findById(messageDTO.getSenderId());
        Optional<User> receiverOpt = userRepository.findById(messageDTO.getReceiverId());

        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            throw new RuntimeException("Sender or receiver not found");
        }

        Message message = new Message();
        message.setSender(senderOpt.get());
        message.setReceiver(receiverOpt.get());
        message.setContent(messageDTO.getContent());
        message.setTimestamp(LocalDateTime.now(ZoneId.of("Africa/Johannesburg")));
        message.setRead(false);

        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long user1Id, Long user2Id) {
        return messageRepository.findConversation(user1Id, user2Id);
    }

    public void markConversationRead(Long userId, Long otherUserId) {
        List<Message> unreadMessages =
                messageRepository.findByReceiverIdAndSenderIdAndReadFalse(userId, otherUserId);
        unreadMessages.forEach(message -> message.setRead(true));
        messageRepository.saveAll(unreadMessages);
    }

    public List<MessageSummaryDTO> getSummaries(Long userId) {
        List<Message> messages = messageRepository
                .findBySenderIdOrReceiverIdOrderByTimestampDesc(userId, userId);
        Map<Long, MessageSummaryDTO> summaries = new HashMap<>();

        for (Message message : messages) {
            Long otherUserId = message.getSender().getId().equals(userId)
                    ? message.getReceiver().getId() : message.getSender().getId();
            boolean unreadReceived = message.getReceiver().getId().equals(userId) && !message.isRead();
            MessageSummaryDTO summary = summaries.get(otherUserId);
            if (summary == null) {
                summaries.put(otherUserId, new MessageSummaryDTO(
                        otherUserId,
                        message.getTimestamp(),
                        unreadReceived));
            } else if (unreadReceived) {
                summary.setUnread(true);
            }
        }
        return summaries.values().stream()
                .sorted((first, second) -> second.getLastMessageAt().compareTo(first.getLastMessageAt()))
                .toList();
    }
}
