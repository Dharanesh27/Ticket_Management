package com.supportdesk.backend.comment.repository;

import com.supportdesk.backend.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // For customers: only visible non-internal comments
    List<Comment> findByTicketIdAndInternalNoteFalseOrderByCreatedAtAsc(Long ticketId);

    // For agents and admins: all comments including internal notes
    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
