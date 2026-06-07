export interface LoanLeadModel {
    id?: number;            
    fullName: string;       
    phone: string;          
    loanAmount: number;     
    loanPurpose: string;    
    status: "new" | "pending" | "approved" | "rejected"; 
    createdAt: string;      
}