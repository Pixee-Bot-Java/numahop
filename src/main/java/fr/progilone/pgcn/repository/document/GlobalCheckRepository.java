package fr.progilone.pgcn.repository.document;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.progilone.pgcn.domain.document.GlobalCheck;

/**
 * Created by lebouchp on 10/02/2017.
 */
public interface GlobalCheckRepository extends JpaRepository<GlobalCheck, String> {
}