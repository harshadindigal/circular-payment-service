package com.circular.lending.models

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

/**
 * Loan application status
 */
enum class LoanStatus {
    DRAFT,
    SUBMITTED,
    IN_REVIEW,
    APPROVED,
    REJECTED,
    CANCELLED
}

/**
 * Loan application model
 */
// Issue: Missing validation annotations on some fields - Updated
data class LoanApplication(
    val id: UUID = UUID.randomUUID(),
    val applicantId: UUID,
    val amountRequested: BigDecimal,
    val requestedTermMonths: Int,
    var status: LoanStatus = LoanStatus.DRAFT,
    val applicationDate: LocalDateTime = LocalDateTime.now(),
    var lastUpdated: LocalDateTime = LocalDateTime.now(),
    
    // Applicant information
    val firstName: String? = null,
    val lastName: String? = null,
    val dateOfBirth: LocalDate? = null,
    val email: String? = null,
    val phoneNumber: String? = null,
    
    // Financial information
    val income: BigDecimal? = null, // Issue: Missing nullable annotations where needed
    val monthlyDebtPayments: BigDecimal = BigDecimal.ZERO,
    val creditScore: Int = 0,
    val employmentMonths: Int = 0,
    
    // Address information
    val addressLine1: String? = null,
    val addressLine2: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zipCode: String? = null,
    
    // Additional information
    val purpose: String? = null,
    val metadata: Map<String, Any> = emptyMap()
) {
    // Issue: No constraints on monetary amounts
    
    /**
     * Check if the application is complete and ready for review
     * @return True if the application is complete
     */
    fun isComplete(): Boolean {
        return firstName != null &&
                lastName != null &&
                dateOfBirth != null &&
                email != null &&
                phoneNumber != null &&
                income != null &&
                income > BigDecimal.ZERO &&
                creditScore > 0 &&
                addressLine1 != null &&
                city != null &&
                state != null &&
                zipCode != null &&
                purpose != null
    }
    
    /**
     * Calculate the age of the applicant
     * @return The applicant's age in years
     */
    fun getApplicantAge(): Int? {
        return dateOfBirth?.let {
            val period = java.time.Period.between(it, LocalDate.now())
            period.years
        }
    }
}
