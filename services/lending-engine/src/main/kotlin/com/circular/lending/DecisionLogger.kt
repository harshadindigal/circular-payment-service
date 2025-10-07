package com.circular.lending

import com.circular.lending.models.LoanDecision
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.format.DateTimeFormatter

/**
 * Logger for loan decisions to maintain audit trail
 */
@Component
class DecisionLogger {
    private val logger = LoggerFactory.getLogger("LOAN_DECISION_AUDIT")
    private val dateFormatter = DateTimeFormatter.ISO_DATE_TIME
    
    /**
     * Log a loan decision for audit purposes
     * @param decision The loan decision to log
     */
    fun logDecision(decision: LoanDecision) {
        val logEntry = mapOf(
            "timestamp" to dateFormatter.format(decision.timestamp),
            "applicationId" to decision.applicationId.toString(),
            "approved" to decision.approved,
            "approvedAmount" to decision.approvedAmount.toString(),
            "interestRate" to decision.interestRate.toString(),
            "termMonths" to decision.termMonths,
            "reasonCodes" to decision.reasonCodes.joinToString(","),
            "reviewerId" to (decision.reviewerId ?: "SYSTEM")
        )
        
        logger.info("LOAN_DECISION: $logEntry")
    }
    
    /**
     * Log a risk score calculation for audit purposes
     * @param applicationId The loan application ID
     * @param score The calculated risk score
     * @param tier The risk tier
     * @param factors The factors that contributed to the score
     */
    fun logRiskScore(
        applicationId: String,
        score: Int,
        tier: String,
        factors: Map<String, Any>
    ) {
        val logEntry = mapOf(
            "timestamp" to dateFormatter.format(java.time.LocalDateTime.now()),
            "applicationId" to applicationId,
            "riskScore" to score,
            "riskTier" to tier,
            "factors" to factors
        )
        
        logger.info("RISK_SCORE: $logEntry")
    }
}
