package fr.progilone.pgcn.web.error;

import fr.progilone.pgcn.domain.user.User;
import fr.progilone.pgcn.exception.PgcnBusinessException;
import fr.progilone.pgcn.exception.PgcnException;
import fr.progilone.pgcn.exception.PgcnListValidationException;
import fr.progilone.pgcn.exception.PgcnLockException;
import fr.progilone.pgcn.exception.PgcnTechnicalException;
import fr.progilone.pgcn.exception.PgcnUnAuthorizedException;
import fr.progilone.pgcn.exception.PgcnValidationException;
import fr.progilone.pgcn.exception.dto.PgcnBusinessExceptionDTO;
import fr.progilone.pgcn.exception.message.PgcnError;
import fr.progilone.pgcn.exception.message.PgcnErrorCode;
import fr.progilone.pgcn.service.user.UserService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.persistence.EntityNotFoundException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Handler permettant de définir les statuts HTTP et les messages d'erreurs à transmettre en JSON en cas d'exception
 * levée.
 *
 * @author David
 */
@ControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @Autowired
    private UserService userService;

    // 401
    @ExceptionHandler(PgcnUnAuthorizedException.class)
    protected ResponseEntity<Object> handleUnAuthorizedException(final PgcnUnAuthorizedException ex, final WebRequest request) {
        return handleExceptionInternal(ex, null, new HttpHeaders(), HttpStatus.UNAUTHORIZED, request);
    }

    // 412
    @ExceptionHandler(PgcnLockException.class)
    protected ResponseEntity<Object> handleObjectLockedException(final PgcnLockException ex, final WebRequest request) {
        final Map<String, Object> lockDetails = ex.getLockDetails();
        lockDetails.put("type", "PgcnLockException");
        addUserName(ex, lockDetails);
        return handleExceptionInternal(ex, lockDetails, new HttpHeaders(), HttpStatus.PRECONDITION_FAILED, request);
    }

    // 412
    @ExceptionHandler(PgcnValidationException.class)
    protected ResponseEntity<Object> handlePgcnException(final PgcnValidationException ex, final WebRequest request) {
        return handleExceptionInternal(ex, ex.getInvalidObject(), new HttpHeaders(), HttpStatus.PRECONDITION_FAILED, request);
    }

    // 412
    @ExceptionHandler(PgcnListValidationException.class)
    protected ResponseEntity<Object> handlePgcnException(final PgcnListValidationException ex, final WebRequest request) {
        return handleExceptionInternal(ex, ex.getInvalidObjects(), new HttpHeaders(), HttpStatus.PRECONDITION_FAILED, request);
    }

    // 417
    @ExceptionHandler(PgcnBusinessException.class)
    protected ResponseEntity<Object> handlePgcnException(final PgcnBusinessException ex, final WebRequest request) {
        PgcnBusinessExceptionDTO pgcnBusinessExceptionDTO = new PgcnBusinessExceptionDTO(ex.getLevel(), ex.getErrors());
        return handleExceptionInternal(ex, pgcnBusinessExceptionDTO, new HttpHeaders(), HttpStatus.EXPECTATION_FAILED, request);
    }

    // 417
    @ExceptionHandler(PgcnTechnicalException.class)
    protected ResponseEntity<Object> handlePgcnException(final PgcnTechnicalException ex, final WebRequest request) {
        final Map<String, Object> details = new HashMap<>();
        details.put("type", "PgcnTechnicalException");
        details.put("errors", Collections.emptyList());
        details.put("message", ex.getMessage());
        return handleExceptionInternal(ex, details, new HttpHeaders(), HttpStatus.EXPECTATION_FAILED, request);
    }

    // 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<Object> handleDataIntegrityViolationException(final DataIntegrityViolationException ex, final WebRequest request) {
        return handleExceptionInternal(ex,
                                       new PgcnError.Builder().setCode(PgcnErrorCode.DATA_INTEGRITY_VIOLATION).build(),
                                       new HttpHeaders(),
                                       HttpStatus.CONFLICT,
                                       request);
    }

    // 404
    @ExceptionHandler(EntityNotFoundException.class)
    protected ResponseEntity<Object> handleEntityNotFoundException(final EntityNotFoundException ex, final WebRequest request) {
        return handleExceptionInternal(ex, null, new HttpHeaders(), HttpStatus.NOT_FOUND, request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(final Exception ex,
                                                             final Object body,
                                                             final HttpHeaders headers,
                                                             final HttpStatus status,
                                                             final WebRequest request) {
        if (ex instanceof PgcnException) {
            if (logger.isTraceEnabled()) {
                logger.trace("Erreur de validation : " + ex.getMessage());
            }
        } else {
            logger.error("Une exception est survenue pour l'" + request.getDescription(true), ex);
        }
        return super.handleExceptionInternal(ex, body, headers, status, request);
    }

    private void addUserName(final PgcnLockException ex, final Map<String, Object> lockDetails) {
        if (StringUtils.isNotBlank(ex.getLockedBy())) {
            final User user = userService.findByLogin(ex.getLockedBy());

            if (user != null) {
                lockDetails.put("lockedByName", user.getFullName());
            }
        }
        if (!lockDetails.containsKey("lockedByName")) {
            lockDetails.put("lockedByName", ex.getLockedBy());
        }
    }
}