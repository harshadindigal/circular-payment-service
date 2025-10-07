# Audit Requirements

This document outlines the audit requirements for the Circular platform to ensure compliance with SOX, PCI-DSS, and other regulatory frameworks.

## SOX Compliance Checklist

### Financial Transaction Logging

All financial transactions must log the following information:

| Field | Description | Required |
|-------|-------------|----------|
| Transaction ID | Unique identifier for the transaction | Yes |
| Timestamp (UTC) | When the transaction occurred | Yes |
| User ID | ID of the user who initiated the transaction | Yes |
| IP Address | Origin IP address | Yes |
| Amount | Transaction amount with currency | Yes |
| Transaction Type | Payment, refund, etc. | Yes |
| Status | Success, failure, pending | Yes |
| Error Code | If applicable | When failed |
| Approval ID | ID from payment processor | For approved transactions |
| Related Transaction ID | For refunds, captures, etc. | When applicable |

### System Access Logging

System access events must log:

| Field | Description | Required |
|-------|-------------|----------|
| Event ID | Unique identifier for the event | Yes |
| Timestamp (UTC) | When the event occurred | Yes |
| User ID | ID of the user | Yes |
| IP Address | Origin IP address | Yes |
| Action | Login, logout, access attempt, etc. | Yes |
| Resource | What was accessed | Yes |
| Status | Success, failure | Yes |
| Reason | Reason for failure | When failed |

### Data Modification Logging

Data changes must log:

| Field | Description | Required |
|-------|-------------|----------|
| Event ID | Unique identifier for the event | Yes |
| Timestamp (UTC) | When the change occurred | Yes |
| User ID | ID of the user who made the change | Yes |
| Entity Type | Type of data modified | Yes |
| Entity ID | ID of the specific record | Yes |
| Action | Create, update, delete | Yes |
| Field Changes | Before and after values | For updates |
| Reason | Business reason for change | Yes |

## Audit Trail Format Specifications

### Log Format

All audit logs must be in JSON format with the following base structure:

```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601 timestamp",
  "userId": "user identifier",
  "ipAddress": "IP address",
  "service": "service name",
  "action": "action performed",
  "status": "success/failure",
  "details": { /* action-specific details */ }
}
```

### Log Storage

* All audit logs must be stored in a tamper-proof storage system
* Logs must be backed up daily to a separate secure location
* Log access must be restricted and itself logged

## Retention Policies

| Data Type | Retention Period | Archival Period |
|----------|-----------------|------------------|
| Financial Transactions | 7 years | Additional 3 years |
| Authentication Logs | 2 years | Additional 3 years |
| System Access Logs | 2 years | Additional 3 years |
| Data Modification Logs | 7 years | Additional 3 years |
| Customer Data | 7 years after last activity | Additional 3 years |

## Audit Review Process

1. Daily automated review of security-related events
2. Weekly manual review of high-value transaction logs
3. Monthly comprehensive audit of system access
4. Quarterly review of all audit mechanisms
5. Annual third-party audit of the entire system

## Audit Trail Protection

* Encryption of all audit data at rest and in transit
* Separation of duties between system administrators and audit reviewers
* Immutable storage for all audit records
* Regular testing of audit trail recovery procedures
