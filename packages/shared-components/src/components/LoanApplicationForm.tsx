import React, { useState } from 'react';
import styled from 'styled-components';
import { z } from 'zod';

// Types/Interfaces
export interface LoanApplicationFormProps {
  onSubmit: (applicationData: LoanApplicationData) => Promise<void>;
  initialValues?: Partial<LoanApplicationData>;
  isProcessing?: boolean;
}

export interface LoanApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  income: number;
  employmentMonths: number;
  loanAmount: number;
  loanPurpose: string;
  loanTermMonths: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}

// Styled components
const FormContainer = styled.div`
  max-width: 700px;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
`;

const FormTitle = styled.h2`
  margin-bottom: 24px;
  color: #333333;
  font-size: 24px;
`;

const FormSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 16px;
  color: #555555;
  font-size: 18px;
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
  
  &.error {
    border-color: #cc0000;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: #0066cc;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #0055aa;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #cc0000;
  font-size: 14px;
  margin-top: 4px;
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  margin-right: 8px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * Loan application form component
 * @param onSubmit Function to handle form submission
 * @param initialValues Initial form values
 * @param isProcessing Whether the form is currently being processed
 */
export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  onSubmit,
  initialValues = {},
  isProcessing = false,
}) => {
  const [formData, setFormData] = useState<Partial<LoanApplicationData>>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    income: 0,
    employmentMonths: 0,
    loanAmount: 0,
    loanPurpose: '',
    loanTermMonths: 36,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    ...initialValues,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['income', 'employmentMonths', 'loanAmount', 'loanTermMonths'].includes(name)
        ? Number(value)
        : value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validateForm = (): boolean => {
    const schema = z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email address'),
      phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
      dateOfBirth: z.string().min(1, 'Date of birth is required'),
      income: z.number().min(1, 'Income must be greater than zero'),
      employmentMonths: z.number().min(0, 'Employment months cannot be negative'),
      loanAmount: z.number().min(1000, 'Loan amount must be at least $1,000'),
      loanPurpose: z.string().min(1, 'Loan purpose is required'),
      loanTermMonths: z.number().min(6, 'Loan term must be at least 6 months'),
      addressLine1: z.string().min(1, 'Address is required'),
      addressLine2: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
    });
    
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData as LoanApplicationData);
    } catch (error) {
      setSubmissionError('An error occurred while submitting your application. Please try again.');
    }
  };
  
  return (
    <FormContainer>
      <FormTitle>Loan Application</FormTitle>
      
      {submissionError && (
        <ErrorMessage style={{ marginBottom: '16px' }}>
          {submissionError}
        </ErrorMessage>
      )}
      
      <form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>Personal Information</SectionTitle>
          
          <Row>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName || ''}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
                aria-describedby="firstNameError"
                aria-required="true"
              />
              {errors.firstName && (
                <ErrorMessage id="firstNameError">{errors.firstName}</ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName || ''}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                aria-describedby="lastNameError"
                aria-required="true"
              />
              {errors.lastName && (
                <ErrorMessage id="lastNameError">{errors.lastName}</ErrorMessage>
              )}
            </FormGroup>
          </Row>
          
          <Row>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                aria-describedby="emailError"
                aria-required="true"
              />
              {errors.email && (
                <ErrorMessage id="emailError">{errors.email}</ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                className={errors.phoneNumber ? 'error' : ''}
                aria-describedby="phoneNumberError"
                aria-required="true"
              />
              {errors.phoneNumber && (
                <ErrorMessage id="phoneNumberError">{errors.phoneNumber}</ErrorMessage>
              )}
            </FormGroup>
          </Row>
          
          <FormGroup>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
              className={errors.dateOfBirth ? 'error' : ''}
              aria-describedby="dateOfBirthError"
              aria-required="true"
            />
            {errors.dateOfBirth && (
              <ErrorMessage id="dateOfBirthError">{errors.dateOfBirth}</ErrorMessage>
            )}
          </FormGroup>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Financial Information</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="income">Annual Income ($)</Label>
            <Input
              id="income"
              name="income"
              type="number"
              min="0"
              step="1000"
              value={formData.income || ''}
              onChange={handleChange}
              className={errors.income ? 'error' : ''}
              aria-describedby="incomeError"
              aria-required="true"
            />
            {errors.income && (
              <ErrorMessage id="incomeError">{errors.income}</ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="employmentMonths">Employment Duration (months)</Label>
            <Input
              id="employmentMonths"
              name="employmentMonths"
              type="number"
              min="0"
              value={formData.employmentMonths || ''}
              onChange={handleChange}
              className={errors.employmentMonths ? 'error' : ''}
              aria-describedby="employmentMonthsError"
              aria-required="true"
            />
            {errors.employmentMonths && (
              <ErrorMessage id="employmentMonthsError">{errors.employmentMonths}</ErrorMessage>
            )}
          </FormGroup>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Loan Details</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="loanAmount">Loan Amount ($)</Label>
            <Input
              id="loanAmount"
              name="loanAmount"
              type="number"
              min="1000"
              step="500"
              value={formData.loanAmount || ''}
              onChange={handleChange}
              className={errors.loanAmount ? 'error' : ''}
              aria-describedby="loanAmountError"
              aria-required="true"
            />
            {errors.loanAmount && (
              <ErrorMessage id="loanAmountError">{errors.loanAmount}</ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="loanPurpose">Loan Purpose</Label>
            <Select
              id="loanPurpose"
              name="loanPurpose"
              value={formData.loanPurpose || ''}
              onChange={handleChange}
              className={errors.loanPurpose ? 'error' : ''}
              aria-describedby="loanPurposeError"
              aria-required="true"
            >
              <option value="">Select a purpose</option>
              <option value="home_improvement">Home Improvement</option>
              <option value="debt_consolidation">Debt Consolidation</option>
              <option value="major_purchase">Major Purchase</option>
              <option value="education">Education</option>
              <option value="medical">Medical Expenses</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </Select>
            {errors.loanPurpose && (
              <ErrorMessage id="loanPurposeError">{errors.loanPurpose}</ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="loanTermMonths">Loan Term (months)</Label>
            <Select
              id="loanTermMonths"
              name="loanTermMonths"
              value={formData.loanTermMonths || 36}
              onChange={handleChange}
              className={errors.loanTermMonths ? 'error' : ''}
              aria-describedby="loanTermMonthsError"
              aria-required="true"
            >
              <option value={12}>12 months (1 year)</option>
              <option value={24}>24 months (2 years)</option>
              <option value={36}>36 months (3 years)</option>
              <option value={48}>48 months (4 years)</option>
              <option value={60}>60 months (5 years)</option>
              <option value={72}>72 months (6 years)</option>
              <option value={84}>84 months (7 years)</option>
            </Select>
            {errors.loanTermMonths && (
              <ErrorMessage id="loanTermMonthsError">{errors.loanTermMonths}</ErrorMessage>
            )}
          </FormGroup>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Address</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              type="text"
              value={formData.addressLine1 || ''}
              onChange={handleChange}
              className={errors.addressLine1 ? 'error' : ''}
              aria-describedby="addressLine1Error"
              aria-required="true"
            />
            {errors.addressLine1 && (
              <ErrorMessage id="addressLine1Error">{errors.addressLine1}</ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              type="text"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              aria-required="false"
            />
          </FormGroup>
          
          <Row>
            <FormGroup style={{ flex: 2 }}>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city || ''}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
                aria-describedby="cityError"
                aria-required="true"
              />
              {errors.city && (
                <ErrorMessage id="cityError">{errors.city}</ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                type="text"
                value={formData.state || ''}
                onChange={handleChange}
                className={errors.state ? 'error' : ''}
                aria-describedby="stateError"
                aria-required="true"
              />
              {errors.state && (
                <ErrorMessage id="stateError">{errors.state}</ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode || ''}
                onChange={handleChange}
                className={errors.zipCode ? 'error' : ''}
                aria-describedby="zipCodeError"
                aria-required="true"
              />
              {errors.zipCode && (
                <ErrorMessage id="zipCodeError">{errors.zipCode}</ErrorMessage>
              )}
            </FormGroup>
          </Row>
        </FormSection>
        
        <SubmitButton type="submit" disabled={isProcessing}>
          {isProcessing && <LoadingIndicator />}
          {isProcessing ? 'Submitting Application...' : 'Submit Application'}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default LoanApplicationForm;
