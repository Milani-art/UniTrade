package za.ac.cput.unitrade.repository;

import za.ac.cput.unitrade.dao.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR (m.sender.id = :user2Id AND m.receiver.id = :user1Id) ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    List<Message> findByReceiverIdAndSenderIdAndReadFalse(Long receiverId, Long senderId);

    List<Message> findBySenderIdOrReceiverIdOrderByTimestampDesc(Long senderId, Long receiverId);
}
