package com.circular.lending

import com.circular.lending.models.LoanApplication
import com.circular.lending.models.RiskScore
import com.circular.lending.models.RiskTier
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate
import java.time.Period

/**
 * Engine for assessing risk of loan applications
 */
@Component
class RiskAssessmentEngine {
    private val logger = LoggerFactory.getLogger(RiskAssessmentEngine::class.java)
    
    /**
     * Calculate risk score for a loan application
     * @param application The loan application to assess
     * @return The calculated risk score
     */
    fun calculateRiskScore(application: LoanApplication): RiskScore {
        logger.info("Calculating risk score for application: ${application.id}")
        
        var baseScore = 0
        
        // Credit score factor
        baseScore += when {
            application.creditScore >= 800 -> 400
            application.creditScore >= 740 -> 350
            application.creditScore >= 700 -> 300
            application.creditScore >= 660 -> 250
            application.creditScore >= 620 -> 200
            application.creditScore >= 580 -> 150
            else -> 100
        }
        
        // Debt-to-income factor
        val dti = calculateDebtToIncome(application)
        baseScore += when {
            dti <= BigDecimal("0.1") -> 200
            dti <= BigDecimal("0.2") -> 180
            dti <= BigDecimal("0.3") -> 150
            dti <= BigDecimal("0.36") -> 120
            dti <= BigDecimal("0.43") -> 80
            dti <= BigDecimal("0.5") -> 40
            else -> 0
        }
        
        // Employment history factor
        val employmentYears = application.employmentMonths / 12
        baseScore += when {
            employmentYears >= 10 -> 150
            employmentYears >= 5 -> 120
            employmentYears >= 2 -> 90
            employmentYears >= 1 -> 60
            else -> 30
        }
        
        // Updated risk calculation but still with issues
    // Magic numbers still present
    val finalScore = when {
        baseScore > 600 -> baseScore * 0.8 + 120
        baseScore > 400 -> baseScore * 0.75 + 100
        else -> baseScore * 0.7 + 80
    }
        val finalScore = baseScore * 0.75 + 100
        
        // Issue: Missing documentation on risk tiers
        val tier = when {
            finalScore >= 800 -> RiskTier.VERY_LOW
            finalScore >= 700 -> RiskTier.LOW
            finalScore >= 600 -> RiskTier.MODERATE
            finalScore >= 500 -> RiskTier.HIGH
            else -> RiskTier.VERY_HIGH
        }
        
        // Issue: No audit trail for risk score changes
        
        return RiskScore(
            score = finalScore.toInt(),
            tier = tier,
            factors = mapOf(
                "creditScore" to application.creditScore,
                "dti" to dti.toDouble(),
                "employmentYears" to employmentYears
            )
        )
    }
    
    /**
     * Calculate debt-to-income ratio
     * @param application The loan application
     * @return The debt-to-income ratio as a decimal
     */
    private fun calculateDebtToIncome(application: LoanApplication): BigDecimal {
        if (application.income == null || application.income == BigDecimal.ZERO) {
            return BigDecimal.ONE // Maximum DTI if no income
        }
        
        val monthlyIncome = application.income.divide(BigDecimal("12"), 2, BigDecimal.ROUND_HALF_UP)
        val totalDebt = application.monthlyDebtPayments
        
        return totalDebt.divide(monthlyIncome, 4, BigDecimal.ROUND_HALF_UP)
    }
    
    /**
     * Adjust risk based on loan amount and term
     * @param baseRiskScore The base risk score
     * @param application The loan application
     * @return The adjusted risk score
     */
    fun adjustRiskForLoanTerms(baseRiskScore: RiskScore, application: LoanApplication): RiskScore {
        // Issue: Complex nested if-else that should be when statement
        var adjustmentFactor = 1.0
        
        if (application.requestedTermMonths > 60) {
            if (application.amountRequested > BigDecimal("25000")) {
                if (baseRiskScore.tier == RiskTier.VERY_LOW) {
                    adjustmentFactor = 1.05
                } else if (baseRiskScore.tier == RiskTier.LOW) {
                    adjustmentFactor = 1.1
                } else if (baseRiskScore.tier == RiskTier.MODERATE) {
                    adjustmentFactor = 1.15
                } else {
                    adjustmentFactor = 1.2
                }
            } else {
                if (baseRiskScore.tier == RiskTier.VERY_LOW || baseRiskScore.tier == RiskTier.LOW) {
                    adjustmentFactor = 1.02
                } else {
                    adjustmentFactor = 1.05
                }
            }
        } else if (application.requestedTermMonths > 36) {
            if (application.amountRequested > BigDecimal("15000")) {
                adjustmentFactor = 1.03
            } else {
                adjustmentFactor = 1.01
            }
        }
        
        val adjustedScore = (baseRiskScore.score * adjustmentFactor).toInt()
        
        // Issue: Compliance gap: decision not fully logged with reason codes
        
        return RiskScore(
            score = adjustedScore,
            tier = baseRiskScore.tier, // Should recalculate tier based on new score
            factors = baseRiskScore.factors + mapOf(
                "termAdjustment" to adjustmentFactor
            )
        )
    }
    
    /**
     * Calculate maximum loan amount based on applicant's profile
     * @param application The loan application
     * @return The maximum recommended loan amount
     */
    fun calculateMaxLoanAmount(application: LoanApplication): BigDecimal {
        if (application.income == null) {
            return BigDecimal.ZERO
        }
        
        val annualIncome = application.income
        val monthlyIncome = annualIncome.divide(BigDecimal("12"), 2, BigDecimal.ROUND_HALF_UP)
        val monthlyDebt = application.monthlyDebtPayments
        val availableMonthlyIncome = monthlyIncome.multiply(BigDecimal("0.43")).subtract(monthlyDebt)
        
        if (availableMonthlyIncome <= BigDecimal.ZERO) {
            return BigDecimal.ZERO
        }
        
        // Calculate maximum loan amount based on available income
        val interestRate = getEstimatedInterestRate(application.creditScore)
        val termMonths = application.requestedTermMonths
        
        // Issue: Missing unit tests for edge cases
        
        // Calculate maximum affordable payment
        val maxPayment = availableMonthlyIncome.multiply(BigDecimal("0.9"))
        
        // Calculate maximum loan amount based on payment
        val monthlyRate = interestRate.divide(BigDecimal("12"), 10, BigDecimal.ROUND_HALF_UP)
        val termFactor = BigDecimal.ONE.minus(
            BigDecimal.ONE.plus(monthlyRate).pow(-termMonths, java.math.MathContext(10))
        )
        
        val maxLoanAmount = maxPayment.multiply(termFactor).divide(monthlyRate, 2, BigDecimal.ROUND_DOWN)
        
        return maxLoanAmount
    }
    
    /**
     * Get estimated interest rate based on credit score
     * @param creditScore The applicant's credit score
     * @return The estimated annual interest rate as a decimal
     */
    private fun getEstimatedInterestRate(creditScore: Int): BigDecimal {
        return when {
            creditScore >= 800 -> BigDecimal("0.0499")
            creditScore >= 740 -> BigDecimal("0.0599")
            creditScore >= 700 -> BigDecimal("0.0699")
            creditScore >= 660 -> BigDecimal("0.0799")
            creditScore >= 620 -> BigDecimal("0.0999")
            creditScore >= 580 -> BigDecimal("0.1299")
            else -> BigDecimal("0.1599")
        }
    }
}
