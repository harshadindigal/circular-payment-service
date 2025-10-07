package com.circular.lending.models

/**
 * Risk tier classifications
 */
enum class RiskTier {
    VERY_LOW,
    LOW,
    MODERATE,
    HIGH,
    VERY_HIGH
}

/**
 * Risk score model
 */
data class RiskScore(
    val score: Int,
    val tier: RiskTier,
    val factors: Map<String, Any> = emptyMap()
)

/**
 * Loan decision model
 */
data class LoanDecision(
    val applicationId: java.util.UUID,
    val approved: Boolean,
    val approvedAmount: java.math.BigDecimal,
    val interestRate: java.math.BigDecimal,
    val termMonths: Int,
    val reasonCodes: List<String>,
    val reviewerId: String? = null,
    val timestamp: java.time.LocalDateTime
)
