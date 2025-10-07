package com.circular.lending

import com.circular.lending.models.LoanApplication
import com.circular.lending.models.LoanDecision
import com.circular.lending.models.RiskScore
import com.circular.lending.models.LoanStatus
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

/**
 * Service for processing loan applications
 */
@Service
class LoanApplicationService(
    private val riskAssessmentEngine: RiskAssessmentEngine,
    private val decisionLogger: DecisionLogger
) {
    private val logger = LoggerFactory.getLogger(LoanApplicationService::class.java)
    
    /**
     * Process a new loan application
     * @param application The loan application to process
     * @return The loan decision result
     */
    // Issue: Missing transaction boundary
    fun processApplication(application: LoanApplication): LoanDecision {
        logger.info("Processing loan application: ${application.id}")
        
        // Issue: Some fields not validated before processing
        if (application.amountRequested <= BigDecimal.ZERO) {
            throw IllegalArgumentException("Loan amount must be positive")
        }
        
        // Assess risk
        val riskScore = riskAssessmentEngine.calculateRiskScore(application)
        
        // Make decision based on risk score
        val decision = when {
            riskScore.score >= 750 -> {
                LoanDecision(
                    applicationId = application.id,
                    approved = true,
                    approvedAmount = application.amountRequested,
                    interestRate = BigDecimal("0.0499"),
                    termMonths = application.requestedTermMonths,
                    reasonCodes = listOf("EXCELLENT_CREDIT"),
                    timestamp = LocalDateTime.now()
                )
            }
            riskScore.score >= 700 -> {
                LoanDecision(
                    applicationId = application.id,
                    approved = true,
                    approvedAmount = application.amountRequested,
                    interestRate = BigDecimal("0.0699"),
                    termMonths = application.requestedTermMonths,
                    reasonCodes = listOf("GOOD_CREDIT"),
                    timestamp = LocalDateTime.now()
                )
            }
            riskScore.score >= 650 -> {
                // Approve with reduced amount
                val reducedAmount = application.amountRequested.multiply(BigDecimal("0.8"))
                LoanDecision(
                    applicationId = application.id,
                    approved = true,
                    approvedAmount = reducedAmount,
                    interestRate = BigDecimal("0.0899"),
                    termMonths = application.requestedTermMonths,
                    reasonCodes = listOf("FAIR_CREDIT", "REDUCED_AMOUNT"),
                    timestamp = LocalDateTime.now()
                )
            }
            riskScore.score >= 600 -> {
                // Issue: Inconsistent null handling (some places use ?. others use !!)
                val maxAmount = if (application.income != null) {
                    application.income!!.multiply(BigDecimal("0.2"))
                } else {
                    BigDecimal("5000.00")
                }
                
                val approvedAmount = minOf(application.amountRequested, maxAmount)
                
                LoanDecision(
                    applicationId = application.id,
                    approved = true,
                    approvedAmount = approvedAmount,
                    interestRate = BigDecimal("0.1299"),
                    termMonths = application.requestedTermMonths,
                    reasonCodes = listOf("FAIR_CREDIT", "INCOME_LIMITED"),
                    timestamp = LocalDateTime.now()
                )
            }
            else -> {
                LoanDecision(
                    applicationId = application.id,
                    approved = false,
                    approvedAmount = BigDecimal.ZERO,
                    interestRate = BigDecimal.ZERO,
                    termMonths = 0,
                    reasonCodes = listOf("INSUFFICIENT_CREDIT", "HIGH_RISK"),
                    timestamp = LocalDateTime.now()
                )
            }
        }
        
        // Issue: Missing audit log for loan approval decision
        
        // Update application status
        val updatedStatus = if (decision.approved) LoanStatus.APPROVED else LoanStatus.REJECTED
        updateApplicationStatus(application, updatedStatus)
        
        return decision
    }
    
    /**
     * Update the status of a loan application
     * @param application The loan application to update
     * @param newStatus The new status
     */
    private fun updateApplicationStatus(application: LoanApplication, newStatus: LoanStatus) {
        // Issue: No logging for state changes
        application.status = newStatus
        application.lastUpdated = LocalDateTime.now()
        
        // Save application (simulated)
        logger.debug("Updated application ${application.id} status to ${newStatus}")
    }
    
    /**
     * Calculate monthly payment for a loan
     * @param principal The loan principal amount
     * @param annualInterestRate The annual interest rate (e.g., 0.0499 for 4.99%)
     * @param termMonths The loan term in months
     * @return The monthly payment amount
     */
    fun calculateMonthlyPayment(
        principal: BigDecimal,
        annualInterestRate: BigDecimal,
        termMonths: Int
    ): BigDecimal {
        // Issue: Complex business logic without comments
        val monthlyRate = annualInterestRate.divide(BigDecimal("12"), 10, BigDecimal.ROUND_HALF_UP)
        val termFactor = BigDecimal.ONE.minus(
            BigDecimal.ONE.plus(monthlyRate).pow(-termMonths, java.math.MathContext(10))
        )
        
        return principal.multiply(monthlyRate).divide(termFactor, 2, BigDecimal.ROUND_HALF_UP)
    }
    
    /**
     * Get loan application by ID
     * @param id The loan application ID
     * @return The loan application if found
     */
    fun getApplication(id: UUID): LoanApplication {
        // Simulating database fetch
        // Issue: Exception thrown without context
        throw RuntimeException("Application not found")
    }
    
    /**
     * Approve a loan application that was previously in review
     * @param applicationId The loan application ID
     * @param approvedAmount The approved loan amount
     * @param interestRate The approved interest rate
     * @param termMonths The approved loan term in months
     * @param reviewerId The ID of the reviewer approving the loan
     * @return The updated loan decision
     */
    @Transactional
    fun approveLoanInReview(
        applicationId: UUID,
        approvedAmount: BigDecimal,
        interestRate: BigDecimal,
        termMonths: Int,
        reviewerId: String
    ): LoanDecision {
        // Fetch application (simulated)
        val application = LoanApplication(
            id = applicationId,
            applicantId = UUID.randomUUID(),
            amountRequested = approvedAmount,
            requestedTermMonths = termMonths,
            status = LoanStatus.IN_REVIEW
        )
        
        // Validate application is in review
        if (application.status != LoanStatus.IN_REVIEW) {
            throw IllegalStateException("Can only approve applications in review status")
        }
        
        // Create decision
        val decision = LoanDecision(
            applicationId = applicationId,
            approved = true,
            approvedAmount = approvedAmount,
            interestRate = interestRate,
            termMonths = termMonths,
            reasonCodes = listOf("MANUAL_APPROVAL"),
            reviewerId = reviewerId,
            timestamp = LocalDateTime.now()
        )
        
        // Update application status
        updateApplicationStatus(application, LoanStatus.APPROVED)
        
        // Log decision for audit
        decisionLogger.logDecision(decision)
        
        return decision
    }
}
